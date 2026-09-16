import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class FloorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(restaurantId?: string) {
    return this.prisma.floor.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }
}
