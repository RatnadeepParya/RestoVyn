import { z } from "zod";

export const syncQueueItemSchema = z.object({
  deviceId: z.string().min(1),
  syncId: z.string().uuid(),
  entityName: z.enum([
    "Order",
    "Payment",
    "KOT",
    "Customer",
    "Expense",
    "StockMovement",
  ]),
  operation: z.enum(["CREATE", "UPDATE", "CANCEL"]),
  payload: z.record(z.any()),
  createdAt: z.string().datetime().optional(),
});

export const syncPushBatchSchema = z.object({
  deviceId: z.string().min(1),
  items: z.array(syncQueueItemSchema),
});

export type SyncQueueItem = z.infer<typeof syncQueueItemSchema>;
export type SyncPushBatch = z.infer<typeof syncPushBatchSchema>;
