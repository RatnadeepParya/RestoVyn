import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { calculateCashDrawerSession } from "@restovyn/business-rules";

@Injectable()
export class CashierService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveSession(staffId: string) {
    return this.prisma.cashSession.findFirst({
      where: { staffId, closedAt: null },
      include: { transactions: true },
      orderBy: { openedAt: "desc" },
    });
  }

  async openSession(
    staffId: string,
    restaurantId: string,
    openingCash: number,
  ) {
    const existing = await this.getActiveSession(staffId);
    if (existing) {
      throw new BadRequestException(
        "Cashier already has an active open cash session",
      );
    }

    return this.prisma.cashSession.create({
      data: {
        restaurantId,
        staffId,
        openingCash,
        transactions: {
          create: {
            txType: "OPENING_FLOAT",
            amount: openingCash,
            reason: "Initial register float",
          },
        },
      },
      include: { transactions: true },
    });
  }

  async closeSession(
    sessionId: string,
    actualClosingCash: number,
    notes?: string,
  ) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { transactions: true },
    });

    if (!session) {
      throw new NotFoundException(`Cash session ${sessionId} not found`);
    }

    if (session.closedAt) {
      throw new BadRequestException("Cash session is already closed");
    }

    let cashSales = 0;
    let cashRefunds = 0;
    let cashExpenses = 0;
    let cashAdjustments = 0;

    for (const tx of session.transactions) {
      if (tx.txType === "CASH_SALE") cashSales += tx.amount;
      else if (tx.txType === "REFUND") cashRefunds += Math.abs(tx.amount);
      else if (tx.txType === "EXPENSE") cashExpenses += Math.abs(tx.amount);
      else if (tx.txType !== "OPENING_FLOAT") cashAdjustments += tx.amount;
    }

    const calculated = calculateCashDrawerSession({
      openingCash: session.openingCash,
      cashSales,
      cashRefunds,
      cashExpenses,
      cashAdjustments,
      actualClosingCash,
    });

    return this.prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        closingCash: actualClosingCash,
        expectedClosing: calculated.expectedClosingCash,
        difference: calculated.difference,
        closedAt: new Date(),
        notes,
      },
    });
  }
}
