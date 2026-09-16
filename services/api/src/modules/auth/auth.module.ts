import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_SECRET || "restovyn_jwt_secret_dev_key_min_32_chars",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
