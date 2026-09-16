export class ConcurrencyConflictError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly currentVersion: number,
    public readonly expectedVersion: number,
  ) {
    super(
      `Concurrency conflict on ${entityName}: expected version ${expectedVersion}, but current version is ${currentVersion}. The record was modified by another user.`,
    );
    this.name = "ConcurrencyConflictError";
  }
}

/**
 * Asserts that the optimistic concurrency version matches before modifying an order or table.
 */
export function assertOptimisticLock(
  entityName: string,
  currentVersion: number,
  expectedVersion: number,
): void {
  if (currentVersion !== expectedVersion) {
    throw new ConcurrencyConflictError(
      entityName,
      currentVersion,
      expectedVersion,
    );
  }
}
