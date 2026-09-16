"use client";

import React, { useState } from "react";
import {
  UtensilsCrossed,
  Search,
  Plus,
  Flame,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  basePrice: number; // minor units
  taxRatePercent: number;
  prepTimeMinutes: number;
  kitchenStation: string;
  isAvailable: boolean;
  variantsCount: number;
  modifiersCount: number;
}

const SAMPLE_ITEMS: MenuItem[] = [
  {
    id: "m-1",
    name: "Chicken Biryani",
    category: "Biryani",
    basePrice: 38000,
    taxRatePercent: 5.0,
    prepTimeMinutes: 20,
    kitchenStation: "Main Kitchen",
    isAvailable: true,
    variantsCount: 2,
    modifiersCount: 3,
  },
  {
    id: "m-2",
    name: "Awadhi Mutton Biryani",
    category: "Biryani",
    basePrice: 48000,
    taxRatePercent: 5.0,
    prepTimeMinutes: 25,
    kitchenStation: "Main Kitchen",
    isAvailable: true,
    variantsCount: 2,
    modifiersCount: 2,
  },
  {
    id: "m-3",
    name: "Paneer Butter Masala",
    category: "Main Course",
    basePrice: 36000,
    taxRatePercent: 5.0,
    prepTimeMinutes: 15,
    kitchenStation: "Main Kitchen",
    isAvailable: true,
    variantsCount: 0,
    modifiersCount: 3,
  },
  {
    id: "m-4",
    name: "Butter Naan",
    category: "Breads",
    basePrice: 7000,
    taxRatePercent: 5.0,
    prepTimeMinutes: 8,
    kitchenStation: "Tandoor",
    isAvailable: true,
    variantsCount: 0,
    modifiersCount: 0,
  },
  {
    id: "m-5",
    name: "Galouti Kebab",
    category: "Starters",
    basePrice: 46000,
    taxRatePercent: 5.0,
    prepTimeMinutes: 18,
    kitchenStation: "Tandoor",
    isAvailable: false, // 86'd
    variantsCount: 0,
    modifiersCount: 2,
  },
  {
    id: "m-6",
    name: "Fresh Lime Soda",
    category: "Beverages",
    basePrice: 12000,
    taxRatePercent: 5.0,
    prepTimeMinutes: 5,
    kitchenStation: "Bar",
    isAvailable: true,
    variantsCount: 0,
    modifiersCount: 2,
  },
];

const CATEGORIES = [
  "All",
  "Starters",
  "Main Course",
  "Biryani",
  "Breads",
  "Beverages",
  "Dessert",
];

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>(SAMPLE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isAvailable: !it.isAvailable } : it,
      ),
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            Menu Catalog & Pricing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure items, variants, kitchen station routing, and live item
            86/availability
          </p>
        </div>

        <button
          onClick={() => alert("Add Item dialog opened")}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border bg-white shadow-xs flex flex-col justify-between transition-all ${
              !item.isAvailable
                ? "opacity-60 bg-slate-50 border-slate-300"
                : "border-slate-200 hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    {item.name}
                  </h3>
                </div>
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition-colors ${
                    item.isAvailable
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-rose-50 border-rose-300 text-rose-800"
                  }`}
                >
                  {item.isAvailable ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>
                    {item.isAvailable ? "Available" : "86'd / Out of Stock"}
                  </span>
                </button>
              </div>

              {/* Badges & Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {item.kitchenStation}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.prepTimeMinutes} mins
                </span>
                {item.variantsCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold text-[11px]">
                    {item.variantsCount} Variants
                  </span>
                )}
                {item.modifiersCount > 0 && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold text-[11px]">
                    {item.modifiersCount} Modifiers
                  </span>
                )}
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Base Price
                </span>
                <p className="text-lg font-black text-slate-900">
                  {formatCurrency(item.basePrice)}
                </p>
              </div>

              <button
                onClick={() => alert(`Editing item ${item.name}`)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Edit Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
