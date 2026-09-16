import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { FloorsService } from "./floors.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("floors")
@Controller("floors")
@UseGuards(JwtAuthGuard)
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Get()
  @ApiOperation({ summary: "Get all restaurant floors and sections" })
  async getFloors(@CurrentUser() user: any) {
    return this.floorsService.findAll(user.restaurantId);
  }
}
