import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("reports")
@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard")
  @ApiOperation({
    summary: "Get live executive operational metrics for admin dashboard",
  })
  async getDashboardMetrics(@CurrentUser() user: any) {
    return this.reportsService.getDashboardMetrics(user.restaurantId);
  }
}
