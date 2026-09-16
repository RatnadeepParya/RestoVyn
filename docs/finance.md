# Cash Management & Day Closing Architecture

## 1. Cash Session Balance Formula

Cash register drawer sessions enforce:

$$\text{Expected Closing Cash} = \text{Opening Cash} + \text{Cash Sales} - \text{Cash Refunds} - \text{Cash Expenses} \pm \text{Adjustments}$$

At shift close:

- Cashier counts actual drawer cash.
- System records:
  - `openingCash`
  - `expectedClosing`
  - `closingCash` (actual)
  - `difference = closingCash - expectedClosing`
  - `closedById` and timestamp.
- Drawer discrepancies are flagged for manager audit.

---

## 2. Manager Day-Closing Process

```mermaid
flowchart TD
    A[Start Day Close] --> B{Any Open Orders?}
    B -- Yes --> C[Complete, Settle, or Void Open Orders]
    C --> B
    B -- No --> D{Any Pending Payments?}
    D -- Yes --> E[Reconcile Unsettled Invoices]
    E --> D
    D -- No --> F[Reconcile Cash Drawers]
    F --> G[Generate Daily Sales & Tax Summary]
    G --> H[Manager PIN Sign-off]
    H --> I[Lock Business Date in DayClosing Table]
```

Once closed, transactions for that business date are locked against normal modification.
Reversals require explicit authorized procedures.
