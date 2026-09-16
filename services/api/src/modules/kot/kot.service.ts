import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class KotService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrderId(orderId: string) {
    return this.prisma.kOT.findMany({
      where: { orderId },
      include: {
        station: true,
        items: {
          include: {
            orderItem: {
              include: {
                menuItem: true,
                modifiers: true,
                addons: true,
              },
            },
          },
        },
      },
    });
  }

  async markPrinted(kotId: string) {
    return this.prisma.kOT.update({
      where: { id: kotId },
      data: { isPrinted: true, printedAt: new Date() },
    });
  }
}
