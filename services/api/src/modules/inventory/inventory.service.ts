import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { StockMovementType, WastageReason } from "@restovyn/types";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(restaurantId?: string) {
    return this.prisma.ingredient.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      include: { unit: true },
      orderBy: { name: "asc" },
    });
  }

  async recordStockMovement(data: {
    ingredientId: string;
    movementType: StockMovementType;
    quantity: number; // Signed delta
    reason?: string;
    referenceId?: string;
    createdById?: string;
  }) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: data.ingredientId },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient ${data.ingredientId} not found`);
    }

    const newBalance = ingredient.currentStock + data.quantity;
    if (newBalance < 0) {
      throw new BadRequestException(
        `Insufficient stock for ${ingredient.name}. Current: ${ingredient.currentStock}, requested change: ${data.quantity}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          ingredientId: ingredient.id,
          movementType: data.movementType,
          quantity: data.quantity,
          balanceAfter: newBalance,
          referenceId: data.referenceId,
          reason: data.reason,
          createdById: data.createdById,
        },
      });

      const updatedIngredient = await tx.ingredient.update({
        where: { id: ingredient.id },
        data: { currentStock: newBalance },
        include: { unit: true },
      });

      return { movement, updatedIngredient };
    });
  }

  async recordWastage(data: {
    ingredientId: string;
    quantity: number;
    reason: WastageReason;
    createdById: string;
  }) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: data.ingredientId },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient ${data.ingredientId} not found`);
    }

    const totalCost = Math.round(ingredient.costPerUnit * data.quantity);

    return this.prisma.$transaction(async (tx) => {
      const wastage = await tx.wastage.create({
        data: {
          ingredientId: ingredient.id,
          quantity: data.quantity,
          reason: data.reason,
          totalCost,
          createdById: data.createdById,
        },
      });

      const newBalance = Math.max(0, ingredient.currentStock - data.quantity);

      await tx.stockMovement.create({
        data: {
          ingredientId: ingredient.id,
          movementType: StockMovementType.WASTAGE,
          quantity: -data.quantity,
          balanceAfter: newBalance,
          referenceId: wastage.id,
          reason: `Wastage recorded: ${data.reason}`,
          createdById: data.createdById,
        },
      });

      const updated = await tx.ingredient.update({
        where: { id: ingredient.id },
        data: { currentStock: newBalance },
      });

      return { wastage, updated };
    });
  }
}
