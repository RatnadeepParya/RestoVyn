import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { EventsGateway } from "../../core/events/events.gateway";
import { KOTStatus, PriorityLevel, RealtimeEvent } from "@restovyn/types";

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getActiveKDS(restaurantId: string, stationCode?: string) {
    return this.prisma.kOT.findMany({
      where: {
        order: { restaurantId },
        status: { notIn: [KOTStatus.COMPLETED, KOTStatus.CANCELLED] },
        station: stationCode ? { code: stationCode } : undefined,
      },
      include: {
        station: true,
        order: {
          include: {
            table: true,
            captain: true,
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                menuItem: true,
                modifiers: true,
                addons: true,
              },
            },
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });
  }

  async updateKOTStatus(kotId: string, status: KOTStatus) {
    const kot = await this.prisma.kOT.findUnique({ where: { id: kotId } });
    if (!kot) {
      throw new NotFoundException(`KOT ${kotId} not found`);
    }

    const updated = await this.prisma.kOT.update({
      where: { id: kotId },
      data: { status },
      include: {
        station: true,
        order: { include: { table: true } },
      },
    });

    const event =
      status === KOTStatus.READY
        ? RealtimeEvent.KOT_READY
        : RealtimeEvent.KOT_UPDATED;
    this.eventsGateway.broadcastEvent(event, updated);

    return updated;
  }

  async updatePriority(kotId: string, priority: PriorityLevel) {
    const updated = await this.prisma.kOT.update({
      where: { id: kotId },
      data: { priority },
      include: { station: true, order: true },
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.KOT_UPDATED, updated);
    return updated;
  }
}
