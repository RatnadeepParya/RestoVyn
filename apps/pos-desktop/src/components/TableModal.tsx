import React, { useState } from "react";
import { X, Layers, ArrowRightLeft, Merge, CheckCircle } from "lucide-react";

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  onSelectTable: (tableName: string) => void;
  onTransferTable: (fromTable: string, toTable: string) => void;
  onMergeTable: (sourceTable: string, targetTable: string) => void;
}

const FLOORS_WITH_TABLES = [
  {
    floorName: "Ground Main Dining",
    tables: [
      { id: "T01", name: "Table T01", capacity: 2, status: "AVAILABLE" },
      { id: "T02", name: "Table T02", capacity: 4, status: "OCCUPIED" },
      { id: "T03", name: "Table T03", capacity: 4, status: "AVAILABLE" },
      { id: "T04", name: "Table T04", capacity: 6, status: "OCCUPIED" },
      { id: "T05", name: "Table T05", capacity: 4, status: "AVAILABLE" },
      { id: "T06", name: "Table T06", capacity: 8, status: "BILL_REQUESTED" },
    ],
  },
  {
    floorName: "First Floor Terrace",
    tables: [
      { id: "T11", name: "Table T11", capacity: 4, status: "AVAILABLE" },
      { id: "T12", name: "Table T12", capacity: 4, status: "AVAILABLE" },
      { id: "T13", name: "Table T13", capacity: 6, status: "OCCUPIED" },
      { id: "T14", name: "Table T14", capacity: 2, status: "AVAILABLE" },
    ],
  },
  {
    floorName: "Rooftop Lounge",
    tables: [
      { id: "T21", name: "Table T21", capacity: 6, status: "AVAILABLE" },
      { id: "T22", name: "Table T22", capacity: 8, status: "OCCUPIED" },
      { id: "T23", name: "Table T23", capacity: 4, status: "AVAILABLE" },
    ],
  },
];

export function TableModal({
  isOpen,
  onClose,
  currentTable,
  onSelectTable,
  onTransferTable,
  onMergeTable,
}: TableModalProps) {
  if (!isOpen) return null;

  const [selectedFloor, setSelectedFloor] = useState(
    FLOORS_WITH_TABLES[0].floorName,
  );
  const [actionType, setActionType] = useState<"SWITCH" | "TRANSFER" | "MERGE">(
    "SWITCH",
  );
  const [targetTable, setTargetTable] = useState<string>("");

  const currentFloorData =
    FLOORS_WITH_TABLES.find((f) => f.floorName === selectedFloor) ||
    FLOORS_WITH_TABLES[0];

  const handleTableClick = (tblName: string) => {
    if (actionType === "SWITCH") {
      onSelectTable(tblName);
      onClose();
    } else {
      setTargetTable(tblName);
    }
  };

  const handleExecuteAction = () => {
    if (!targetTable) return;
    if (actionType === "TRANSFER") {
      onTransferTable(currentTable, targetTable);
      alert(
        `Order successfully transferred from ${currentTable} to ${targetTable}`,
      );
    } else if (actionType === "MERGE") {
      onMergeTable(currentTable, targetTable);
      alert(`Tables ${currentTable} and ${targetTable} successfully merged`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Floor & Table Management</h3>
              <p className="text-xs text-slate-400">
                Current Active:{" "}
                <span className="text-emerald-400 font-semibold">
                  {currentTable}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Action Modes */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActionType("SWITCH");
                setTargetTable("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                actionType === "SWITCH"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Select / Switch Table
            </button>
            <button
              onClick={() => {
                setActionType("TRANSFER");
                setTargetTable("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                actionType === "TRANSFER"
                  ? "bg-emerald-700 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer Order
            </button>
            <button
              onClick={() => {
                setActionType("MERGE");
                setTargetTable("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                actionType === "MERGE"
                  ? "bg-purple-700 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Merge className="w-3.5 h-3.5" />
              Merge Tables
            </button>
          </div>

          {targetTable && (
            <span className="text-xs font-bold text-slate-700">
              Target:{" "}
              <span className="text-emerald-600 font-extrabold">
                {targetTable}
              </span>
            </span>
          )}
        </div>

        {/* Floor Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white gap-3">
          {FLOORS_WITH_TABLES.map((f) => (
            <button
              key={f.floorName}
              onClick={() => setSelectedFloor(f.floorName)}
              className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                selectedFloor === f.floorName
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.floorName}
            </button>
          ))}
        </div>

        {/* Table Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentFloorData.tables.map((t) => {
              const isCurrent = t.name === currentTable;
              const isTarget = t.name === targetTable;
              const isOccupied = t.status === "OCCUPIED";

              return (
                <button
                  key={t.id}
                  onClick={() => handleTableClick(t.name)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                    isTarget
                      ? "ring-2 ring-emerald-500 bg-emerald-50 border-emerald-500 shadow-md"
                      : isCurrent
                        ? "ring-2 ring-slate-900 bg-slate-900 text-white shadow-md"
                        : isOccupied
                          ? "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <span
                    className={`text-base font-extrabold ${isCurrent ? "text-white" : "text-slate-900"}`}
                  >
                    {t.name}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${isCurrent ? "text-slate-300" : "text-slate-500"}`}
                  >
                    Seats {t.capacity}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      isCurrent
                        ? "bg-slate-800 text-emerald-400"
                        : isOccupied
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isCurrent ? "CURRENT" : t.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          {actionType !== "SWITCH" && (
            <button
              type="button"
              disabled={!targetTable}
              onClick={handleExecuteAction}
              className="px-6 py-2 rounded-xl bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow hover:bg-emerald-500 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm {actionType === "TRANSFER" ? "Transfer" : "Merge"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
