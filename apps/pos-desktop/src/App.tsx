import React, { useState, useEffect } from "react";
import {
  Search,
  Wifi,
  WifiOff,
  User,
  Percent,
  PauseCircle,
  ChefHat,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  calculateOrderBilling,
  calculateLineItem,
} from "@restovyn/business-rules";
import { OrderType } from "@restovyn/types";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number; // minor units
}

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

const SAMPLE_MENU: MenuItem[] = [
  { id: "1", name: "Chicken Biryani", category: "Biryani", price: 38000 },
  { id: "2", name: "Awadhi Mutton Biryani", category: "Biryani", price: 48000 },
  {
    id: "3",
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 36000,
  },
  { id: "4", name: "Butter Naan", category: "Breads", price: 7000 },
  { id: "5", name: "Garlic Butter Naan", category: "Breads", price: 9000 },
  { id: "6", name: "Galouti Kebab", category: "Starters", price: 46000 },
  {
    id: "7",
    name: "Paneer Tikka Shashlik",
    category: "Starters",
    price: 34000,
  },
  { id: "8", name: "Dal Makhani", category: "Main Course", price: 32000 },
  { id: "9", name: "Fresh Lime Soda", category: "Beverages", price: 12000 },
  {
    id: "10",
    name: "Gulab Jamun with Rabri",
    category: "Dessert",
    price: 18000,
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

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { id: "1", name: "Chicken Biryani", unitPrice: 38000, quantity: 2 },
    { id: "4", name: "Butter Naan", unitPrice: 7000, quantity: 2 },
  ]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [selectedTable, setSelectedTable] = useState("Table T04");
  const [isOnline, setIsOnline] = useState(true);

  // Billing calculations
  const billing = calculateOrderBilling({
    items: cart.map((c) => ({
      basePrice: c.unitPrice,
      quantity: c.quantity,
    })),
    taxes: [{ name: "GST", ratePercent: 5.0, isInclusive: false }],
    serviceChargePercent: orderType === OrderType.DINE_IN ? 5.0 : 0,
  });

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        { id: item.id, name: item.name, unitPrice: item.price, quantity: 1 },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter((c): c is CartItem => c !== null),
    );
  };

  const filteredMenu = SAMPLE_MENU.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        alert("KOT Fired to Kitchen!");
      } else if (e.key === "F8") {
        e.preventDefault();
        alert(
          `Opening Payment Dialog for ${formatCurrency(billing.grandTotal)}`,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [billing.grandTotal]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center font-bold text-sm">
              RV
            </span>
            <span className="font-bold text-base tracking-tight">
              RestoVyn POS
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
            {selectedTable}
          </span>
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded text-xs">
            <button
              onClick={() => setOrderType(OrderType.DINE_IN)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                orderType === OrderType.DINE_IN
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400"
              }`}
            >
              Dine-In
            </button>
            <button
              onClick={() => setOrderType(OrderType.TAKEAWAY)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                orderType === OrderType.TAKEAWAY
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400"
              }`}
            >
              Takeaway
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Wifi className="w-4 h-4" /> Online (Synced)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <WifiOff className="w-4 h-4" /> Offline (SQLite Active)
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-200">
              Priya Mukherjee (Cashier)
            </p>
            <p className="text-slate-500 text-[10px]">REGISTER #01</p>
          </div>
        </div>
      </header>

      {/* Main POS Grid */}
      <div className="flex flex-1 min-h-0">
        {/* Left Side: Categories & Menu Items */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          {/* Category Bar & Search */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search menu items (F2)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex flex-col justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 active:scale-98 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-400">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 mt-1 line-clamp-2">
                    {item.name}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-emerald-400">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Order Cart & Bill Breakdown */}
        <div className="w-96 flex flex-col bg-slate-900 shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-200">
              Current Order Cart
            </span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              {cart.reduce((acc, c) => acc + c.quantity, 0)} Items
            </span>
          </div>

          {/* Cart Item Lines */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {cart.map((line) => (
              <div
                key={line.id}
                className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {line.name}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    {formatCurrency(line.unitPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(line.id, -1)}
                    className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(line.id, 1)}
                    className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-100 w-16 text-right font-mono">
                  {formatCurrency(line.unitPrice * line.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Billing Summary Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">
                {formatCurrency(billing.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes (GST 5%):</span>
              <span className="font-mono text-slate-200">
                {formatCurrency(billing.taxesTotal)}
              </span>
            </div>
            {billing.serviceChargeTotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Service Charge (5%):</span>
                <span className="font-mono text-slate-200">
                  {formatCurrency(billing.serviceChargeTotal)}
                </span>
              </div>
            )}
            <div className="h-px bg-slate-800 my-1" />
            <div className="flex justify-between text-sm font-bold text-slate-100">
              <span>Grand Total:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {formatCurrency(billing.grandTotal)}
              </span>
            </div>
          </div>

          {/* Quick POS Action Keys */}
          <div className="p-3 border-t border-slate-800 grid grid-cols-3 gap-2 bg-slate-950">
            <button
              onClick={() => alert("Order Held (F4)")}
              className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center gap-1"
            >
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span>Hold (F4)</span>
            </button>
            <button
              onClick={() => alert("KOT Fired to Kitchen Stations (F5)")}
              className="py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex flex-col items-center gap-1 shadow"
            >
              <ChefHat className="w-4 h-4" />
              <span>KOT (F5)</span>
            </button>
            <button
              onClick={() =>
                alert(
                  `Initiating Payment for ${formatCurrency(billing.grandTotal)} (F8)`,
                )
              }
              className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex flex-col items-center gap-1 shadow"
            >
              <CreditCard className="w-4 h-4" />
              <span>PAY (F8)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
