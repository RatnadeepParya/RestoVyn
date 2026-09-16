export interface LineItemCalculationInput {
  basePrice: number; // minor units
  variantDelta?: number; // minor units
  modifierDeltas?: number[]; // minor units
  addonPrices?: number[]; // minor units
  quantity: number;
  itemDiscount?: number; // minor units
}

export interface LineItemCalculationResult {
  unitPrice: number; // (base + variant + modifiers + addons)
  subtotal: number; // unitPrice * quantity
  discountAmount: number;
  totalPrice: number; // subtotal - discount
}

export interface TaxCalculationConfig {
  name: string;
  ratePercent: number; // e.g. 5.0 for 5%
  isInclusive: boolean;
}

export interface OrderBillingInput {
  items: LineItemCalculationInput[];
  billDiscountAmount?: number; // minor units
  billDiscountPercent?: number; // e.g. 10 for 10%
  taxes?: TaxCalculationConfig[];
  serviceChargePercent?: number; // e.g. 5 for 5%
  deliveryChargeAmount?: number; // minor units
}

export interface OrderBillingResult {
  subtotal: number;
  itemDiscountsTotal: number;
  billDiscountTotal: number;
  totalDiscount: number;
  taxableAmount: number;
  taxesTotal: number;
  taxBreakdown: Array<{
    name: string;
    amount: number;
    ratePercent: number;
    isInclusive: boolean;
  }>;
  serviceChargeTotal: number;
  deliveryChargeTotal: number;
  grandTotal: number;
}

/**
 * Calculates a single order line item price in integer minor units.
 */
export function calculateLineItem(
  input: LineItemCalculationInput,
): LineItemCalculationResult {
  const variantDelta = input.variantDelta ?? 0;
  const modifierTotal = (input.modifierDeltas ?? []).reduce(
    (acc, curr) => acc + curr,
    0,
  );
  const addonTotal = (input.addonPrices ?? []).reduce(
    (acc, curr) => acc + curr,
    0,
  );

  const unitPrice = input.basePrice + variantDelta + modifierTotal + addonTotal;
  const subtotal = unitPrice * input.quantity;
  const discountAmount = Math.min(subtotal, input.itemDiscount ?? 0);
  const totalPrice = Math.max(0, subtotal - discountAmount);

  return {
    unitPrice,
    subtotal,
    discountAmount,
    totalPrice,
  };
}

/**
 * Calculates comprehensive invoice/order totals in integer minor units.
 * Floating-point representation is strictly avoided for money totals.
 */
export function calculateOrderBilling(
  input: OrderBillingInput,
): OrderBillingResult {
  let subtotal = 0;
  let itemDiscountsTotal = 0;

  for (const item of input.items) {
    const calculated = calculateLineItem(item);
    subtotal += calculated.subtotal;
    itemDiscountsTotal += calculated.discountAmount;
  }

  const netAfterItemDiscount = Math.max(0, subtotal - itemDiscountsTotal);

  // Calculate bill discount
  let billDiscountTotal = 0;
  if (input.billDiscountAmount && input.billDiscountAmount > 0) {
    billDiscountTotal = Math.min(
      netAfterItemDiscount,
      input.billDiscountAmount,
    );
  } else if (input.billDiscountPercent && input.billDiscountPercent > 0) {
    const rawDiscount =
      (netAfterItemDiscount * input.billDiscountPercent) / 100;
    billDiscountTotal = Math.min(netAfterItemDiscount, Math.round(rawDiscount));
  }

  const totalDiscount = itemDiscountsTotal + billDiscountTotal;
  const taxableAmount = Math.max(0, netAfterItemDiscount - billDiscountTotal);

  // Taxes
  const taxBreakdown: OrderBillingResult["taxBreakdown"] = [];
  let exclusiveTaxesTotal = 0;
  const taxes = input.taxes ?? [];

  for (const tax of taxes) {
    if (tax.isInclusive) {
      // Inclusive: Tax is already embedded in the taxable amount
      // taxAmount = taxableAmount - (taxableAmount / (1 + rate / 100))
      const divisor = 1 + tax.ratePercent / 100;
      const baseBeforeTax = taxableAmount / divisor;
      const taxAmount = Math.round(taxableAmount - baseBeforeTax);
      taxBreakdown.push({
        name: tax.name,
        ratePercent: tax.ratePercent,
        amount: taxAmount,
        isInclusive: true,
      });
    } else {
      // Exclusive: Tax is added on top of taxable amount
      const taxAmount = Math.round((taxableAmount * tax.ratePercent) / 100);
      exclusiveTaxesTotal += taxAmount;
      taxBreakdown.push({
        name: tax.name,
        ratePercent: tax.ratePercent,
        amount: taxAmount,
        isInclusive: false,
      });
    }
  }

  // Service charge
  let serviceChargeTotal = 0;
  if (input.serviceChargePercent && input.serviceChargePercent > 0) {
    serviceChargeTotal = Math.round(
      (taxableAmount * input.serviceChargePercent) / 100,
    );
  }

  const deliveryChargeTotal = Math.max(0, input.deliveryChargeAmount ?? 0);

  const grandTotal =
    taxableAmount +
    exclusiveTaxesTotal +
    serviceChargeTotal +
    deliveryChargeTotal;

  return {
    subtotal,
    itemDiscountsTotal,
    billDiscountTotal,
    totalDiscount,
    taxableAmount,
    taxesTotal: taxBreakdown.reduce((acc, t) => acc + t.amount, 0),
    taxBreakdown,
    serviceChargeTotal,
    deliveryChargeTotal,
    grandTotal,
  };
}
