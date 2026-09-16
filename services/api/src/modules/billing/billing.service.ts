import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { EventsGateway } from "../../core/events/events.gateway";
import { OrderStatus, TableStatus, RealtimeEvent } from "@restovyn/types";
import { calculateOrderBilling } from "@restovyn/business-rules";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async generateInvoice(orderId: string, staffId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        items: {
          where: { isCancelled: false },
          include: {
            menuItem: true,
            modifiers: true,
            addons: true,
          },
        },
        table: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot bill order in status ${order.status}`,
      );
    }

    // Check if invoice already generated
    const existing = await this.prisma.invoice.findFirst({
      where: { orderId, isVoid: false },
      include: { items: true, payments: true },
    });
    if (existing) {
      return existing;
    }

    // Perform exact calculation using shared pure business rules
    const billingItems = order.items.map((i) => ({
      basePrice: i.menuItem.basePrice,
      variantDelta: 0,
      modifierDeltas: i.modifiers.map((m) => m.priceDelta),
      addonPrices: i.addons.map((a) => a.price),
      quantity: i.quantity,
    }));

    const billingResult = calculateOrderBilling({
      items: billingItems,
      taxes: [{ name: "GST", ratePercent: 5.0, isInclusive: false }],
      serviceChargePercent: order.orderType === "DINE_IN" ? 5.0 : 0,
    });

    const invoiceNumber = `${order.restaurant.invoicePrefix}${Date.now().toString().slice(-6)}`;

    const invoice = await this.prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          restaurantId: order.restaurantId,
          orderId: order.id,
          invoiceNumber,
          customerId: order.customerId,
          subtotal: billingResult.subtotal,
          discountTotal: billingResult.totalDiscount,
          taxTotal: billingResult.taxesTotal,
          serviceCharge: billingResult.serviceChargeTotal,
          deliveryCharge: billingResult.deliveryChargeTotal,
          grandTotal: billingResult.grandTotal,
          paidAmount: 0,
          dueAmount: billingResult.grandTotal,
          isPaid: false,
          items: {
            create: order.items.map((item) => ({
              name: item.menuItem.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: { items: true, order: true },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.BILLED,
          version: { increment: 1 },
        },
      });

      if (order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: { status: TableStatus.BILL_REQUESTED },
        });
      }

      return inv;
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.ORDER_UPDATED, {
      orderId: order.id,
      status: OrderStatus.BILLED,
    });
    if (order.tableId) {
      this.eventsGateway.broadcastEvent(RealtimeEvent.TABLE_UPDATED, {
        tableId: order.tableId,
        status: TableStatus.BILL_REQUESTED,
      });
    }

    return invoice;
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        payments: { include: { refunds: true } },
        order: { include: { table: true, captain: true } },
      },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }
}
