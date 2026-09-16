"use client";

import React, { useState } from "react";
import { Users, Search, Plus, Award, Phone, Calendar } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpend: number; // minor units
  loyaltyPoints: number;
  lastVisit: string;
}

const SAMPLE_CUSTOMERS: CustomerRecord[] = [
  {
    id: "c-1",
    name: "Sunil Mukherjee",
    phone: "+91 98300 12345",
    totalOrders: 14,
    totalSpend: 4860000,
    loyaltyPoints: 486,
    lastVisit: "Yesterday",
  },
  {
    id: "c-2",
    name: "Debashis Sen",
    phone: "+91 98300 67890",
    totalOrders: 8,
    totalSpend: 2450000,
    loyaltyPoints: 245,
    lastVisit: "3 days ago",
  },
  {
    id: "c-3",
    name: "Priyanka Ghosh",
    phone: "+91 98300 11223",
    totalOrders: 22,
    totalSpend: 8940000,
    loyaltyPoints: 894,
    lastVisit: "Today",
  },
  {
    id: "c-4",
    name: "Rajesh Kothari",
    phone: "+91 98300 44556",
    totalOrders: 5,
    totalSpend: 1560000,
    loyaltyPoints: 156,
    lastVisit: "1 week ago",
  },
];

export default function CustomersPage() {
  const [customers] = useState<CustomerRecord[]>(SAMPLE_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery),
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Customer CRM & Loyalty Points
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal customer profiles, order history, and dine-in loyalty point
            balances
          </p>
        </div>

        <button
          onClick={() => alert("New customer profile modal")}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer Record
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by phone number or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredCustomers.length} Guests Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Total Visits</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Last Dining Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {c.phone}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {c.totalOrders} orders
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-800">
                    {formatCurrency(c.totalSpend)}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-amber-700 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {c.loyaltyPoints} pts
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{c.lastVisit}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Viewing history for ${c.name}`)}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold"
                    >
                      History
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
