"use client";

import React, { useState } from "react";
import {
  UtensilsCrossed,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Layers,
} from "lucide-react";
import { OrderStatus, OrderType } from "@restovyn/types";

interface OrderSummary {
  id: string;
  orderNumber: string;
  tableName: string;
  orderType: OrderType;
  captainName: string;
  status: OrderStatus;
  itemsCount: number;
  grandTotal: number; // minor units
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
}

const SAMPLE_ORDERS: OrderSummary[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-1042",
    tableName: "Table T04",
    orderType: OrderType.DINE_IN,
    captainName: "Vikram Sen",
    status: OrderStatus.PREPARING,
    itemsCount: 7,
    grandTotal: 142000,
    createdAt: "10 mins ago",
    items: [
      { id: "1", name: "Chicken Biryani", quantity: 2, price: 76000 },
      { id: "2", name: "Paneer Butter Masala", quantity: 1, price: 36000 },
      { id: "3", name: "Butter Naan", quantity: 4, price: 28000 },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "ORD-1043",
    tableName: "Table T06",
    orderType: OrderType.DINE_IN,
    captainName: "Amit Roy",
    status: OrderStatus.BILL_REQUESTED,
    itemsCount: 5,
    grandTotal: 215000,
    createdAt: "35 mins ago",
    items: [
      { id: "4", name: "Galouti Kebab", quantity: 2, price: 92000 },
      { id: "5", name: "Awadhi Mutton Biryani", quantity: 2, price: 96000 },
      { id: "6", name: "Fresh Lime Soda", quantity: 2, price: 24000 },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "ORD-1044",
    tableName: "Takeaway Counter",
    orderType: OrderType.TAKEAWAY,
    captainName: "Priya Das",
    status: OrderStatus.PAID,
    itemsCount: 3,
    grandTotal: 83600,
    createdAt: "50 mins ago",
    items: [
      { id: "7", name: "Paneer Butter Masala", quantity: 1, price: 36000 },
      { id: "8", name: "Garlic Butter Naan", quantity: 4, price: 36000 },
    ],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>(SAMPLE_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const formatCurrency = (minorUnits: number) => {
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const handleCancelItem = (orderId: string, itemId: string) => {
    const reason = prompt(
      "Enter cancellation reason (e.g. Guest changed mind, Kitchen 86):",
    );
    if (!reason) return;
    alert(
      `Item ${itemId} cancelled from order ${orderId}. Reason logged to audit: "${reason}"`,
    );
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.captainName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            Live Orders & KOT Master
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time table orders, kitchen ticket workflows, and
            settlement states
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          {[
            "ALL",
            OrderStatus.PREPARING,
            OrderStatus.BILL_REQUESTED,
            OrderStatus.PAID,
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, table, captain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredOrders.length} Orders Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Table / Counter</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Captain</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold">{ord.tableName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ord.orderType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{ord.captainName}</td>
                  <td className="py-3.5 px-4">{ord.itemsCount} items</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {ord.createdAt}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {formatCurrency(ord.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === OrderStatus.PAID
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === OrderStatus.BILL_REQUESTED
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedOrder.tableName} • Captain:{" "}
                  {selectedOrder.captainName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Line Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {item.name} x {item.quantity}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-700">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleCancelItem(selectedOrder.id, item.id)
                      }
                      className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                    >
                      Void Item
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Total Bill Amount:
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(selectedOrder.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
