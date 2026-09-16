import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { StaffRole } from "@restovyn/types";

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(restaurantId: string, role?: StaffRole) {
    return this.prisma.staff.findMany({
      where: {
        restaurantId,
        role: role ? { name: role } : undefined,
      },
      include: {
        role: true,
        user: {
          select: {
            username: true,
            email: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findForPosSelection(restaurantId: string) {
    // Returns only active staff with roles that can operate POS or serve
    return this.prisma.staff.findMany({
      where: {
        restaurantId,
        status: "ACTIVE",
        user: { isActive: true },
      },
      select: {
        id: true,
        name: true,
        employeeCode: true,
        photoUrl: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        user: true,
      },
    });
    if (!staff) {
      throw new NotFoundException(`Staff record ${id} not found`);
    }
    return staff;
  }
}
