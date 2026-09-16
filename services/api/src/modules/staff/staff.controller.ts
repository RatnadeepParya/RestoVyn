import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { StaffService } from "./staff.service";
import { StaffRole } from "@restovyn/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../../common/guards/jwt-auth.guard";

@ApiTags("staff")
@Controller("staff")
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Get("pos-list")
  @ApiOperation({
    summary: "Get active staff list for fast POS PIN switch screen",
  })
  async getPosStaffList(@Query("restaurantId") restaurantId?: string) {
    // If restaurantId not provided in query, look up default
    const targetRestaurantId =
      restaurantId ||
      (await this.staffService.findAll("", undefined)).at(0)?.restaurantId ||
      "";
    return this.staffService.findForPosSelection(targetRestaurantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: "List all restaurant staff with roles" })
  async getAllStaff(@CurrentUser() user: any, @Query("role") role?: StaffRole) {
    return this.staffService.findAll(user.restaurantId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiOperation({ summary: "Get staff detail by ID" })
  async getStaffById(@Param("id") id: string) {
    return this.staffService.findOne(id);
  }
}
