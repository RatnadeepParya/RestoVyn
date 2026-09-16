import { Injectable, Logger } from "@nestjs/common";
import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentVerification,
  RefundRequest,
  RefundResult,
} from "@restovyn/types";
import * as crypto from "crypto";

@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(ManualPaymentProvider.name);

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    this.logger.log(
      `Recording internal/manual payment for invoice ${req.invoiceId}: amount ${req.amount}`,
    );
    return {
      success: true,
      paymentId: `PAY-MANUAL-${crypto.randomUUID()}`,
      transactionRef: req.notes || "CASH_OR_MANUAL_TERMINAL",
      amount: req.amount,
      currency: req.currency,
      status: "SUCCESS",
    };
  }

  async verifyPayment(
    params: Record<string, unknown>,
  ): Promise<PaymentVerification> {
    return {
      isValid: true,
      paymentId: String(params.paymentId || ""),
      transactionRef: String(params.transactionRef || ""),
      amount: Number(params.amount || 0),
      status: "SUCCESS",
    };
  }

  async refundPayment(req: RefundRequest): Promise<RefundResult> {
    this.logger.log(
      `Processing manual refund for payment ${req.paymentId}: amount ${req.amount}`,
    );
    return {
      success: true,
      refundId: `REF-MANUAL-${crypto.randomUUID()}`,
      amount: req.amount,
      status: "SUCCESS",
    };
  }
}
