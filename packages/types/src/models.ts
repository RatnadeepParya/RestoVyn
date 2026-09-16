import {
  OrderStatus,
  OrderType,
  OrderSource,
  TableStatus,
  KOTStatus,
  PriorityLevel,
  PaymentMethod,
  PaymentStatus,
  StaffRole,
  StaffStatus,
} from "./enums";

export interface RestaurantDto {
  id: string;
  name: string;
  code: string;
  logoUrl?: string | null;
  address: string;
  phone: string;
  email: string;
  gstin?: string | null;
  currencyCode: string;
  currencySymbol: string;
  timezone: string;
  businessHourStart: string;
}

export interface StaffDto {
  id: string;
  restaurantId: string;
  userId: string;
  roleId: string;
  roleName: StaffRole;
  employeeCode: string;
  name: string;
  phone: string;
  email?: string | null;
  status: StaffStatus;
  photoUrl?: string | null;
  joiningDate: string;
}

export interface TableDto {
  id: string;
  restaurantId: string;
  floorId: string;
  sectionId?: string | null;
  tableNumber: string;
  name: string;
  capacity: number;
  posX: number;
  posY: number;
  shape: string;
  status: TableStatus;
  isActive: boolean;
}

export interface MenuItemDto {
  id: string;
  categoryId: string;
  kitchenStationId?: string | null;
  name: string;
  sku: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: number; // In minor units
  taxRatePercent: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface OrderItemModifierDto {
  id?: string;
  modifierId: string;
  name: string;
  option: string;
  priceDelta: number;
}

export interface OrderItemAddonDto {
  id?: string;
  addonId: string;
  name: string;
  price: number;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  menuItemId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;
  notes?: string | null;
  isCancelled: boolean;
  cancelReason?: string | null;
  modifiers?: OrderItemModifierDto[];
  addons?: OrderItemAddonDto[];
}

export interface OrderDto {
  id: string;
  restaurantId: string;
  orderNumber: string;
  orderType: OrderType;
  orderSource: OrderSource;
  status: OrderStatus;
  tableId?: string | null;
  captainId?: string | null;
  customerId?: string | null;
  notes?: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceCharge: number;
  deliveryCharge: number;
  grandTotal: number;
  version: number;
  syncId?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItemDto[];
}

export interface KOTDto {
  id: string;
  kotNumber: string;
  orderId: string;
  kitchenStationId: string;
  stationName?: string;
  priority: PriorityLevel;
  status: KOTStatus;
  isPrinted: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface InvoiceDto {
  id: string;
  restaurantId: string;
  orderId: string;
  invoiceNumber: string;
  customerId?: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceCharge: number;
  deliveryCharge: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  isPaid: boolean;
  isVoid: boolean;
}

export interface PaymentDto {
  id: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string | null;
  idempotencyKey?: string | null;
}
