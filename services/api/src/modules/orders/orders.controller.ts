import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import {
  CreateOrderInput,
  CancelOrderItemInput,
  OrderStatusTransitionInput,
  createOrderSchema,
  cancelOrderItemSchema,
  orderStatusTransitionSchema,
} from "@restovyn/validation";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("orders")
@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new dine-in, takeaway, or delivery order",
  })
  async createOrder(@Body() body: CreateOrderInput, @CurrentUser() user: any) {
    const validated = createOrderSchema.parse(body);
    return this.ordersService.create(
      validated,
      user.staffId,
      user.restaurantId,
    );
  }

  @Get("active")
  @ApiOperation({ summary: "Get all active orders in progress" })
  async getActiveOrders(@CurrentUser() user: any) {
    return this.ordersService.findActive(user.restaurantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get complete order details by ID" })
  async getOrderById(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch("cancel-item")
  @ApiOperation({
    summary: "Cancel an order line item with reason and audit trail",
  })
  async cancelItem(
    @Body() body: CancelOrderItemInput,
    @CurrentUser() user: any,
  ) {
    const validated = cancelOrderItemSchema.parse(body);
    return this.ordersService.cancelItem(validated, user.staffId);
  }

  @Patch(":id/status")
  @ApiOperation({
    summary: "Transition order lifecycle status with optimistic locking",
  })
  async updateStatus(
    @Param("id") id: string,
    @Body() body: OrderStatusTransitionInput,
    @CurrentUser() user: any,
  ) {
    const validated = orderStatusTransitionSchema.parse(body);
    return this.ordersService.updateStatus(id, validated, user.staffId);
  }
}
