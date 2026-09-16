import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SyncService } from "./sync.service";
import { SyncPushBatch, syncPushBatchSchema } from "@restovyn/validation";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("sync")
@Controller("sync")
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("push")
  @ApiOperation({
    summary: "Ingest offline POS queue batch with idempotency validation",
  })
  async pushQueue(@Body() body: SyncPushBatch) {
    const validated = syncPushBatchSchema.parse(body);
    return this.syncService.processPushBatch(validated);
  }

  @Get("pull")
  @ApiOperation({
    summary:
      "Pull delta changes since last sync timestamp for local SQLite update",
  })
  async pullDelta(@CurrentUser() user: any, @Query("since") since?: string) {
    const sinceDate = since ? new Date(since) : undefined;
    return this.syncService.getDeltaPull(user.restaurantId, sinceDate);
  }
}
