"use client";

import React, { useState } from "react";
import {
  ReceiptText,
  Search,
  Download,
  Calendar,
  IndianRupee,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  CreditCard,
  Banknote,
} from "lucide-react";

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  tableName: string;
  cashierName: string;
  subtotal: number;
  taxTotal: number;
  serviceCharge: number;
  grandTotal: number; // minor units
  paymentMethod: "CASH" | "UPI" | "CARD";
  createdAt: string;
}

const SAMPLE_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    orderNumber: "ORD-1044",
    tableName: "Takeaway Counter",
    cashierName: "Rahul Sharma",
    subtotal: 72000,
    taxTotal: 3600,
    serviceCharge: 0,
    grandTotal: 83600,
    paymentMethod: "UPI",
    createdAt: "Today, 14:30",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    orderNumber: "ORD-1040",
    tableName: "Table T01",
    cashierName: "Rahul Sharma",
    subtotal: 110000,
    taxTotal: 5500,
    serviceCharge: 5500,
    grandTotal: 121000,
    paymentMethod: "CARD",
    createdAt: "Today, 13:15",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    orderNumber: "ORD-1039",
    tableName: "Table T08",
    cashierName: "Priya Das",
    subtotal: 48000,
    taxTotal: 2400,
    serviceCharge: 2400,
    grandTotal: 52800,
    paymentMethod: "CASH",
    createdAt: "Today, 12:45",
  },
];

export default function FinancePage() {
  const [invoices] = useState<InvoiceRecord[]>(SAMPLE_INVOICES);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-emerald-600" />
            Finance, Invoices & Day-Close
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit settled tax invoices, tender reconciliation, and terminal
            shift summaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              alert("Daily Day Closing executed! Business date locked.")
            }
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-colors"
          >
            <Lock className="w-4 h-4" />
            Perform Day Close (06:00 AM Cutoff)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Gross Settled Sales
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalRevenue)}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Across 3 settled bills
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Active Terminal Sessions
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">1 Open</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            POS-01 (Rahul Sharma)
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            GST Output Liability (5%)
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(invoices.reduce((a, b) => a + b.taxTotal, 0))}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            CGST + SGST collected
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice #, table, order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredInvoices.length} Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax (5%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Tender</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {inv.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold">{inv.tableName}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {inv.cashierName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {inv.createdAt}
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    {formatCurrency(inv.subtotal)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatCurrency(inv.taxTotal)}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-800">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        alert(`Reprinting invoice ${inv.invoiceNumber}`)
                      }
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      title="Download / Print"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
