import React, { useState } from "react";
import { X, Users, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import {
  calculateEqualSplit,
  validateSplitPayments,
} from "@restovyn/business-rules";
import { PaymentMethod } from "@restovyn/types";

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmountInMinorUnits: number;
  onCompleteSplit: (
    shares: { personIndex: number; amount: number; method: PaymentMethod }[],
  ) => void;
}

export function SplitBillModal({
  isOpen,
  onClose,
  totalAmountInMinorUnits,
  onCompleteSplit,
}: SplitBillModalProps) {
  if (!isOpen) return null;

  const [splitType, setSplitType] = useState<"EQUAL" | "CUSTOM">("EQUAL");
  const [personCount, setPersonCount] = useState<number>(2);
  const [customShares, setCustomShares] = useState<number[]>([
    Math.floor(totalAmountInMinorUnits / 2),
    totalAmountInMinorUnits - Math.floor(totalAmountInMinorUnits / 2),
  ]);

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  // Compute equal split shares using business rules
  const equalShares: number[] = calculateEqualSplit(
    totalAmountInMinorUnits,
    personCount,
  );

  const handlePersonCountChange = (count: number) => {
    const validCount = Math.max(2, Math.min(10, count));
    setPersonCount(validCount);
    // Reinitialize custom shares
    const shares: number[] = calculateEqualSplit(
      totalAmountInMinorUnits,
      validCount,
    );
    setCustomShares(shares);
  };

  const handleCustomShareChange = (index: number, value: number) => {
    const updated = [...customShares];
    updated[index] = value;
    setCustomShares(updated);
  };

  const currentShares: number[] =
    splitType === "EQUAL" ? equalShares : customShares;
  const validation = validateSplitPayments(
    totalAmountInMinorUnits,
    currentShares,
  );
  const currentTotal = validation.allocatedTotal;
  const discrepancy = validation.difference;
  const isValid = validation.isBalanced;

  const handleSubmit = () => {
    if (!isValid) {
      alert("Split shares must strictly equal the total bill amount!");
      return;
    }
    const result = currentShares.map((amount: number, idx: number) => ({
      personIndex: idx + 1,
      amount,
      method: PaymentMethod.CASH,
    }));
    onCompleteSplit(result);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Split Bill Settlement</h3>
            <p className="text-xs text-slate-400">
              Total Order:{" "}
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
        <div className="p-6 space-y-5">
          {/* Split Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSplitType("EQUAL")}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                splitType === "EQUAL"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Users className="w-4 h-4" />
              Equal Split by Persons
            </button>
            <button
              type="button"
              onClick={() => setSplitType("CUSTOM")}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                splitType === "CUSTOM"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Custom Amount Split
            </button>
          </div>

          {/* Number of Persons Picker */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">
              Number of Ways:
            </span>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePersonCountChange(num)}
                  className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                    personCount === num
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Share Breakdown List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {currentShares.map((share: number, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    Person {idx + 1}
                  </span>
                </div>

                {splitType === "EQUAL" ? (
                  <span className="text-base font-bold text-emerald-700">
                    {formatCurrency(share)}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={(share / 100).toFixed(2)}
                      onChange={(e) =>
                        handleCustomShareChange(
                          idx,
                          Math.round(parseFloat(e.target.value || "0") * 100),
                        )
                      }
                      className="w-28 px-2 py-1 text-right font-bold text-sm rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reconciliation Status */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              isValid
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>
                {isValid
                  ? "All shares balanced perfectly down to 0 paise"
                  : `Discrepancy: ${formatCurrency(Math.abs(discrepancy))} ${discrepancy < 0 ? "Over" : "Under"}`}
              </span>
            </div>
            <span>Sum: {formatCurrency(currentTotal)}</span>
          </div>
        </div>

        {/* Footer */}
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
            disabled={!isValid}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow hover:bg-emerald-500 transition-colors"
          >
            Confirm Split & Pay
          </button>
        </div>
      </div>
    </div>
  );
}
