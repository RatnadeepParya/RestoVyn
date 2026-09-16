import { z } from "zod";
import { PaymentMethod } from "@restovyn/types";

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z
    .number()
    .int()
    .min(1, "Amount must be greater than zero in minor units"),
  transactionRef: z.string().max(100).optional().nullable(),
  idempotencyKey: z.string().uuid("Idempotency key must be a valid UUID"),
});

export const splitPaymentItemSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().int().min(1, "Payment amount must be greater than zero"),
  transactionRef: z.string().optional().nullable(),
});

export const splitBillSchema = z.object({
  invoiceId: z.string().uuid(),
  payments: z
    .array(splitPaymentItemSchema)
    .min(2, "Split bill requires at least 2 payments"),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().int().min(1, "Refund amount must be positive"),
  reason: z.string().min(3, "Refund reason is required"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type SplitBillInput = z.infer<typeof splitBillSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
