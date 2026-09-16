import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../core/prisma/prisma.service";
import { LoginInput, PinLoginInput } from "@restovyn/validation";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private verifyHash(input: string, storedHash: string, salt: string): boolean {
    const computed = crypto
      .pbkdf2Sync(input, salt, 10000, 64, "sha512")
      .toString("hex");
    return computed === storedHash;
  }

  private verifyPinHash(pin: string, storedHash: string): boolean {
    const salt = "restovyn_pin_salt_dev_seed";
    const computed = crypto
      .pbkdf2Sync(pin, salt, 5000, 32, "sha256")
      .toString("hex");
    return computed === storedHash;
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.username }],
        isActive: true,
      },
      include: {
        staff: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            restaurant: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Invalid credentials or inactive account",
      );
    }

    const salt = "restovyn_fixed_salt_for_dev_seed_123";
    const isPasswordValid = this.verifyHash(
      input.password,
      user.passwordHash,
      salt,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  async pinLogin(input: PinLoginInput) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: input.staffId },
      include: {
        user: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        restaurant: true,
      },
    });

    if (!staff || !staff.user || !staff.user.isActive) {
      throw new UnauthorizedException("Staff record not found or inactive");
    }

    if (!staff.user.pinHash) {
      throw new BadRequestException(
        "PIN login is not configured for this staff member",
      );
    }

    const isPinValid = this.verifyPinHash(input.pin, staff.user.pinHash);
    if (!isPinValid) {
      throw new UnauthorizedException("Invalid PIN");
    }

    await this.prisma.user.update({
      where: { id: staff.user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens({
      ...staff.user,
      staff,
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          "restovyn_jwt_refresh_dev_key_min_32_chars",
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          staff: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
              restaurant: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("User account no longer active");
      }

      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private async generateTokens(user: any) {
    const roleName = user.staff?.role?.name || "UNKNOWN";
    const permissions = (user.staff?.role?.permissions || []).map(
      (p: any) => p.permission.action,
    );
    const restaurantId = user.staff?.restaurantId || "";

    const payload = {
      sub: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      staffId: user.staff?.id,
      employeeCode: user.staff?.employeeCode,
      name: user.staff?.name,
      role: roleName,
      permissions,
      restaurantId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_SECRET || "restovyn_jwt_secret_dev_key_min_32_chars",
      expiresIn: "8h",
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          "restovyn_jwt_refresh_dev_key_min_32_chars",
        expiresIn: "7d",
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        staffId: user.staff?.id,
        employeeCode: user.staff?.employeeCode,
        name: user.staff?.name,
        role: roleName,
        permissions,
        restaurantId,
      },
    };
  }
}
