import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(restaurantId?: string) {
    let restaurant = null;
    if (restaurantId) {
      restaurant = await this.prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
    }
    if (!restaurant) {
      restaurant = await this.prisma.restaurant.findFirst();
    }
    if (!restaurant) {
      throw new NotFoundException("Restaurant configuration not found");
    }
    return restaurant;
  }

  async updateSettings(restaurantId: string, settings: Record<string, any>) {
    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        settingsJson: settings,
      },
    });
  }
}
