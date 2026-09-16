import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RestaurantService } from "./restaurant.service";
import {
  JwtAuthGuard,
  IS_PUBLIC_KEY,
} from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { StaffRole } from "@restovyn/types";
import { SetMetadata } from "@nestjs/common";

@ApiTags("restaurant")
@Controller("restaurant")
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Get("profile")
  @ApiOperation({
    summary: "Get active restaurant profile and operational settings",
  })
  async getProfile() {
    return this.restaurantService.getProfile();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.MANAGER)
  @Patch("settings")
  @ApiOperation({
    summary: "Update restaurant configuration (Owner & Manager only)",
  })
  async updateSettings(
    @CurrentUser() user: any,
    @Body() body: Record<string, any>,
  ) {
    return this.restaurantService.updateSettings(user.restaurantId, body);
  }
}
