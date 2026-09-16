import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(restaurantId?: string, action?: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        restaurantId: restaurantId || undefined,
        action: action || undefined,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            staff: { select: { name: true, employeeCode: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
