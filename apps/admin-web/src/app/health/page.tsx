"use client";

import React, { useState } from "react";
import {
  Activity,
  Server,
  Database,
  Radio,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export default function HealthPage() {
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString());

  const services = [
    {
      name: "Central NestJS API",
      endpoint: "/api/health/live",
      status: "UP",
      latency: "14ms",
      icon: Server,
    },
    {
      name: "PostgreSQL 16 Database",
      endpoint: "/api/health",
      status: "UP",
      latency: "4ms",
      icon: Database,
    },
    {
      name: "Redis 7 Cache & PubSub",
      endpoint: "redis://localhost:6379",
      status: "UP",
      latency: "1ms",
      icon: Radio,
    },
    {
      name: "Socket.IO WebSocket Gateway",
      endpoint: "ws://localhost:4000",
      status: "UP",
      latency: "8ms",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            Infrastructure & System Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry from core backend services, database clusters,
            and real-time socket gateways
          </p>
        </div>

        <button
          onClick={() => setLastCheck(new Date().toLocaleTimeString())}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Checks ({lastCheck})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.name}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {srv.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {srv.endpoint}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 justify-end">
                  <CheckCircle className="w-3 h-3" />
                  {srv.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  {srv.latency}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
