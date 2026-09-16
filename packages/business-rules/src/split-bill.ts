export interface SplitReconciliationResult {
  isBalanced: boolean;
  grandTotal: number;
  allocatedTotal: number;
  difference: number;
}

/**
 * Validates that custom split amounts exactly reconcile with the bill grand total.
 */
export function validateSplitPayments(
  grandTotal: number,
  amounts: number[],
): SplitReconciliationResult {
  const allocatedTotal = amounts.reduce((acc, curr) => acc + curr, 0);
  const difference = grandTotal - allocatedTotal;

  return {
    isBalanced: difference === 0,
    grandTotal,
    allocatedTotal,
    difference,
  };
}

/**
 * Splits an amount equally among N persons in integer minor units, distributing
 * any remainder cents/paise deterministically to the first participants so sum equals total.
 */
export function calculateEqualSplit(
  grandTotal: number,
  personCount: number,
): number[] {
  if (personCount <= 0) {
    throw new Error("Person count must be at least 1");
  }

  const baseShare = Math.floor(grandTotal / personCount);
  const remainder = grandTotal % personCount;

  const splits: number[] = [];
  for (let i = 0; i < personCount; i++) {
    splits.push(baseShare + (i < remainder ? 1 : 0));
  }

  return splits;
}
