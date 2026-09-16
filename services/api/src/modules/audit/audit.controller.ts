import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { StaffRole } from "@restovyn/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("audit")
@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(StaffRole.OWNER, StaffRole.MANAGER)
  @Get()
  @ApiOperation({
    summary: "View immutable system audit logs (Owner & Manager only)",
  })
  async getAuditLogs(
    @CurrentUser() user: any,
    @Query("action") action?: string,
    @Query("limit") limit?: number,
  ) {
    return this.auditService.findAll(
      user.restaurantId,
      action,
      limit ? Number(limit) : 50,
    );
  }
}
