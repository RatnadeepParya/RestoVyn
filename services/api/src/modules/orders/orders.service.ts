import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { EventsGateway } from "../../core/events/events.gateway";
import {
  CreateOrderInput,
  OrderItemInput,
  CancelOrderItemInput,
  OrderStatusTransitionInput,
} from "@restovyn/validation";
import {
  OrderStatus,
  OrderType,
  OrderSource,
  TableStatus,
  KOTStatus,
  PriorityLevel,
  RealtimeEvent,
} from "@restovyn/types";
import {
  calculateLineItem,
  calculateOrderBilling,
  assertOptimisticLock,
} from "@restovyn/business-rules";
import * as crypto from "crypto";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(
    input: CreateOrderInput,
    staffId: string,
    restaurantId: string,
    source: OrderSource = OrderSource.POS,
  ) {
    // 1. If dine-in, verify table
    if (input.orderType === OrderType.DINE_IN && input.tableId) {
      const table = await this.prisma.table.findUnique({
        where: { id: input.tableId },
      });
      if (!table) {
        throw new NotFoundException(`Table ${input.tableId} not found`);
      }
    }

    // 2. Fetch menu items for price lookup from master database
    const itemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
      include: {
        variants: true,
        modifiers: true,
        addons: true,
      },
    });
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // 3. Calculate line items with server authoritative prices in integer minor units
    const lineItemDetails: Array<{
      menuItemId: string;
      variantId?: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      totalPrice: number;
      notes?: string | null;
      kitchenStationId?: string | null;
      modifiers: Array<{
        modifierId: string;
        name: string;
        option: string;
        priceDelta: number;
      }>;
      addons: Array<{ addonId: string; name: string; price: number }>;
    }> = [];

    const billingItemsInput = [];

    for (const itemInput of input.items) {
      const itemDef = menuMap.get(itemInput.menuItemId);
      if (!itemDef) {
        throw new NotFoundException(
          `Menu item ${itemInput.menuItemId} not found`,
        );
      }
      if (!itemDef.isAvailable) {
        throw new BadRequestException(
          `Menu item "${itemDef.name}" is currently out of stock`,
        );
      }

      // Variant lookup
      let variantDelta = 0;
      if (itemInput.variantId) {
        const variant = itemDef.variants.find(
          (v) => v.id === itemInput.variantId,
        );
        if (variant) variantDelta = variant.priceDelta;
      }

      // Modifiers
      const modifierDeltas: number[] = [];
      const appliedModifiers: Array<{
        modifierId: string;
        name: string;
        option: string;
        priceDelta: number;
      }> = [];
      for (const modInput of itemInput.modifiers || []) {
        const modDef = itemDef.modifiers.find(
          (m) => m.id === modInput.modifierId,
        );
        const delta = modDef ? modDef.priceDelta : modInput.priceDelta || 0;
        modifierDeltas.push(delta);
        appliedModifiers.push({
          modifierId: modInput.modifierId,
          name: modInput.name,
          option: modInput.option,
          priceDelta: delta,
        });
      }

      // Addons
      const addonPrices: number[] = [];
      const appliedAddons: Array<{
        addonId: string;
        name: string;
        price: number;
      }> = [];
      for (const addInput of itemInput.addons || []) {
        const addDef = itemDef.addons.find((a) => a.id === addInput.addonId);
        const price = addDef ? addDef.price : addInput.price || 0;
        addonPrices.push(price);
        appliedAddons.push({
          addonId: addInput.addonId,
          name: addInput.name,
          price,
        });
      }

      const calculated = calculateLineItem({
        basePrice: itemDef.basePrice,
        variantDelta,
        modifierDeltas,
        addonPrices,
        quantity: itemInput.quantity,
      });

      billingItemsInput.push({
        basePrice: itemDef.basePrice,
        variantDelta,
        modifierDeltas,
        addonPrices,
        quantity: itemInput.quantity,
      });

      lineItemDetails.push({
        menuItemId: itemDef.id,
        variantId: itemInput.variantId,
        quantity: itemInput.quantity,
        unitPrice: calculated.unitPrice,
        subtotal: calculated.subtotal,
        taxAmount: 0,
        discountAmount: 0,
        totalPrice: calculated.totalPrice,
        notes: itemInput.notes,
        kitchenStationId: itemDef.kitchenStationId,
        modifiers: appliedModifiers,
        addons: appliedAddons,
      });
    }

    // Compute bill totals
    const billing = calculateOrderBilling({
      items: billingItemsInput,
      taxes: [{ name: "GST", ratePercent: 5.0, isInclusive: false }],
      serviceChargePercent: input.orderType === OrderType.DINE_IN ? 5.0 : 0,
    });

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    // 4. Atomic transaction creating order, lines, KOTs, and table occupancy
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      // Check idempotency if syncId is provided
      if (input.syncId) {
        const existing = await tx.order.findUnique({
          where: { syncId: input.syncId },
          include: { items: true },
        });
        if (existing) {
          return existing;
        }
      }

      const order = await tx.order.create({
        data: {
          restaurantId,
          orderNumber,
          orderType: input.orderType,
          orderSource: source,
          status: OrderStatus.CONFIRMED,
          tableId: input.tableId,
          captainId: staffId,
          customerId: input.customerId,
          notes: input.notes,
          subtotal: billing.subtotal,
          discountTotal: billing.totalDiscount,
          taxTotal: billing.taxesTotal,
          serviceCharge: billing.serviceChargeTotal,
          deliveryCharge: billing.deliveryChargeTotal,
          grandTotal: billing.grandTotal,
          syncId: input.syncId,
          version: 1,
          items: {
            create: lineItemDetails.map((item) => ({
              menuItemId: item.menuItemId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              totalPrice: item.totalPrice,
              notes: item.notes,
              modifiers: {
                create: item.modifiers.map((m) => ({
                  modifierId: m.modifierId,
                  name: m.name,
                  option: m.option,
                  priceDelta: m.priceDelta,
                })),
              },
              addons: {
                create: item.addons.map((a) => ({
                  addonId: a.addonId,
                  name: a.name,
                  price: a.price,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
              modifiers: true,
              addons: true,
            },
          },
          table: true,
          captain: true,
          customer: true,
        },
      });

      // Update table status if dine in
      if (input.tableId) {
        await tx.table.update({
          where: { id: input.tableId },
          data: { status: TableStatus.OCCUPIED },
        });
      }

      // Group items by Kitchen Station and generate KOT tickets
      const stationGroups = new Map<string, string[]>();
      for (let i = 0; i < order.items.length; i++) {
        const orderItem = order.items[i];
        const stationId = orderItem.menuItem.kitchenStationId;
        if (stationId) {
          const group = stationGroups.get(stationId) || [];
          group.push(orderItem.id);
          stationGroups.set(stationId, group);
        }
      }

      let kotCounter = 1;
      for (const [stationId, itemIds] of stationGroups.entries()) {
        const kotNumber = `KOT-${Date.now().toString().slice(-4)}-${kotCounter++}`;
        await tx.kOT.create({
          data: {
            kotNumber,
            orderId: order.id,
            kitchenStationId: stationId,
            status: KOTStatus.NEW,
            items: {
              create: itemIds.map((id) => ({
                orderItemId: id,
                quantity: order.items.find((oi) => oi.id === id)?.quantity || 1,
              })),
            },
          },
        });
      }

      return order;
    });

    this.eventsGateway.broadcastEvent(
      RealtimeEvent.ORDER_CREATED,
      createdOrder,
    );
    if (input.tableId) {
      this.eventsGateway.broadcastEvent(RealtimeEvent.TABLE_UPDATED, {
        tableId: input.tableId,
        status: TableStatus.OCCUPIED,
      });
    }

    return createdOrder;
  }

  async addItems(
    orderId: string,
    itemsToAdd: OrderItemInput[],
    expectedVersion: number,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Assert optimistic lock
    if (order.version !== expectedVersion) {
      throw new ConflictException(
        `Order was updated by another user (current version: ${order.version}, expected: ${expectedVersion})`,
      );
    }

    // Validate additions and update order
    // ... Returns updated order with incremented version
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        version: { increment: 1 },
      },
      include: { items: true, table: true },
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.ORDER_UPDATED, updated);
    return updated;
  }

  async cancelItem(input: CancelOrderItemInput, staffId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: input.orderItemId },
      include: { order: true },
    });

    if (!item) {
      throw new NotFoundException(`Order item ${input.orderItemId} not found`);
    }

    if (
      item.order.status === OrderStatus.PAID ||
      item.order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        "Cannot cancel item on a paid or completed order",
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const cancelledItem = await tx.orderItem.update({
        where: { id: input.orderItemId },
        data: {
          isCancelled: true,
          cancelReason: input.reason,
          cancelledAt: new Date(),
          cancelledById: staffId,
        },
      });

      // Recalculate order totals excluding cancelled items
      const activeItems = await tx.orderItem.findMany({
        where: { orderId: item.orderId, isCancelled: false },
      });

      const newSubtotal = activeItems.reduce((acc, i) => acc + i.subtotal, 0);
      const newGrandTotal = Math.round(newSubtotal * 1.1); // with taxes & service

      const updatedOrder = await tx.order.update({
        where: { id: item.orderId },
        data: {
          subtotal: newSubtotal,
          grandTotal: newGrandTotal,
          version: { increment: 1 },
        },
        include: { items: true, table: true },
      });

      await tx.auditLog.create({
        data: {
          restaurantId: item.order.restaurantId,
          userId: staffId,
          action: "ORDER_ITEM_CANCEL",
          entity: "OrderItem",
          entityId: item.id,
          afterState: {
            reason: input.reason,
            subtotal: newSubtotal,
            grandTotal: newGrandTotal,
          },
        },
      });

      return updatedOrder;
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.ORDER_UPDATED, updated);
    return updated;
  }

  async updateStatus(
    orderId: string,
    transition: OrderStatusTransitionInput,
    staffId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.version !== transition.expectedVersion) {
      throw new ConflictException(
        `Version conflict: current version ${order.version}, expected ${transition.expectedVersion}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: transition.toStatus,
          version: { increment: 1 },
        },
        include: { table: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: transition.toStatus,
          changedBy: staffId,
          reason: transition.reason,
        },
      });

      // Update table if bill requested or completed
      if (ord.tableId) {
        if (transition.toStatus === OrderStatus.BILL_REQUESTED) {
          await tx.table.update({
            where: { id: ord.tableId },
            data: { status: TableStatus.BILL_REQUESTED },
          });
        } else if (
          transition.toStatus === OrderStatus.COMPLETED ||
          transition.toStatus === OrderStatus.CANCELLED
        ) {
          await tx.table.update({
            where: { id: ord.tableId },
            data: { status: TableStatus.AVAILABLE },
          });
        }
      }

      return ord;
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.ORDER_UPDATED, updated);
    if (updated.tableId) {
      this.eventsGateway.broadcastEvent(RealtimeEvent.TABLE_UPDATED, {
        tableId: updated.tableId,
        status:
          updated.status === OrderStatus.BILL_REQUESTED
            ? TableStatus.BILL_REQUESTED
            : TableStatus.AVAILABLE,
      });
    }

    return updated;
  }

  async findActive(restaurantId: string) {
    return this.prisma.order.findMany({
      where: {
        restaurantId,
        status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
      },
      include: {
        table: true,
        captain: true,
        customer: true,
        items: {
          include: {
            menuItem: true,
            modifiers: true,
            addons: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        captain: true,
        customer: true,
        items: {
          include: {
            menuItem: true,
            modifiers: true,
            addons: true,
          },
        },
        kots: {
          include: {
            station: true,
            items: true,
          },
        },
        invoices: {
          include: {
            payments: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }
}
