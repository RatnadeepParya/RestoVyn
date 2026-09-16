import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  LoginInput,
  PinLoginInput,
  RefreshTokenInput,
  loginSchema,
  pinLoginSchema,
  refreshTokenSchema,
} from "@restovyn/validation";
import {
  JwtAuthGuard,
  IS_PUBLIC_KEY,
} from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SetMetadata } from "@nestjs/common";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Post("login")
  @ApiOperation({ summary: "Login with username/email and password" })
  async login(@Body() body: LoginInput) {
    const validated = loginSchema.parse(body);
    return this.authService.login(validated);
  }

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Post("pin-login")
  @ApiOperation({
    summary: "Fast POS PIN login for quick restaurant staff switching",
  })
  async pinLogin(@Body() body: PinLoginInput) {
    const validated = pinLoginSchema.parse(body);
    return this.authService.pinLogin(validated);
  }

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Post("refresh")
  @ApiOperation({ summary: "Exchange refresh token for a new access token" })
  async refresh(@Body() body: RefreshTokenInput) {
    const validated = refreshTokenSchema.parse(body);
    return this.authService.refreshToken(validated.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get current authenticated staff profile" })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
