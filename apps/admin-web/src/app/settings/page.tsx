"use client";

import React, { useState } from "react";
import {
  Settings,
  Save,
  Building,
  Percent,
  Clock,
  DollarSign,
} from "lucide-react";

export default function SettingsPage() {
  const [restaurantName, setRestaurantName] = useState(
    "RestoVyn Bistro & Lounge",
  );
  const [gstin, setGstin] = useState("19AAACR1234F1Z5");
  const [fssai, setFssai] = useState("12822999000142");
  const [serviceChargePercent, setServiceChargePercent] = useState("5.0");
  const [businessDayCutoff, setBusinessDayCutoff] = useState("06:00");
  const [currencyCode, setCurrencyCode] = useState("INR (₹)");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Restaurant settings updated successfully! Synced across all POS terminals.",
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Restaurant Configuration & Rules
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Master store profile, statutory tax numbers, business day cutoff time,
          and service charge rates
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              GSTIN (Tax ID)
            </label>
            <input
              type="text"
              required
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              FSSAI License Number
            </label>
            <input
              type="text"
              required
              value={fssai}
              onChange={(e) => setFssai(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Currency
            </label>
            <input
              type="text"
              disabled
              value={currencyCode}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Dine-In Service Charge (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={serviceChargePercent}
              onChange={(e) => setServiceChargePercent(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Business Day Cutoff Time (24h)
            </label>
            <input
              type="time"
              value={businessDayCutoff}
              onChange={(e) => setBusinessDayCutoff(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Orders placed after midnight before this time will count toward
              the previous business day
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
