export interface CashSessionCalculationInput {
  openingCash: number;
  cashSales: number;
  cashRefunds: number;
  cashExpenses: number;
  cashAdjustments: number; // Signed (+ for deposit, - for drop/withdrawal)
  actualClosingCash?: number;
}

export interface CashSessionCalculationResult {
  openingCash: number;
  cashSales: number;
  cashRefunds: number;
  cashExpenses: number;
  cashAdjustments: number;
  expectedClosingCash: number;
  actualClosingCash?: number;
  difference?: number; // actual - expected
  isReconciled: boolean;
}

/**
 * Calculates expected closing cash balance and drawer discrepancy in integer minor units.
 */
export function calculateCashDrawerSession(
  input: CashSessionCalculationInput,
): CashSessionCalculationResult {
  const expectedClosingCash =
    input.openingCash +
    input.cashSales -
    input.cashRefunds -
    input.cashExpenses +
    input.cashAdjustments;

  let difference: number | undefined;
  let isReconciled = true;

  if (input.actualClosingCash !== undefined) {
    difference = input.actualClosingCash - expectedClosingCash;
    isReconciled = difference === 0;
  }

  return {
    openingCash: input.openingCash,
    cashSales: input.cashSales,
    cashRefunds: input.cashRefunds,
    cashExpenses: input.cashExpenses,
    cashAdjustments: input.cashAdjustments,
    expectedClosingCash,
    actualClosingCash: input.actualClosingCash,
    difference,
    isReconciled,
  };
}
