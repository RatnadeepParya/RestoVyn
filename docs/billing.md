# RestoVyn Billing & Tax Calculation Specification

## 1. Zero Floating-Point Rule

All monetary calculations in RestoVyn are strictly executed in integer minor units (paise/cents):

```typescript
₹250.50 === 25050 minor units
```

## 2. Order Calculation Algorithm

```text
Item Price × Quantity
       +
Modifiers Deltas
       +
Add-on Prices
       =
Subtotal

Subtotal - Item Discounts = Net Item Total

Net Item Total - Bill Discount = Taxable Amount

Taxable Amount
+ Exclusive Taxes (GST / VAT)
+ Service Charge
+ Delivery Charge
= Grand Total
```

## 3. Inclusive vs. Exclusive Taxes

- **Exclusive Tax** (e.g. 5% GST on food):
  $$\text{Tax Amount} = \text{round}\left(\text{Taxable Amount} \times \frac{\text{Rate}}{100}\right)$$
  Added directly to the taxable amount.
- **Inclusive Tax** (e.g. VAT included in price):
  $$\text{Tax Part} = \text{round}\left(\text{Taxable Amount} - \frac{\text{Taxable Amount}}{1 + \frac{\text{Rate}}{100}}\right)$$
  Does not increase Grand Total; the embedded portion is recorded for tax filing.

## 4. Split-Bill Balancing

$$\sum_{i=1}^{N} \text{Payment}_i = \text{Invoice Grand Total}$$
If any rounding remainder occurs during equal splits, cents/paise are allocated deterministically to the first participants to ensure zero discrepancy.
