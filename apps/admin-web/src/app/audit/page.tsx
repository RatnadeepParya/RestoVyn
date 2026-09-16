"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  FileText,
} from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

const SAMPLE_LOGS: AuditEntry[] = [
  {
    id: "aud-1",
    action: "BILL_DISCOUNT_APPLIED",
    entityName: "Order",
    entityId: "ORD-1040",
    userName: "Ananya Roy",
    userRole: "MANAGER",
    ipAddress: "192.168.1.102",
    timestamp: "10 mins ago",
    details:
      "Applied 10% manager discount (₹12,000 paise). Reason: Regular Patron Courtesy",
  },
  {
    id: "aud-2",
    action: "ORDER_ITEM_VOIDED",
    entityName: "OrderItem",
    entityId: "ITEM-9981",
    userName: "Rahul Sharma",
    userRole: "CASHIER",
    ipAddress: "192.168.1.101",
    timestamp: "25 mins ago",
    details: "Voided 1x Galouti Kebab. Reason: Kitchen 86 / Out of Stock",
  },
  {
    id: "aud-3",
    action: "CASH_DRAWER_SESSION_CLOSED",
    entityName: "CashDrawerSession",
    entityId: "SESS-441",
    userName: "Rahul Sharma",
    userRole: "CASHIER",
    ipAddress: "192.168.1.101",
    timestamp: "1 hour ago",
    details:
      "Session closed with 0 discrepancy (Counted ₹17,840.00 == Expected ₹17,840.00)",
  },
  {
    id: "aud-4",
    action: "WASTAGE_LOGGED",
    entityName: "Wastage",
    entityId: "WST-109",
    userName: "Chef Sanjeev",
    userRole: "KITCHEN_STAFF",
    ipAddress: "192.168.1.105",
    timestamp: "3 hours ago",
    details: "Logged 1.5 kg Fresh Chicken as EXPIRED / SPOILED",
  },
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditEntry[]>(SAMPLE_LOGS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Security & Operational Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable append-only audit trail logging all financial overrides,
            voids, and administrative events
          </p>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl">
          Tamper-Resistant Ledger
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit actions, actors, reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredLogs.length} Events Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Audit Details / Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-800">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">
                    {l.entityName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {l.userName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {l.userRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {l.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{l.timestamp}</td>
                  <td className="py-3.5 px-4 text-slate-800 text-[11px] max-w-md truncate font-medium">
                    {l.details}
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
