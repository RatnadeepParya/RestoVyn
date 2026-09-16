import { z } from "zod";
import { OrderType, OrderStatus } from "@restovyn/types";

export const orderItemModifierSchema = z.object({
  modifierId: z.string().uuid(),
  name: z.string().min(1),
  option: z.string().min(1),
  priceDelta: z.number().int().default(0),
});

export const orderItemAddonSchema = z.object({
  addonId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().int().min(0),
});

export const orderItemInputSchema = z.object({
  menuItemId: z.string().uuid("Invalid menu item ID"),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().max(255).optional().nullable(),
  modifiers: z.array(orderItemModifierSchema).optional().default([]),
  addons: z.array(orderItemAddonSchema).optional().default([]),
});

export const createOrderSchema = z.object({
  orderType: z.nativeEnum(OrderType).default(OrderType.DINE_IN),
  tableId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, "At least one item is required"),
  syncId: z.string().uuid().optional().nullable(),
});

export const updateOrderItemsSchema = z.object({
  orderId: z.string().uuid(),
  expectedVersion: z.number().int().min(1),
  itemsToAdd: z.array(orderItemInputSchema).optional().default([]),
});

export const cancelOrderItemSchema = z.object({
  orderItemId: z.string().uuid(),
  reason: z.string().min(3, "Cancellation reason is required"),
});

export const orderStatusTransitionSchema = z.object({
  toStatus: z.nativeEnum(OrderStatus),
  reason: z.string().max(255).optional().nullable(),
  expectedVersion: z.number().int().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type UpdateOrderItemsInput = z.infer<typeof updateOrderItemsSchema>;
export type CancelOrderItemInput = z.infer<typeof cancelOrderItemSchema>;
export type OrderStatusTransitionInput = z.infer<
  typeof orderStatusTransitionSchema
>;
