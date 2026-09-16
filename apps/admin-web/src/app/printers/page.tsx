"use client";

import React, { useState } from "react";
import {
  Printer,
  Search,
  Plus,
  Wifi,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface PrinterConfig {
  id: string;
  name: string;
  type: "THERMAL_80MM" | "THERMAL_58MM" | "KITCHEN_IMPACT";
  interfaceType: "NETWORK_TCP" | "USB" | "BLUETOOTH";
  endpoint: string; // e.g. 192.168.1.201:9100
  assignedStation: string;
  status: "ONLINE" | "OFFLINE";
  paperStatus: "NORMAL" | "LOW" | "OUT";
}

const SAMPLE_PRINTERS: PrinterConfig[] = [
  {
    id: "p-1",
    name: "POS Receipt Printer",
    type: "THERMAL_80MM",
    interfaceType: "USB",
    endpoint: "/dev/usb/lp0",
    assignedStation: "Cashier Desk (POS-01)",
    status: "ONLINE",
    paperStatus: "NORMAL",
  },
  {
    id: "p-2",
    name: "Main Kitchen KOT Printer",
    type: "KITCHEN_IMPACT",
    interfaceType: "NETWORK_TCP",
    endpoint: "192.168.1.201:9100",
    assignedStation: "Main Kitchen",
    status: "ONLINE",
    paperStatus: "NORMAL",
  },
  {
    id: "p-3",
    name: "Bar & Beverage Printer",
    type: "THERMAL_80MM",
    interfaceType: "NETWORK_TCP",
    endpoint: "192.168.1.202:9100",
    assignedStation: "Bar",
    status: "ONLINE",
    paperStatus: "NORMAL",
  },
  {
    id: "p-4",
    name: "Tandoor Station Printer",
    type: "THERMAL_80MM",
    interfaceType: "NETWORK_TCP",
    endpoint: "192.168.1.203:9100",
    assignedStation: "Tandoor",
    status: "OFFLINE",
    paperStatus: "OUT",
  },
];

export default function PrintersPage() {
  const [printers] = useState<PrinterConfig[]>(SAMPLE_PRINTERS);

  const handleTestPrint = (name: string) => {
    alert(`Test print job dispatched to ${name} via ESC/POS driver.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="w-6 h-6 text-emerald-600" />
            ESC/POS Thermal & Kitchen Printers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure raw TCP/USB thermal printer endpoints and station KOT
            routing rules
          </p>
        </div>

        <button
          onClick={() => alert("Add Printer wizard")}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Printer Endpoint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {printers.map((printer) => {
          const isOnline = printer.status === "ONLINE";
          return (
            <div
              key={printer.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOnline
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        {printer.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {printer.assignedStation}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      isOnline
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-rose-50 border-rose-300 text-rose-800"
                    }`}
                  >
                    {printer.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Interface:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {printer.interfaceType}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Endpoint / Socket:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {printer.endpoint}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Paper Status:</span>
                    <span
                      className={`font-bold ${printer.paperStatus === "NORMAL" ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      {printer.paperStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleTestPrint(printer.name)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Send Test Slip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
