import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { MenuService } from "./menu.service";
import {
  JwtAuthGuard,
  IS_PUBLIC_KEY,
} from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { StaffRole } from "@restovyn/types";
import { SetMetadata } from "@nestjs/common";

@ApiTags("menu")
@Controller("menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Get("catalog")
  @ApiOperation({
    summary:
      "Get complete menu catalog with categories, variants, modifiers, and addons",
  })
  async getCatalog() {
    return this.menuService.getCatalog();
  }

  @UseGuards(JwtAuthGuard)
  @Get("items/:id")
  @ApiOperation({
    summary: "Get detailed item view with recipe and kitchen station",
  })
  async getItemById(@Param("id") id: string) {
    return this.menuService.findItem(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.MANAGER, StaffRole.KITCHEN)
  @Patch("items/:id/availability")
  @ApiOperation({ summary: "Mark menu item available or out-of-stock" })
  async toggleAvailability(
    @Param("id") id: string,
    @Body("isAvailable") isAvailable: boolean,
  ) {
    return this.menuService.toggleItemAvailability(id, isAvailable);
  }
}
