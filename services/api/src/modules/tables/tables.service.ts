import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { EventsGateway } from "../../core/events/events.gateway";
import { TableStatus, RealtimeEvent, OrderStatus } from "@restovyn/types";

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async findAll(restaurantId?: string, floorId?: string) {
    return this.prisma.table.findMany({
      where: {
        restaurantId: restaurantId || undefined,
        floorId: floorId || undefined,
        isActive: true,
      },
      include: {
        floor: true,
        section: true,
        orders: {
          where: {
            status: {
              notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
            },
          },
          include: {
            captain: true,
            customer: true,
          },
          take: 1,
        },
      },
      orderBy: { tableNumber: "asc" },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        floor: true,
        section: true,
        orders: {
          where: {
            status: {
              notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
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
            captain: true,
            customer: true,
          },
          take: 1,
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table ${id} not found`);
    }
    return table;
  }

  async updateStatus(id: string, status: TableStatus, staffId?: string) {
    const updated = await this.prisma.table.update({
      where: { id },
      data: { status },
      include: { floor: true },
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.TABLE_UPDATED, updated);
    return updated;
  }

  async transferTable(
    fromTableId: string,
    toTableId: string,
    staffId: string,
    reason?: string,
  ) {
    const [sourceTable, targetTable] = await Promise.all([
      this.prisma.table.findUnique({ where: { id: fromTableId } }),
      this.prisma.table.findUnique({ where: { id: toTableId } }),
    ]);

    if (!sourceTable || !targetTable) {
      throw new NotFoundException("Source or target table not found");
    }

    if (targetTable.status !== TableStatus.AVAILABLE) {
      throw new BadRequestException(
        `Target table ${targetTable.tableNumber} is not available (Status: ${targetTable.status})`,
      );
    }

    // Find active order on source table
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        tableId: fromTableId,
        status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
      },
    });

    if (!activeOrder) {
      throw new BadRequestException(
        `No active order found on table ${sourceTable.tableNumber}`,
      );
    }

    // Execute atomic transfer in a Prisma transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Move order to target table
      const updatedOrder = await tx.order.update({
        where: { id: activeOrder.id },
        data: { tableId: toTableId },
      });

      // 2. Mark source table AVAILABLE
      const updatedSource = await tx.table.update({
        where: { id: fromTableId },
        data: { status: TableStatus.AVAILABLE },
      });

      // 3. Mark target table OCCUPIED
      const updatedTarget = await tx.table.update({
        where: { id: toTableId },
        data: { status: TableStatus.OCCUPIED },
      });

      // 4. Record audit log
      await tx.auditLog.create({
        data: {
          restaurantId: sourceTable.restaurantId,
          action: "TABLE_TRANSFER",
          entity: "Table",
          entityId: fromTableId,
          beforeState: {
            tableId: fromTableId,
            tableNumber: sourceTable.tableNumber,
          },
          afterState: {
            tableId: toTableId,
            tableNumber: targetTable.tableNumber,
            orderId: activeOrder.id,
            reason,
          },
        },
      });

      return { updatedOrder, updatedSource, updatedTarget };
    });

    this.eventsGateway.broadcastEvent(
      RealtimeEvent.TABLE_UPDATED,
      result.updatedSource,
    );
    this.eventsGateway.broadcastEvent(
      RealtimeEvent.TABLE_UPDATED,
      result.updatedTarget,
    );
    this.eventsGateway.broadcastEvent(
      RealtimeEvent.ORDER_UPDATED,
      result.updatedOrder,
    );

    return result;
  }
}
