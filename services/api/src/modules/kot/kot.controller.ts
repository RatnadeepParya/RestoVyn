import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { KotService } from "./kot.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("kot")
@Controller("kot")
@UseGuards(JwtAuthGuard)
export class KotController {
  constructor(private readonly kotService: KotService) {}

  @Get("order/:orderId")
  @ApiOperation({ summary: "Get all station KOTs for an order" })
  async getKotsByOrder(@Param("orderId") orderId: string) {
    return this.kotService.findByOrderId(orderId);
  }

  @Patch(":id/printed")
  @ApiOperation({ summary: "Mark KOT as successfully printed" })
  async markPrinted(@Param("id") id: string) {
    return this.kotService.markPrinted(id);
  }
}
