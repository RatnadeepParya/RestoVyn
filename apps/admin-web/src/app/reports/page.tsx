"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  UtensilsCrossed,
  DollarSign,
  Download,
} from "lucide-react";

interface TopDish {
  rank: number;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number; // minor units
}

const TOP_DISHES: TopDish[] = [
  {
    rank: 1,
    name: "Chicken Biryani",
    category: "Biryani",
    quantitySold: 142,
    revenue: 5396000,
  },
  {
    rank: 2,
    name: "Butter Naan",
    category: "Breads",
    quantitySold: 286,
    revenue: 2002000,
  },
  {
    rank: 3,
    name: "Awadhi Mutton Biryani",
    category: "Biryani",
    quantitySold: 94,
    revenue: 4512000,
  },
  {
    rank: 4,
    name: "Paneer Butter Masala",
    category: "Main Course",
    quantitySold: 88,
    revenue: 3168000,
  },
  {
    rank: 5,
    name: "Galouti Kebab",
    category: "Starters",
    quantitySold: 65,
    revenue: 2990000,
  },
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("Today");

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Operational & Financial Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key business performance metrics, dish velocity, and kitchen
            preparation speed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["Today", "Yesterday", "This Week", "This Month"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {range}
            </button>
          ))}
          <button
            onClick={() => alert("Exporting report as CSV/PDF...")}
            className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            title="Export Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Gross Sales
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(18068000)}
          </h3>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
            +14.2% vs last week
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Average Table Turn Time
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">42 mins</h3>
          <span className="text-xs text-blue-600 font-bold mt-1 inline-block">
            Industry optimal 45m
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Avg. KOT Prep Time
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">13.8 mins</h3>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
            Kitchen target &lt; 15m
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Food Cost Percentage
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">29.4%</h3>
          <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">
            Target &lt; 32.0%
          </span>
        </div>
      </div>

      {/* Top Dishes Velocity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Selling Dishes by Quantity & Revenue
          </h3>
          <span className="text-xs font-bold text-slate-500">{timeRange}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4 text-right">
                  Total Revenue Generated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {TOP_DISHES.map((dish) => (
                <tr
                  key={dish.rank}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    #{dish.rank}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {dish.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {dish.category}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">
                    {dish.quantitySold} plates
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                    {formatCurrency(dish.revenue)}
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
