import React, { useState } from "react";
import {
  X,
  Lock,
  Unlock,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { calculateCashDrawerSession } from "@restovyn/business-rules";

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCashInDrawer: number; // minor units
  onSessionUpdate: (data: any) => void;
}

export function CashDrawerModal({
  isOpen,
  onClose,
  currentCashInDrawer,
  onSessionUpdate,
}: CashDrawerModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    "STATUS" | "PAY_IN_OUT" | "CLOSE_SHIFT"
  >("STATUS");
  const [openingFloat] = useState<number>(500000); // ₹5,000.00 default float
  const [cashSales] = useState<number>(currentCashInDrawer);
  const [payIns, setPayIns] = useState<number>(0);
  const [payOuts, setPayOuts] = useState<number>(0);

  // Pay-In/Out form
  const [txType, setTxType] = useState<"PAY_IN" | "PAY_OUT">("PAY_IN");
  const [txAmount, setTxAmount] = useState<string>("0");
  const [txReason, setTxReason] = useState<string>("");

  // Closing form
  const [countedCash, setCountedCash] = useState<string>(
    ((openingFloat + cashSales) / 100).toFixed(2),
  );

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const countedMinor = Math.round(parseFloat(countedCash || "0") * 100);

  const sessionResult = calculateCashDrawerSession({
    openingCash: openingFloat,
    cashSales,
    cashRefunds: 0,
    cashExpenses: payOuts,
    cashAdjustments: payIns,
    actualClosingCash: countedMinor,
  });

  const discrepancy = sessionResult.difference ?? 0;

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(txAmount || "0") * 100);
    if (amountMinor <= 0) return;

    if (txType === "PAY_IN") {
      setPayIns((prev) => prev + amountMinor);
    } else {
      setPayOuts((prev) => prev + amountMinor);
    }

    setTxAmount("0");
    setTxReason("");
    setActiveTab("STATUS");
  };

  const handleCloseShift = () => {
    onSessionUpdate({
      status: "CLOSED",
      openingFloat,
      cashSales,
      payIns,
      payOuts,
      expectedCash: sessionResult.expectedClosingCash,
      actualCountedCash: countedMinor,
      discrepancy,
    });
    alert(`Shift Closed! Cash Discrepancy: ${formatCurrency(discrepancy)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Cash Drawer & Shift Management
              </h3>
              <p className="text-xs text-slate-400">
                Terminal POS-01 (Session Active)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab("STATUS")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "STATUS"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Live Balance
          </button>
          <button
            onClick={() => setActiveTab("PAY_IN_OUT")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "PAY_IN_OUT"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Pay In / Pay Out
          </button>
          <button
            onClick={() => setActiveTab("CLOSE_SHIFT")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "CLOSE_SHIFT"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Close Shift & Reconcile
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "STATUS" && (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Expected Cash in Drawer
                  </span>
                  <h4 className="text-3xl font-extrabold text-emerald-950 mt-1">
                    {formatCurrency(sessionResult.expectedClosingCash)}
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                  <Lock className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">
                    Opening Float
                  </span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {formatCurrency(openingFloat)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">
                    Cash Sales
                  </span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {formatCurrency(cashSales)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">
                    Total Pay-Ins
                  </span>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    +{formatCurrency(payIns)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">
                    Total Pay-Outs
                  </span>
                  <p className="text-base font-bold text-rose-600 mt-0.5">
                    -{formatCurrency(payOuts)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "PAY_IN_OUT" && (
            <form onSubmit={handleAddTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTxType("PAY_IN")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm ${
                    txType === "PAY_IN"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  Pay In (Float Add)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("PAY_OUT")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm ${
                    txType === "PAY_OUT"
                      ? "bg-rose-50 border-rose-600 text-rose-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  Pay Out (Expense)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Petty cash for dairy or vendor change"
                  value={txReason}
                  onChange={(e) => setTxReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow"
              >
                Record {txType === "PAY_IN" ? "Pay In" : "Pay Out"}
              </button>
            </form>
          )}

          {activeTab === "CLOSE_SHIFT" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Perform physical cash count of all notes and coins in the
                  drawer. The system will calculate any overage or shortage.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">
                  Expected Amount:
                </span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(sessionResult.expectedClosingCash)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Physical Counted Cash (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-xl text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  discrepancy === 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : discrepancy > 0
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {discrepancy === 0
                    ? "Perfect Match"
                    : discrepancy > 0
                      ? "Cash Overage"
                      : "Cash Shortage"}
                </span>
                <span className="text-lg font-extrabold">
                  {formatCurrency(Math.abs(discrepancy))}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseShift}
                className="w-full py-3 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-500 transition-colors shadow flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Lock Cash Drawer & Finalize Shift
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
