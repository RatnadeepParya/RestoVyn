import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CashierService } from "./cashier.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("cashier")
@Controller("cashier")
@UseGuards(JwtAuthGuard)
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Get("session")
  @ApiOperation({ summary: "Get current active cash drawer session" })
  async getActiveSession(@CurrentUser() user: any) {
    return this.cashierService.getActiveSession(user.staffId);
  }

  @Post("session/open")
  @ApiOperation({
    summary: "Open a new cash drawer session with opening float",
  })
  async openSession(
    @Body("openingCash") openingCash: number,
    @CurrentUser() user: any,
  ) {
    return this.cashierService.openSession(
      user.staffId,
      user.restaurantId,
      openingCash,
    );
  }

  @Patch("session/:id/close")
  @ApiOperation({
    summary: "Close cash drawer session and reconcile expected vs actual cash",
  })
  async closeSession(
    @Param("id") id: string,
    @Body("actualClosingCash") actualClosingCash: number,
    @Body("notes") notes?: string,
  ) {
    return this.cashierService.closeSession(id, actualClosingCash, notes);
  }
}
