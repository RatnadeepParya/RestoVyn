import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Users,
  PackageOpen,
  ReceiptText,
  BarChart3,
  Printer,
  Settings,
  Activity,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Live Orders & KOT", href: "/orders", icon: UtensilsCrossed },
  { name: "Kitchen KDS", href: "/kitchen", icon: ChefHat },
  { name: "Tables & Floors", href: "/tables", icon: Layers },
  { name: "Menu Catalog", href: "/menu", icon: UtensilsCrossed },
  { name: "Customers & CRM", href: "/customers", icon: Users },
  { name: "Staff Management", href: "/staff", icon: Users },
  { name: "Inventory & Stock", href: "/inventory", icon: PackageOpen },
  { name: "Finance & Invoices", href: "/finance", icon: ReceiptText },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { name: "Printers & KOT", href: "/printers", icon: Printer },
  { name: "System Settings", href: "/settings", icon: Settings },
  { name: "System Health", href: "/health", icon: Activity },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center font-bold text-white shadow">
            RV
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">RestoVyn</span>
            <span className="block text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
              Admin Suite
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">RestoVyn Internal v1.0.0</p>
        <p>Operational Single-Restaurant</p>
      </div>
    </aside>
  );
}
