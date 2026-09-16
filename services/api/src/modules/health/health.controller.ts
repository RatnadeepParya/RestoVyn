import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../../core/prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "System health check" })
  check() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck("database", this.prisma),
    ]);
  }

  @Get("live")
  @ApiOperation({ summary: "Liveness probe" })
  liveness() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness probe" })
  readiness() {
    return { status: "ready", timestamp: new Date().toISOString() };
  }
}
