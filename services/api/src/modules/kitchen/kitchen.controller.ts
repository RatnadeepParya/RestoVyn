import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { KitchenService } from "./kitchen.service";
import { KOTStatus, PriorityLevel } from "@restovyn/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("kitchen")
@Controller("kitchen")
@UseGuards(JwtAuthGuard)
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get("kds")
  @ApiOperation({ summary: "Get live Kitchen Display System (KDS) tickets" })
  async getKds(@CurrentUser() user: any, @Query("station") station?: string) {
    return this.kitchenService.getActiveKDS(user.restaurantId, station);
  }

  @Patch("kot/:id/status")
  @ApiOperation({
    summary: "Update KOT ticket status (PREPARING, READY, COMPLETED)",
  })
  async updateKOTStatus(
    @Param("id") id: string,
    @Body("status") status: KOTStatus,
  ) {
    return this.kitchenService.updateKOTStatus(id, status);
  }

  @Patch("kot/:id/priority")
  @ApiOperation({ summary: "Update KOT priority (NORMAL, HIGH, URGENT)" })
  async updatePriority(
    @Param("id") id: string,
    @Body("priority") priority: PriorityLevel,
  ) {
    return this.kitchenService.updatePriority(id, priority);
  }
}
