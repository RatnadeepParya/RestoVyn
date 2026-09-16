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
  Layers,
  Calculator,
  Users,
  Printer,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { calculateOrderBilling } from "@restovyn/business-rules";
import { OrderType, PaymentMethod } from "@restovyn/types";
import { PaymentModal } from "./components/PaymentModal";
import { SplitBillModal } from "./components/SplitBillModal";
import { CashDrawerModal } from "./components/CashDrawerModal";
import { TableModal } from "./components/TableModal";
import { ReceiptModal } from "./components/ReceiptModal";
import { syncEngine } from "./sync/syncEngine";

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
  const [orderNumber, setOrderNumber] = useState("ORD-1048");
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTenders, setLastTenders] = useState<
    Array<{ method: string; amount: number }>
  >([]);

  // Sync queue subscription
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((pending) => {
      setPendingSyncCount(pending);
    });
    return unsubscribe;
  }, []);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setIsTableModalOpen(true);
      } else if (e.key === "F7") {
        e.preventDefault();
        setIsDrawerOpen(true);
      } else if (e.key === "F8") {
        e.preventDefault();
        setIsSplitOpen(true);
      } else if (e.key === "F12") {
        e.preventDefault();
        setIsPaymentOpen(true);
      } else if (e.key === "Escape") {
        setIsPaymentOpen(false);
        setIsSplitOpen(false);
        setIsDrawerOpen(false);
        setIsTableModalOpen(false);
        setIsReceiptOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Billing calculation
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
    setCart(
      (prev) =>
        prev
          .map((c) => {
            if (c.id === id) {
              const next = c.quantity + delta;
              return next > 0 ? { ...c, quantity: next } : null;
            }
            return c;
          })
          .filter(Boolean) as CartItem[],
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleFireKot = () => {
    if (cart.length === 0) return;
    syncEngine.enqueueAction("CREATE_ORDER", {
      orderNumber,
      tableName: selectedTable,
      orderType,
      items: cart,
    });
    alert(`KOT Fired for ${selectedTable}! Printed at Kitchen & Bar.`);
  };

  const handlePaymentComplete = (
    tenders: { method: PaymentMethod; amount: number; reference?: string }[],
  ) => {
    syncEngine.enqueueAction("PROCESS_PAYMENT", {
      orderNumber,
      tableName: selectedTable,
      grandTotal: billing.grandTotal,
      tenders,
    });
    setLastTenders(tenders);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
    setCart([]);
    setOrderNumber("ORD-" + (parseInt(orderNumber.split("-")[1]) + 1));
  };

  const filteredItems = SAMPLE_MENU.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans select-none text-slate-800">
      {/* 1. Category Sidebar */}
      <div className="w-48 bg-slate-900 flex flex-col shrink-0 text-white border-r border-slate-800">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow">
            RV
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block">
              RestoVyn POS
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase">
              Terminal 01
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Nav in Sidebar */}
        <div className="p-2 border-t border-slate-800 space-y-1">
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Tables (F2)</span>
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Cash Drawer (F7)</span>
          </button>
        </div>
      </div>

      {/* 2. Menu Catalog Grid Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Operational Bar */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items (e.g. Biryani, Naan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Table Badge */}
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedTable}</span>
            </button>

            {/* Offline Sync Indicator */}
            <button
              onClick={() => syncEngine.syncWithServer()}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                pendingSyncCount > 0
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
              }`}
            >
              {pendingSyncCount > 0 ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span>Sync Pending ({pendingSyncCount})</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Synced</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between text-left group"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h4>
                </div>
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-sm text-emerald-700">
                    {formatCurrency(item.price)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Live Order Cart & Settlement Panel */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-lg">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">
                {orderNumber}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                {orderType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned to {selectedTable}
            </p>
          </div>

          <button
            onClick={clearCart}
            title="Clear Cart"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 border-b border-slate-200">
          {[OrderType.DINE_IN, OrderType.TAKEAWAY, OrderType.DELIVERY].map(
            (type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  orderType === type
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {type}
              </button>
            ),
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ChefHat className="w-10 h-10 stroke-1" />
              <p className="text-xs font-semibold">No items in current order</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div className="flex-1 pr-2">
                  <h5 className="font-bold text-xs text-slate-900 truncate">
                    {item.name}
                  </h5>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Billing Breakdown */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Subtotal:</span>
            <span className="text-slate-900 font-semibold">
              {formatCurrency(billing.subtotal)}
            </span>
          </div>
          {billing.taxBreakdown.map((t) => (
            <div
              key={t.name}
              className="flex justify-between text-slate-500 font-medium"
            >
              <span>
                {t.name} ({t.ratePercent}%):
              </span>
              <span className="text-slate-900 font-semibold">
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
          {billing.serviceChargeTotal > 0 && (
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Service Charge (5%):</span>
              <span className="text-slate-900 font-semibold">
                {formatCurrency(billing.serviceChargeTotal)}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm font-extrabold text-slate-900">
              Grand Total:
            </span>
            <span className="text-xl font-black text-emerald-700">
              {formatCurrency(billing.grandTotal)}
            </span>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleFireKot}
              className="py-2.5 bg-amber-500 disabled:opacity-50 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ChefHat className="w-4 h-4" />
              Fire KOT
            </button>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsSplitOpen(true)}
              className="py-2.5 bg-slate-800 disabled:opacity-50 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              Split (F8)
            </button>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full py-3.5 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Settle & Pay (F12)
          </button>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmountInMinorUnits={billing.grandTotal}
        onCompletePayment={handlePaymentComplete}
      />

      <SplitBillModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
        totalAmountInMinorUnits={billing.grandTotal}
        onCompleteSplit={(shares) => {
          setIsSplitOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      <CashDrawerModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentCashInDrawer={1284000}
        onSessionUpdate={(session) => {
          console.log("Drawer session updated:", session);
        }}
      />

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTable={selectedTable}
        onSelectTable={(tbl) => setSelectedTable(tbl)}
        onTransferTable={(from, to) => setSelectedTable(to)}
        onMergeTable={(src, tgt) => setSelectedTable(tgt)}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        orderNumber={orderNumber}
        tableName={selectedTable}
        cart={cart}
        billing={billing}
        tenders={lastTenders}
      />
    </div>
  );
}
