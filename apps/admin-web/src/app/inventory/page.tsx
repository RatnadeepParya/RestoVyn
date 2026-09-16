"use client";

import React, { useState } from "react";
import {
  PackageOpen,
  Search,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  Trash2,
} from "lucide-react";
import { WastageReason } from "@restovyn/types";

interface IngredientStock {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  costPerUnit: number; // minor units
  supplierName: string;
}

const SAMPLE_INGREDIENTS: IngredientStock[] = [
  {
    id: "ing-1",
    name: "Basmati Rice (Classic Long)",
    category: "Grains & Rice",
    currentStock: 120.5,
    minimumStock: 40.0,
    unit: "kg",
    costPerUnit: 9500, // ₹95.00
    supplierName: "Metro Cash & Carry",
  },
  {
    id: "ing-2",
    name: "Fresh Chicken (Curry Cut)",
    category: "Meat & Poultry",
    currentStock: 18.0,
    minimumStock: 25.0, // Low stock!
    unit: "kg",
    costPerUnit: 18000, // ₹180.00
    supplierName: "Royal Meats Supply",
  },
  {
    id: "ing-3",
    name: "Fresh Paneer Block",
    category: "Dairy",
    currentStock: 4.5,
    minimumStock: 10.0, // Low stock!
    unit: "kg",
    costPerUnit: 32000, // ₹320.00
    supplierName: "Amul Direct Distributor",
  },
  {
    id: "ing-4",
    name: "Pure Cow Ghee",
    category: "Oils & Ghee",
    currentStock: 35.0,
    minimumStock: 15.0,
    unit: "L",
    costPerUnit: 54000, // ₹540.00
    supplierName: "Metro Cash & Carry",
  },
  {
    id: "ing-5",
    name: "Fresh Cream 1L",
    category: "Dairy",
    currentStock: 2.0,
    minimumStock: 8.0, // Low stock!
    unit: "pc",
    costPerUnit: 19000, // ₹190.00
    supplierName: "Amul Direct Distributor",
  },
];

export default function InventoryPage() {
  const [ingredients, setIngredients] =
    useState<IngredientStock[]>(SAMPLE_INGREDIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWastageModal, setShowWastageModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientStock | null>(null);
  const [wastageQty, setWastageQty] = useState("");
  const [wastageReason, setWastageReason] = useState<WastageReason>(
    WastageReason.EXPIRED,
  );

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const handleLogWastage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    const qty = parseFloat(wastageQty);
    if (isNaN(qty) || qty <= 0) return;

    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === selectedIngredient.id
          ? { ...ing, currentStock: Math.max(0, ing.currentStock - qty) }
          : ing,
      ),
    );

    alert(
      `Logged wastage of ${qty} ${selectedIngredient.unit} of ${selectedIngredient.name}. Reason: ${wastageReason}`,
    );
    setShowWastageModal(false);
    setSelectedIngredient(null);
    setWastageQty("");
  };

  const filteredIngredients = ingredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const lowStockCount = ingredients.filter(
    (i) => i.currentStock < i.minimumStock,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PackageOpen className="w-6 h-6 text-emerald-600" />
            Inventory, Recipes & Stock Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time raw ingredient tracking, automated consumption from KOTs,
            and wastage audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{lowStockCount} Items Low Stock</span>
          </div>

          <button
            onClick={() => alert("Create Purchase Order dialog opened")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredIngredients.length} Ingredients tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ingredient Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Cost / Unit</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredIngredients.map((ing) => {
                const isLow = ing.currentStock < ing.minimumStock;
                return (
                  <tr
                    key={ing.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {ing.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {ing.category}
                    </td>
                    <td className="py-3.5 px-4 font-black text-sm text-slate-900">
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {ing.minimumStock} {ing.unit}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatCurrency(ing.costPerUnit)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {ing.supplierName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isLow
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isLow ? "LOW STOCK" : "OPTIMAL"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedIngredient(ing);
                          setShowWastageModal(true);
                        }}
                        className="px-2.5 py-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Log Wastage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wastage Logging Modal */}
      {showWastageModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleLogWastage}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col"
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  Record Wastage / Spillage
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedIngredient.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWastageModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Quantity Wasted ({selectedIngredient.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={`Max: ${selectedIngredient.currentStock}`}
                  value={wastageQty}
                  onChange={(e) => setWastageQty(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl text-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Wastage Reason
                </label>
                <select
                  value={wastageReason}
                  onChange={(e) =>
                    setWastageReason(e.target.value as WastageReason)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={WastageReason.EXPIRED}>
                    Expired / Spoiled
                  </option>
                  <option value={WastageReason.BURNT}>
                    Burnt / Overcooked in Kitchen
                  </option>
                  <option value={WastageReason.DAMAGED}>
                    Damaged in Transit / Storage
                  </option>
                  <option value={WastageReason.SPILLAGE}>
                    Accidental Spillage
                  </option>
                  <option value={WastageReason.OTHER}>
                    Other / Adjustment
                  </option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWastageModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow hover:bg-rose-500"
              >
                Deduct from Stock & Log Audit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
