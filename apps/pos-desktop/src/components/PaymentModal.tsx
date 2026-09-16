import React, { useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { PaymentMethod } from "@restovyn/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmountInMinorUnits: number;
  onCompletePayment: (
    tenders: { method: PaymentMethod; amount: number; reference?: string }[],
  ) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  totalAmountInMinorUnits,
  onCompletePayment,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const [tenders, setTenders] = useState<
    { method: PaymentMethod; amount: number; reference?: string }[]
  >([{ method: PaymentMethod.CASH, amount: totalAmountInMinorUnits }]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  );
  const [cashReceivedInMinorUnits, setCashReceivedInMinorUnits] =
    useState<number>(totalAmountInMinorUnits);

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const totalTendered = tenders.reduce((acc, t) => acc + t.amount, 0);
  const remainingDue = Math.max(0, totalAmountInMinorUnits - totalTendered);
  const cashChangeDue = Math.max(
    0,
    cashReceivedInMinorUnits - totalAmountInMinorUnits,
  );

  const handleQuickCash = (amountInMinor: number) => {
    setCashReceivedInMinorUnits(amountInMinor);
    setTenders([
      { method: PaymentMethod.CASH, amount: totalAmountInMinorUnits },
    ]);
  };

  const handleSelectSingleTender = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setTenders([{ method, amount: totalAmountInMinorUnits }]);
  };

  const handleSubmit = () => {
    if (totalTendered < totalAmountInMinorUnits) {
      alert("Total tendered must cover the full bill amount!");
      return;
    }
    onCompletePayment(tenders);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Process Settlement</h3>
            <p className="text-xs text-slate-400">
              Total Payable:{" "}
              <span className="text-emerald-400 font-semibold">
                {formatCurrency(totalAmountInMinorUnits)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tender Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Primary Tender
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleSelectSingleTender(PaymentMethod.CASH)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedMethod === PaymentMethod.CASH
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="font-semibold text-sm">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSingleTender(PaymentMethod.UPI)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedMethod === PaymentMethod.UPI
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Smartphone className="w-6 h-6" />
                <span className="font-semibold text-sm">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSingleTender(PaymentMethod.CARD)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedMethod === PaymentMethod.CARD
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-semibold text-sm">Card / POS</span>
              </button>
            </div>
          </div>

          {/* Cash Details */}
          {selectedMethod === PaymentMethod.CASH && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Cash Received:
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={(cashReceivedInMinorUnits / 100).toFixed(2)}
                  onChange={(e) =>
                    setCashReceivedInMinorUnits(
                      Math.round(parseFloat(e.target.value || "0") * 100),
                    )
                  }
                  className="w-36 px-3 py-2 text-right font-bold text-lg rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Quick Cash:
                </span>
                {[
                  { label: "Exact", value: totalAmountInMinorUnits },
                  { label: "₹500", value: 50000 },
                  { label: "₹1,000", value: 100000 },
                  { label: "₹2,000", value: 200000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQuickCash(preset.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Change Calculation */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  Change Due to Customer:
                </span>
                <span className="text-xl font-extrabold text-emerald-600">
                  {formatCurrency(cashChangeDue)}
                </span>
              </div>
            </div>
          )}

          {/* UPI QR Display Placeholder */}
          {selectedMethod === PaymentMethod.UPI && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-32 h-32 bg-white rounded-lg border border-slate-300 flex items-center justify-center shadow-inner">
                <span className="text-xs font-semibold text-slate-400">
                  Dynamic QR Ready
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  Scan UPI QR to Pay {formatCurrency(totalAmountInMinorUnits)}
                </p>
                <p className="text-xs text-slate-500">
                  Auto-reconciliation active on POS webhook
                </p>
              </div>
            </div>
          )}

          {/* Card Reference */}
          {selectedMethod === PaymentMethod.CARD && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-blue-900 uppercase">
                EDC Terminal Auth Code / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. TXN987214"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow hover:bg-emerald-500 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Settlement & Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
