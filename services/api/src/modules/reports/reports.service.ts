import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { OrderStatus, TableStatus, PaymentStatus } from "@restovyn/types";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ordersToday,
      activeTables,
      occupiedTables,
      pendingKots,
      paymentsToday,
      lowStockIngredients,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: today },
        },
      }),
      this.prisma.table.count({
        where: { restaurantId, isActive: true },
      }),
      this.prisma.table.count({
        where: { restaurantId, status: TableStatus.OCCUPIED },
      }),
      this.prisma.kOT.count({
        where: {
          order: { restaurantId },
          status: { in: ["NEW", "ACCEPTED", "PREPARING"] },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          invoice: { restaurantId },
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: today },
        },
      }),
      this.prisma.ingredient.findMany({
        where: {
          restaurantId,
          currentStock: { lte: 10.0 },
        },
        include: { unit: true },
        take: 5,
      }),
    ]);

    let todaySales = 0;
    let cashCollection = 0;
    let cardCollection = 0;
    let upiCollection = 0;

    for (const p of paymentsToday) {
      todaySales += p.amount;
      if (p.paymentMethod === "CASH") cashCollection += p.amount;
      else if (p.paymentMethod === "CARD") cardCollection += p.amount;
      else if (p.paymentMethod === "UPI") upiCollection += p.amount;
    }

    const completedOrders = ordersToday.filter(
      (o) =>
        o.status === OrderStatus.COMPLETED || o.status === OrderStatus.PAID,
    );
    const averageOrderValue =
      completedOrders.length > 0
        ? Math.round(todaySales / completedOrders.length)
        : 0;

    return {
      todaySales, // in integer minor units (paise/cents)
      todayOrdersCount: ordersToday.length,
      averageOrderValue,
      activeTables,
      occupiedTables,
      pendingKots,
      cashCollection,
      cardCollection,
      upiCollection,
      lowStockIngredients,
    };
  }
}
