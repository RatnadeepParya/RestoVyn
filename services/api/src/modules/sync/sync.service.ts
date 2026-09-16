import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { SyncPushBatch } from "@restovyn/validation";
import { SyncStatus } from "@restovyn/types";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processPushBatch(batch: SyncPushBatch) {
    const results: Array<{
      syncId: string;
      status: SyncStatus;
      message?: string;
    }> = [];

    for (const item of batch.items) {
      try {
        // Check idempotency in SyncQueue
        const existingSync = await this.prisma.syncQueue.findUnique({
          where: { syncId: item.syncId },
        });

        if (existingSync && existingSync.status === SyncStatus.APPLIED) {
          results.push({
            syncId: item.syncId,
            status: SyncStatus.APPLIED,
            message: "Already processed",
          });
          continue;
        }

        // Record in queue
        await this.prisma.syncQueue.upsert({
          where: { syncId: item.syncId },
          update: {
            retryCount: { increment: 1 },
          },
          create: {
            deviceId: batch.deviceId,
            syncId: item.syncId,
            entityName: item.entityName,
            operation: item.operation,
            payload: item.payload,
            status: SyncStatus.APPLIED,
            processedAt: new Date(),
          },
        });

        results.push({ syncId: item.syncId, status: SyncStatus.APPLIED });
      } catch (err: any) {
        this.logger.error(`Error processing sync item ${item.syncId}`, err);
        results.push({
          syncId: item.syncId,
          status: SyncStatus.FAILED,
          message: err.message,
        });
      }
    }

    return {
      deviceId: batch.deviceId,
      processedCount: results.length,
      items: results,
    };
  }

  async getDeltaPull(restaurantId: string, sinceDate?: Date) {
    const filter = sinceDate ? { updatedAt: { gte: sinceDate } } : {};

    const [categories, items, tables] = await Promise.all([
      this.prisma.menuCategory.findMany({
        where: { restaurantId, ...filter },
        include: { items: true },
      }),
      this.prisma.menuItem.findMany({
        where: { ...filter },
        include: { variants: true, modifiers: true, addons: true },
      }),
      this.prisma.table.findMany({
        where: { restaurantId, ...filter },
      }),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      categories,
      items,
      tables,
    };
  }
}
