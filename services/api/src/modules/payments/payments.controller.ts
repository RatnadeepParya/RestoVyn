import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import {
  CreatePaymentInput,
  SplitBillInput,
  RefundPaymentInput,
  createPaymentSchema,
  splitBillSchema,
  refundPaymentSchema,
} from "@restovyn/validation";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("payments")
@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Record payment for an invoice" })
  async createPayment(
    @Body() body: CreatePaymentInput,
    @CurrentUser() user: any,
  ) {
    const validated = createPaymentSchema.parse(body);
    return this.paymentsService.create(validated, user.staffId);
  }

  @Post("split")
  @ApiOperation({
    summary:
      "Process split bill payment with exact multi-tender reconciliation",
  })
  async splitBill(@Body() body: SplitBillInput, @CurrentUser() user: any) {
    const validated = splitBillSchema.parse(body);
    return this.paymentsService.splitBill(validated, user.staffId);
  }

  @Post("refund")
  @ApiOperation({
    summary: "Issue full or partial refund on a completed payment",
  })
  async refundPayment(
    @Body() body: RefundPaymentInput,
    @CurrentUser() user: any,
  ) {
    const validated = refundPaymentSchema.parse(body);
    return this.paymentsService.refund(validated, user.staffId);
  }
}
