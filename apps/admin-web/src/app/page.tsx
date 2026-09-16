"use client";

import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  UtensilsCrossed,
  Layers,
  ChefHat,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";

interface DashboardData {
  todaySales: number;
  todayOrdersCount: number;
  averageOrderValue: number;
  activeTables: number;
  occupiedTables: number;
  pendingKots: number;
  cashCollection: number;
  cardCollection: number;
  upiCollection: number;
  lowStockIngredients: Array<{
    id: string;
    name: string;
    currentStock: number;
    unit: { abbreviation: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    todaySales: 83600, // ₹836.00 in minor units
    todayOrdersCount: 5,
    averageOrderValue: 83600,
    activeTables: 30,
    occupiedTables: 3,
    pendingKots: 2,
    cashCollection: 0,
    cardCollection: 0,
    upiCollection: 83600,
    lowStockIngredients: [
      {
        id: "1",
        name: "Fresh Paneer Block",
        currentStock: 4.5,
        unit: { abbreviation: "kg" },
      },
      {
        id: "2",
        name: "Fresh Cream 1L",
        currentStock: 2.0,
        unit: { abbreviation: "pc" },
      },
    ],
  });

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Today's Net Sales
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.todaySales)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              From{" "}
              <span className="font-semibold text-slate-700">
                {data.todayOrdersCount} orders
              </span>{" "}
              today
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Table Occupancy
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {data.occupiedTables} / {data.activeTables}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-600 font-semibold">
                {Math.round(
                  (data.occupiedTables / (data.activeTables || 1)) * 100,
                )}
                %
              </span>{" "}
              capacity occupied
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Pending Kitchen KOTs
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {data.pendingKots} Tickets
            </h3>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Live in kitchen preparation
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Average Order Value
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.averageOrderValue)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dine-in average per ticket
            </p>
          </div>
        </div>
      </div>

      {/* Payment Collections Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 mb-4">
            Payment Tender Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">UPI / QR</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(data.upiCollection)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Credit / Debit Card
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(data.cardCollection)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Cash Register
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(data.cashCollection)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h4>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {data.lowStockIngredients.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {data.lowStockIngredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm font-medium text-slate-800">
                  {ing.name}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                  {ing.currentStock} {ing.unit.abbreviation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
