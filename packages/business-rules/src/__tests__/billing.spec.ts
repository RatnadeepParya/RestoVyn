import {
  calculateLineItem,
  calculateOrderBilling,
  calculateEqualSplit,
  validateSplitPayments,
  calculateCashDrawerSession,
  assertOptimisticLock,
  ConcurrencyConflictError,
} from "../index";

describe("Business Rules - Billing Engine", () => {
  it("calculates line item correctly with base price, variant, modifier, and addon in minor units", () => {
    // Chicken Biryani Medium: ₹250 (25000 paise) + ₹50 (5000 paise) variant + ₹20 (2000 paise) extra spice + ₹30 (3000 paise) extra egg
    const result = calculateLineItem({
      basePrice: 25000,
      variantDelta: 5000,
      modifierDeltas: [2000],
      addonPrices: [3000],
      quantity: 2,
      itemDiscount: 5000, // ₹50 off total
    });

    // unitPrice = 25000 + 5000 + 2000 + 3000 = 35000 paise
    expect(result.unitPrice).toBe(35000);
    // subtotal = 35000 * 2 = 70000 paise
    expect(result.subtotal).toBe(70000);
    expect(result.discountAmount).toBe(5000);
    // totalPrice = 70000 - 5000 = 65000 paise
    expect(result.totalPrice).toBe(65000);
  });

  it("calculates full order invoice with exclusive tax and service charge in integer minor units", () => {
    // 2 items: 50000 + 30000 = 80000 paise (₹800.00)
    // Bill discount 10% = 8000 paise (₹80.00) -> Taxable: 72000 paise
    // Exclusive GST 5% = 3600 paise (₹36.00)
    // Service charge 5% = 3600 paise (₹36.00)
    // Delivery charge = 5000 paise (₹50.00)
    // Grand Total = 72000 + 3600 + 3600 + 5000 = 84200 paise (₹842.00)
    const billing = calculateOrderBilling({
      items: [
        { basePrice: 25000, quantity: 2 }, // 50000
        { basePrice: 30000, quantity: 1 }, // 30000
      ],
      billDiscountPercent: 10,
      taxes: [{ name: "GST", ratePercent: 5.0, isInclusive: false }],
      serviceChargePercent: 5.0,
      deliveryChargeAmount: 5000,
    });

    expect(billing.subtotal).toBe(80000);
    expect(billing.billDiscountTotal).toBe(8000);
    expect(billing.taxableAmount).toBe(72000);
    expect(billing.taxBreakdown[0].amount).toBe(3600);
    expect(billing.serviceChargeTotal).toBe(3600);
    expect(billing.deliveryChargeTotal).toBe(5000);
    expect(billing.grandTotal).toBe(84200);
  });

  it("calculates inclusive tax without altering taxable grand total", () => {
    // Subtotal: 10500 paise (₹105.00 inclusive of 5% tax)
    // Base before tax: 10500 / 1.05 = 10000 paise
    // Tax: 500 paise
    // Grand total stays 10500 paise
    const billing = calculateOrderBilling({
      items: [{ basePrice: 10500, quantity: 1 }],
      taxes: [{ name: "VAT (Inclusive)", ratePercent: 5.0, isInclusive: true }],
    });

    expect(billing.subtotal).toBe(10500);
    expect(billing.taxableAmount).toBe(10500);
    expect(billing.taxBreakdown[0].amount).toBe(500);
    expect(billing.grandTotal).toBe(10500);
  });
});

describe("Business Rules - Split Bill", () => {
  it("splits ₹100.00 equally across 3 persons without losing any single paisa/cent", () => {
    // 10000 paise split 3 ways: 10000 / 3 = 3333 with remainder 1
    // Expected: [3334, 3333, 3333]
    const splits = calculateEqualSplit(10000, 3);
    expect(splits).toEqual([3334, 3333, 3333]);
    const sum = splits.reduce((a, b) => a + b, 0);
    expect(sum).toBe(10000);
  });

  it("validates custom split reconciliation", () => {
    const balanced = validateSplitPayments(240000, [80000, 90000, 70000]);
    expect(balanced.isBalanced).toBe(true);
    expect(balanced.difference).toBe(0);

    const imbalanced = validateSplitPayments(240000, [80000, 90000, 60000]);
    expect(imbalanced.isBalanced).toBe(false);
    expect(imbalanced.difference).toBe(10000);
  });
});

describe("Business Rules - Cash Drawer & Concurrency", () => {
  it("calculates expected cash and reconciliation discrepancy", () => {
    // Opening 10000 (₹100) + Sales 50000 (₹500) - Refunds 5000 (₹50) - Expenses 5000 (₹50) + Adjustment 2000 (₹20) = 52000
    const session = calculateCashDrawerSession({
      openingCash: 10000,
      cashSales: 50000,
      cashRefunds: 5000,
      cashExpenses: 5000,
      cashAdjustments: 2000,
      actualClosingCash: 51500, // Short by 500 paise (₹5.00)
    });

    expect(session.expectedClosingCash).toBe(52000);
    expect(session.difference).toBe(-500);
    expect(session.isReconciled).toBe(false);
  });

  it("throws ConcurrencyConflictError on version mismatch", () => {
    expect(() => assertOptimisticLock("Order", 2, 1)).toThrow(
      ConcurrencyConflictError,
    );
    expect(() => assertOptimisticLock("Order", 2, 2)).not.toThrow();
  });
});
