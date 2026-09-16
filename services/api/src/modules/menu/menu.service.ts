import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { EventsGateway } from "../../core/events/events.gateway";
import { RealtimeEvent } from "@restovyn/types";

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getCatalog(restaurantId?: string) {
    return this.prisma.menuCategory.findMany({
      where: {
        restaurantId: restaurantId || undefined,
        isActive: true,
      },
      include: {
        items: {
          include: {
            variants: true,
            modifiers: true,
            addons: true,
            kitchenStation: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  async findItem(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        kitchenStation: true,
        variants: true,
        modifiers: true,
        addons: true,
        recipe: {
          include: {
            items: {
              include: { ingredient: { include: { unit: true } } },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }
    return item;
  }

  async toggleItemAvailability(id: string, isAvailable: boolean) {
    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
      include: { category: true },
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.MENU_UPDATED, {
      itemId: updated.id,
      isAvailable: updated.isAvailable,
    });

    return updated;
  }
}
