import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("billing")
@Controller("billing")
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("generate/:orderId")
  @ApiOperation({ summary: "Generate final invoice for an order" })
  async generateInvoice(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.billingService.generateInvoice(orderId, user.staffId);
  }

  @Get("invoice/:id")
  @ApiOperation({ summary: "Get invoice details by invoice ID" })
  async getInvoice(@Param("id") id: string) {
    return this.billingService.getInvoice(id);
  }
}
