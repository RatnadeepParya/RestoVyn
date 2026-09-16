import React from "react";
import { X, Printer, Check } from "lucide-react";
import { OrderBillingResult } from "@restovyn/business-rules";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  tableName: string;
  cart: Array<{
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
  }>;
  billing: OrderBillingResult;
  tenders?: Array<{ method: string; amount: number }>;
}

export function ReceiptModal({
  isOpen,
  onClose,
  orderNumber,
  tableName,
  cart,
  billing,
  tenders = [{ method: "CASH", amount: billing.grandTotal }],
}: ReceiptModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toFixed(2);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">
              Thermal Receipt Preview (80mm)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full"
          >
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Receipt Paper View */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="bg-white p-6 shadow-md border border-slate-300 w-72 text-slate-900 font-mono text-[11px] leading-relaxed select-none">
            {/* Restaurant Header */}
            <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-slate-400">
              <h4 className="font-extrabold text-sm tracking-wider">
                RESTOVYN BISTRO
              </h4>
              <p>Plot 42, Sector V, Salt Lake</p>
              <p>Kolkata, WB - 700091</p>
              <p>Ph: +91 98765 43210</p>
              <p className="font-bold pt-1">GSTIN: 19AAACR1234F1Z5</p>
              <p>FSSAI: 12822999000142</p>
            </div>

            {/* Bill Meta */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Table:</span>
                <span className="font-bold">{tableName}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>
                  {new Date().toLocaleDateString()}{" "}
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>Rahul (POS-01)</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold pb-1 border-b border-slate-300">
                <span className="w-36">ITEM</span>
                <span className="w-8 text-center">QTY</span>
                <span className="w-16 text-right">AMT</span>
              </div>

              <div className="pt-1.5 space-y-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="w-36 truncate">{item.name}</span>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <span className="w-16 text-right">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{formatCurrency(billing.subtotal)}</span>
              </div>

              {billing.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{formatCurrency(billing.totalDiscount)}</span>
                </div>
              )}

              {billing.taxBreakdown.map((t) => (
                <div key={t.name} className="flex justify-between">
                  <span>
                    {t.name} ({t.ratePercent}%):
                  </span>
                  <span>₹{formatCurrency(t.amount)}</span>
                </div>
              ))}

              {billing.serviceChargeTotal > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge:</span>
                  <span>₹{formatCurrency(billing.serviceChargeTotal)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-300">
                <span>GRAND TOTAL:</span>
                <span>₹{formatCurrency(billing.grandTotal)}</span>
              </div>
            </div>

            {/* Tender */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5">
              {tenders.map((t, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>PAID ({t.method}):</span>
                  <span>₹{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center space-y-1 text-[10px]">
              <p className="font-bold">THANK YOU FOR DINING WITH US!</p>
              <p>For feedback: support@restovyn.com</p>
              <p className="text-[9px] text-slate-500 pt-1">
                Powered by RestoVyn POS
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" />
            Print to Thermal Printer
          </button>
        </div>
      </div>
    </div>
  );
}
