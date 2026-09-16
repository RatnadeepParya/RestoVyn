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
  CreatePaymentInput,
  SplitBillInput,
  RefundPaymentInput,
} from "@restovyn/validation";
import {
  PaymentStatus,
  OrderStatus,
  TableStatus,
  RealtimeEvent,
} from "@restovyn/types";
import { validateSplitPayments } from "@restovyn/business-rules";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(input: CreatePaymentInput, staffId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      include: {
        payments: true,
        order: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${input.invoiceId} not found`);
    }

    if (invoice.isPaid) {
      throw new BadRequestException("Invoice is already fully paid");
    }

    if (input.amount > invoice.dueAmount) {
      throw new BadRequestException(
        `Payment amount (${input.amount}) exceeds outstanding due (${invoice.dueAmount})`,
      );
    }

    // Check idempotency
    if (input.idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          paymentMethod: input.paymentMethod,
          amount: input.amount,
          status: PaymentStatus.SUCCESS,
          transactionRef: input.transactionRef,
          idempotencyKey: input.idempotencyKey,
          receivedBy: staffId,
          allocations: {
            create: {
              amount: input.amount,
            },
          },
        },
      });

      const newPaidAmount = invoice.paidAmount + input.amount;
      const newDueAmount = Math.max(0, invoice.grandTotal - newPaidAmount);
      const isFullyPaid = newDueAmount === 0;

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          isPaid: isFullyPaid,
        },
      });

      let updatedOrder = null;
      if (isFullyPaid) {
        updatedOrder = await tx.order.update({
          where: { id: invoice.orderId },
          data: {
            status: OrderStatus.PAID,
            version: { increment: 1 },
          },
        });

        if (invoice.order.tableId) {
          await tx.table.update({
            where: { id: invoice.order.tableId },
            data: { status: TableStatus.AVAILABLE },
          });
        }
      }

      return { payment, updatedInvoice, updatedOrder };
    });

    this.eventsGateway.broadcastEvent(
      RealtimeEvent.PAYMENT_UPDATED,
      result.payment,
    );
    if (result.updatedOrder) {
      this.eventsGateway.broadcastEvent(
        RealtimeEvent.ORDER_UPDATED,
        result.updatedOrder,
      );
      if (invoice.order.tableId) {
        this.eventsGateway.broadcastEvent(RealtimeEvent.TABLE_UPDATED, {
          tableId: invoice.order.tableId,
          status: TableStatus.AVAILABLE,
        });
      }
    }

    return result;
  }

  async splitBill(input: SplitBillInput, staffId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { order: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${input.invoiceId} not found`);
    }

    if (invoice.isPaid) {
      throw new BadRequestException("Invoice is already paid");
    }

    const amounts = input.payments.map((p) => p.amount);
    const reconciliation = validateSplitPayments(invoice.dueAmount, amounts);
    if (!reconciliation.isBalanced) {
      throw new BadRequestException(
        `Split payments sum (${reconciliation.allocatedTotal}) does not match due amount (${reconciliation.grandTotal}). Discrepancy: ${reconciliation.difference}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const createdPayments = [];
      for (const p of input.payments) {
        const pay = await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            paymentMethod: p.paymentMethod,
            amount: p.amount,
            status: PaymentStatus.SUCCESS,
            transactionRef: p.transactionRef,
            receivedBy: staffId,
            allocations: { create: { amount: p.amount } },
          },
        });
        createdPayments.push(pay);
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: invoice.grandTotal,
          dueAmount: 0,
          isPaid: true,
        },
      });

      await tx.order.update({
        where: { id: invoice.orderId },
        data: {
          status: OrderStatus.PAID,
          version: { increment: 1 },
        },
      });

      if (invoice.order.tableId) {
        await tx.table.update({
          where: { id: invoice.order.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
      }

      return createdPayments;
    });

    this.eventsGateway.broadcastEvent(RealtimeEvent.PAYMENT_UPDATED, {
      invoiceId: invoice.id,
      payments: result,
    });
    this.eventsGateway.broadcastEvent(RealtimeEvent.ORDER_UPDATED, {
      orderId: invoice.orderId,
      status: OrderStatus.PAID,
    });

    return result;
  }

  async refund(input: RefundPaymentInput, staffId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: input.paymentId },
      include: { refunds: true, invoice: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${input.paymentId} not found`);
    }

    const totalRefunded = payment.refunds.reduce((acc, r) => acc + r.amount, 0);
    const refundableBalance = payment.amount - totalRefunded;

    if (input.amount > refundableBalance) {
      throw new BadRequestException(
        `Refund amount (${input.amount}) exceeds refundable balance (${refundableBalance})`,
      );
    }

    const refund = await this.prisma.$transaction(async (tx) => {
      const ref = await tx.refund.create({
        data: {
          paymentId: payment.id,
          amount: input.amount,
          reason: input.reason,
          refundedBy: staffId,
        },
      });

      const newTotalRefunded = totalRefunded + input.amount;
      const isFullRefund = newTotalRefunded === payment.amount;

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PARTIALLY_REFUNDED,
        },
      });

      await tx.auditLog.create({
        data: {
          restaurantId: payment.invoice.restaurantId,
          userId: staffId,
          action: "PAYMENT_REFUND",
          entity: "Payment",
          entityId: payment.id,
          afterState: { refundAmount: input.amount, reason: input.reason },
        },
      });

      return ref;
    });

    return refund;
  }
}
