import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { TablesService } from "./tables.service";
import { TableStatus } from "@restovyn/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("tables")
@Controller("tables")
@UseGuards(JwtAuthGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiOperation({
    summary: "List all restaurant tables with live occupancy status",
  })
  async getTables(
    @CurrentUser() user: any,
    @Query("floorId") floorId?: string,
  ) {
    return this.tablesService.findAll(user.restaurantId, floorId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get single table details with active order" })
  async getTableById(@Param("id") id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(":id/status")
  @ApiOperation({
    summary:
      "Update table status (AVAILABLE, OCCUPIED, BILL_REQUESTED, CLEANING)",
  })
  async updateTableStatus(
    @Param("id") id: string,
    @Body("status") status: TableStatus,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.updateStatus(id, status, user.staffId);
  }

  @Post("transfer")
  @ApiOperation({ summary: "Transfer active table order to another table" })
  async transferTable(
    @Body() body: { fromTableId: string; toTableId: string; reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.tablesService.transferTable(
      body.fromTableId,
      body.toTableId,
      user.staffId,
      body.reason,
    );
  }
}
