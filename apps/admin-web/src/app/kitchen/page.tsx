"use client";

import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Coffee,
  Beer,
} from "lucide-react";
import { KOTStatus, PriorityLevel } from "@restovyn/types";

interface KOTTicket {
  id: string;
  kotNumber: string;
  orderNumber: string;
  tableName: string;
  stationName: string;
  createdAt: string; // ISO string
  priority: PriorityLevel;
  status: KOTStatus;
  notes?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes?: string;
    completed: boolean;
  }>;
}

const INITIAL_KOTS: KOTTicket[] = [
  {
    id: "kot-1",
    kotNumber: "KOT-1042",
    orderNumber: "ORD-1042",
    tableName: "Table T04",
    stationName: "Main Kitchen",
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 mins ago
    priority: PriorityLevel.NORMAL,
    status: KOTStatus.PREPARING,
    notes: "Make curries medium spicy, extra gravy",
    items: [
      {
        id: "i-1",
        name: "Chicken Biryani",
        quantity: 2,
        notes: "Boneless",
        completed: false,
      },
      {
        id: "i-2",
        name: "Paneer Butter Masala",
        quantity: 1,
        completed: false,
      },
      { id: "i-3", name: "Butter Naan", quantity: 4, completed: true },
    ],
  },
  {
    id: "kot-2",
    kotNumber: "KOT-1043",
    orderNumber: "ORD-1043",
    tableName: "Table T06",
    stationName: "Tandoor",
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 mins ago
    priority: PriorityLevel.HIGH,
    status: KOTStatus.NEW,
    notes: "VIP Guest - serve sizzling hot",
    items: [
      {
        id: "i-4",
        name: "Galouti Kebab",
        quantity: 2,
        notes: "Extra mint chutney",
        completed: false,
      },
      {
        id: "i-5",
        name: "Paneer Tikka Shashlik",
        quantity: 1,
        completed: false,
      },
    ],
  },
  {
    id: "kot-3",
    kotNumber: "KOT-1044",
    orderNumber: "ORD-1044",
    tableName: "Table T13",
    stationName: "Bar",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    priority: PriorityLevel.NORMAL,
    status: KOTStatus.NEW,
    items: [
      {
        id: "i-6",
        name: "Fresh Lime Soda",
        quantity: 2,
        notes: "1 Sweet, 1 Salted",
        completed: false,
      },
      { id: "i-7", name: "Craft Cold Brew", quantity: 1, completed: true },
    ],
  },
  {
    id: "kot-4",
    kotNumber: "KOT-1045",
    orderNumber: "ORD-1045",
    tableName: "Table T02",
    stationName: "Main Kitchen",
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 mins ago (Urgent!)
    priority: PriorityLevel.URGENT,
    status: KOTStatus.PREPARING,
    notes: "Long waiting delay - please rush",
    items: [
      {
        id: "i-8",
        name: "Awadhi Mutton Biryani",
        quantity: 1,
        completed: false,
      },
      { id: "i-9", name: "Dal Makhani", quantity: 1, completed: false },
      { id: "i-10", name: "Garlic Butter Naan", quantity: 2, completed: false },
    ],
  },
];

const STATIONS = ["All", "Main Kitchen", "Tandoor", "Bar", "Dessert"];

export default function KitchenKDSPage() {
  const [tickets, setTickets] = useState<KOTTicket[]>(INITIAL_KOTS);
  const [selectedStation, setSelectedStation] = useState("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recalledTickets, setRecalledTickets] = useState<KOTTicket[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getAgeInMinutes = (createdAt: string) => {
    const diffMs = currentTime - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const toggleItemCompletion = (ticketId: string, itemId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          items: t.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          ),
        };
      }),
    );
  };

  const bumpTicket = (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    if (target.status === KOTStatus.NEW) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: KOTStatus.PREPARING } : t,
        ),
      );
    } else if (target.status === KOTStatus.PREPARING) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: KOTStatus.READY } : t,
        ),
      );
    } else if (target.status === KOTStatus.READY) {
      // Complete & remove from active KDS
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setRecalledTickets((prev) => [
        { ...target, status: KOTStatus.COMPLETED },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const filteredTickets = tickets.filter((t) =>
    selectedStation === "All" ? true : t.stationName === selectedStation,
  );

  return (
    <div className="space-y-6">
      {/* KDS Header Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Kitchen Display System (KDS)
            </h2>
            <p className="text-xs text-slate-400">
              Active Prep Tickets:{" "}
              <span className="text-amber-400 font-bold">{tickets.length}</span>
            </p>
          </div>
        </div>

        {/* Station Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
          {STATIONS.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStation(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStation === st
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Sound & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-slate-800 border-slate-700 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span>Chime {soundEnabled ? "On" : "Muted"}</span>
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <ChefHat className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
          <h3 className="text-base font-bold text-slate-600">
            All Kitchen Stations are Clear!
          </h3>
          <p className="text-xs">
            No pending food preparation tickets for {selectedStation}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTickets.map((ticket) => {
            const ageMins = getAgeInMinutes(ticket.createdAt);
            const isDelayed = ageMins >= 10 && ageMins < 20;
            const isUrgent =
              ageMins >= 20 || ticket.priority === PriorityLevel.URGENT;

            const headerColor = isUrgent
              ? "bg-rose-600 text-white"
              : isDelayed
                ? "bg-amber-500 text-white"
                : "bg-slate-900 text-white";

            const timerBg = isUrgent
              ? "bg-rose-800 text-rose-100"
              : isDelayed
                ? "bg-amber-600 text-amber-100"
                : "bg-slate-800 text-slate-200";

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                  isUrgent
                    ? "border-rose-300 ring-2 ring-rose-500/30"
                    : "border-slate-200"
                }`}
              >
                {/* Ticket Card Header */}
                <div className={`p-4 ${headerColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base">
                        {ticket.tableName}
                      </span>
                      <span className="text-xs opacity-80">
                        ({ticket.orderNumber})
                      </span>
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 ${timerBg}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ageMins}m</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] opacity-90">
                    <span className="font-semibold">{ticket.stationName}</span>
                    <span className="uppercase font-bold tracking-wider">
                      {ticket.status}
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {ticket.notes && (
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{ticket.notes}</span>
                  </div>
                )}

                {/* Item List */}
                <div className="p-4 flex-1 space-y-2.5 divide-y divide-slate-100">
                  {ticket.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCompletion(ticket.id, item.id)}
                      className={`pt-2 first:pt-0 flex items-start justify-between gap-3 cursor-pointer group select-none ${
                        item.completed ? "opacity-40 line-through" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 text-xs font-black flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            {item.name}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-rose-600 font-medium ml-8 mt-0.5">
                            * {item.notes}
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          item.completed
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 group-hover:border-slate-400"
                        }`}
                      >
                        {item.completed && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ticket Bump Action Button */}
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={() => bumpTicket(ticket.id)}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xs transition-colors flex items-center justify-center gap-2 ${
                      ticket.status === KOTStatus.NEW
                        ? "bg-amber-600 hover:bg-amber-500"
                        : ticket.status === KOTStatus.PREPARING
                          ? "bg-blue-600 hover:bg-blue-500"
                          : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {ticket.status === KOTStatus.NEW
                      ? "Start Preparation"
                      : ticket.status === KOTStatus.PREPARING
                        ? "Mark Ready for Pickup"
                        : "Bump / Completed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
