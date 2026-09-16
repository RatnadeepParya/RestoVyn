# Payment Engine & Multi-Tender Reconciliation

RestoVyn supports multiple tenders per invoice (Cash, Card, UPI, Wallets).

## 1. Multi-Tender Reconciliation Workflow

```mermaid
sequenceDiagram
    participant Cashier as Cashier Terminal
    participant Engine as Payment Engine
    participant Invoice as Invoice Record
    participant Gateway as External Provider (Razorpay/UPI)

    Cashier->>Engine: Initiate Payment (Amount: ₹500, Tender: Cash)
    Engine->>Invoice: Record Payment Allocation (₹500)
    Invoice-->>Engine: Paid: ₹500, Due: ₹1,500 (isPaid: false)

    Cashier->>Engine: Initiate Payment (Amount: ₹1,500, Tender: UPI)
    Engine->>Gateway: Verify UPI Transaction Reference
    Gateway-->>Engine: Verification OK
    Engine->>Invoice: Record Payment Allocation (₹1,500)
    Invoice-->>Engine: Paid: ₹2,000, Due: ₹0 (isPaid: true)

    Engine->>Invoice: Mark Invoice isPaid = true
    Engine->>Engine: Transition Order Status -> PAID
    Engine->>Cashier: Print Final Thermal Receipt
```

## 2. Immutability & Reversals

Financial transactions are never deleted:

- If a payment was made by error, a `Refund` or `PaymentVoid` record is appended.
- Original payment transaction remains intact for forensic audit and day-close reconciliation.
