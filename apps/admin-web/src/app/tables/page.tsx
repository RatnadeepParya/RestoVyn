"use client";

import React, { useState } from "react";
import {
  Layers,
  Users,
  Clock,
  CheckCircle,
  Receipt,
  Sparkles,
  Plus,
  ArrowRightLeft,
  XCircle,
} from "lucide-react";
import { TableStatus } from "@restovyn/types";

interface TableData {
  id: string;
  tableNumber: string;
  name: string;
  capacity: number;
  status: TableStatus;
  orderNumber?: string;
  occupiedSinceMinutes?: number;
  activeBillAmount?: number; // minor units
}

interface FloorPlan {
  floorId: string;
  floorName: string;
  tables: TableData[];
}

const INITIAL_FLOORS: FloorPlan[] = [
  {
    floorId: "f-1",
    floorName: "Ground Main Dining",
    tables: [
      {
        id: "t-1",
        tableNumber: "T01",
        name: "Table T01",
        capacity: 2,
        status: TableStatus.AVAILABLE,
      },
      {
        id: "t-2",
        tableNumber: "T02",
        name: "Table T02",
        capacity: 4,
        status: TableStatus.OCCUPIED,
        orderNumber: "ORD-1045",
        occupiedSinceMinutes: 28,
        activeBillAmount: 83000,
      },
      {
        id: "t-3",
        tableNumber: "T03",
        name: "Table T03",
        capacity: 4,
        status: TableStatus.AVAILABLE,
      },
      {
        id: "t-4",
        tableNumber: "T04",
        name: "Table T04",
        capacity: 6,
        status: TableStatus.OCCUPIED,
        orderNumber: "ORD-1042",
        occupiedSinceMinutes: 45,
        activeBillAmount: 142000,
      },
      {
        id: "t-5",
        tableNumber: "T05",
        name: "Table T05",
        capacity: 4,
        status: TableStatus.AVAILABLE,
      },
      {
        id: "t-6",
        tableNumber: "T06",
        name: "Table T06",
        capacity: 8,
        status: TableStatus.BILL_REQUESTED,
        orderNumber: "ORD-1043",
        occupiedSinceMinutes: 62,
        activeBillAmount: 215000,
      },
      {
        id: "t-7",
        tableNumber: "T07",
        name: "Table T07",
        capacity: 4,
        status: TableStatus.CLEANING,
      },
      {
        id: "t-8",
        tableNumber: "T08",
        name: "Table T08",
        capacity: 2,
        status: TableStatus.RESERVED,
      },
    ],
  },
  {
    floorId: "f-2",
    floorName: "First Floor Terrace",
    tables: [
      {
        id: "t-11",
        tableNumber: "T11",
        name: "Table T11",
        capacity: 4,
        status: TableStatus.AVAILABLE,
      },
      {
        id: "t-12",
        tableNumber: "T12",
        name: "Table T12",
        capacity: 4,
        status: TableStatus.AVAILABLE,
      },
      {
        id: "t-13",
        tableNumber: "T13",
        name: "Table T13",
        capacity: 6,
        status: TableStatus.OCCUPIED,
        orderNumber: "ORD-1044",
        occupiedSinceMinutes: 18,
        activeBillAmount: 48000,
      },
      {
        id: "t-14",
        tableNumber: "T14",
        name: "Table T14",
        capacity: 2,
        status: TableStatus.AVAILABLE,
      },
    ],
  },
  {
    floorId: "f-3",
    floorName: "Rooftop Lounge",
    tables: [
      {
        id: "t-21",
        tableNumber: "T21",
        name: "Table T21",
        capacity: 6,
        status: TableStatus.AVAILABLE,
      },
      {
        id: "t-22",
        tableNumber: "T22",
        name: "Table T22",
        capacity: 8,
        status: TableStatus.OCCUPIED,
        orderNumber: "ORD-1046",
        occupiedSinceMinutes: 35,
        activeBillAmount: 310000,
      },
      {
        id: "t-23",
        tableNumber: "T23",
        name: "Table T23",
        capacity: 4,
        status: TableStatus.AVAILABLE,
      },
    ],
  },
];

export default function TablesManagementPage() {
  const [floors, setFloors] = useState<FloorPlan[]>(INITIAL_FLOORS);
  const [selectedFloorId, setSelectedFloorId] = useState("f-1");
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  const currentFloor =
    floors.find((f) => f.floorId === selectedFloorId) || floors[0];

  const formatCurrency = (minorUnits?: number) => {
    if (!minorUnits) return "₹0.00";
    return (minorUnits / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const updateTableStatus = (tableId: string, newStatus: TableStatus) => {
    setFloors((prev) =>
      prev.map((floor) => ({
        ...floor,
        tables: floor.tables.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: newStatus,
                occupiedSinceMinutes:
                  newStatus === TableStatus.OCCUPIED ? 1 : undefined,
                activeBillAmount:
                  newStatus === TableStatus.AVAILABLE
                    ? undefined
                    : t.activeBillAmount,
              }
            : t,
        ),
      })),
    );
    if (selectedTable?.id === tableId) {
      setSelectedTable((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            Floor Plan & Table Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time table turnover, dining durations, and occupancy
            rates
          </p>
        </div>

        {/* Floor Picker Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {floors.map((fl) => (
            <button
              key={fl.floorId}
              onClick={() => setSelectedFloorId(fl.floorId)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedFloorId === fl.floorId
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {fl.floorName}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Bill Requested</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400"></span>
          <span>Cleaning</span>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {currentFloor.tables.map((table) => {
          const isOccupied = table.status === TableStatus.OCCUPIED;
          const isBillReq = table.status === TableStatus.BILL_REQUESTED;
          const isReserved = table.status === TableStatus.RESERVED;
          const isCleaning = table.status === TableStatus.CLEANING;

          const badgeColor = isOccupied
            ? "bg-amber-100 text-amber-800 border-amber-300"
            : isBillReq
              ? "bg-blue-100 text-blue-800 border-blue-300 animate-pulse"
              : isReserved
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : isCleaning
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : "bg-emerald-100 text-emerald-800 border-emerald-300";

          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                selectedTable?.id === table.id
                  ? "ring-2 ring-emerald-600 border-emerald-600"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {table.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Seats {table.capacity}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${badgeColor}`}
                >
                  {table.status}
                </span>
              </div>

              {/* Order / Duration Meta */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                {table.orderNumber && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Order:</span>
                    <span className="font-bold text-slate-800">
                      {table.orderNumber}
                    </span>
                  </div>
                )}
                {table.occupiedSinceMinutes !== undefined && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Dining Duration:</span>
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {table.occupiedSinceMinutes}m
                    </span>
                  </div>
                )}
                {table.activeBillAmount !== undefined && (
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                    <span>Active Bill:</span>
                    <span className="text-emerald-700 font-extrabold">
                      {formatCurrency(table.activeBillAmount)}
                    </span>
                  </div>
                )}
                {!table.orderNumber && (
                  <p className="text-[11px] text-slate-400 italic py-1 text-center">
                    Ready to seat guests
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                {table.status === TableStatus.AVAILABLE ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, TableStatus.OCCUPIED);
                      }}
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Seat Guests
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, TableStatus.RESERVED);
                      }}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Reserve
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, TableStatus.CLEANING);
                      }}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Clean Table
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, TableStatus.AVAILABLE);
                      }}
                      className="py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors"
                    >
                      Free Table
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
