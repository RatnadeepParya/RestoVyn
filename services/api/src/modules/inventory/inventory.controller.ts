import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InventoryService } from "./inventory.service";
import { StockMovementType, WastageReason } from "@restovyn/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("inventory")
@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("ingredients")
  @ApiOperation({
    summary: "List all raw ingredients with current stock balances",
  })
  async getIngredients(@CurrentUser() user: any) {
    return this.inventoryService.findAll(user.restaurantId);
  }

  @Post("stock-movement")
  @ApiOperation({ summary: "Record manual stock movement or adjustment" })
  async recordStockMovement(
    @Body()
    body: {
      ingredientId: string;
      movementType: StockMovementType;
      quantity: number;
      reason?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.recordStockMovement({
      ...body,
      createdById: user.staffId,
    });
  }

  @Post("wastage")
  @ApiOperation({ summary: "Record kitchen wastage and spoilage" })
  async recordWastage(
    @Body()
    body: { ingredientId: string; quantity: number; reason: WastageReason },
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.recordWastage({
      ...body,
      createdById: user.staffId,
    });
  }
}
