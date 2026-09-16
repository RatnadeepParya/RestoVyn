"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Key,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";
import { StaffRole, StaffStatus } from "@restovyn/types";

interface StaffMember {
  id: string;
  name: string;
  employeeCode: string;
  role: StaffRole;
  phone: string;
  email?: string;
  status: StaffStatus;
  hasPin: boolean;
}

const SAMPLE_STAFF: StaffMember[] = [
  {
    id: "s-1",
    name: "Ratnadeep Parya",
    employeeCode: "EMP001",
    role: StaffRole.OWNER,
    phone: "+91 98765 43210",
    email: "owner@restovyn.com",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
  {
    id: "s-2",
    name: "Ananya Roy",
    employeeCode: "EMP002",
    role: StaffRole.MANAGER,
    phone: "+91 98765 43211",
    email: "manager@restovyn.com",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
  {
    id: "s-3",
    name: "Rahul Sharma",
    employeeCode: "EMP003",
    role: StaffRole.CASHIER,
    phone: "+91 98765 43212",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
  {
    id: "s-4",
    name: "Vikram Sen",
    employeeCode: "EMP004",
    role: StaffRole.CAPTAIN,
    phone: "+91 98765 43213",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
  {
    id: "s-5",
    name: "Chef Sanjeev",
    employeeCode: "EMP005",
    role: StaffRole.KITCHEN,
    phone: "+91 98765 43214",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
  {
    id: "s-6",
    name: "Ramesh Gupta",
    employeeCode: "EMP006",
    role: StaffRole.INVENTORY_MANAGER,
    phone: "+91 98765 43215",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
  {
    id: "s-7",
    name: "Pooja Banerjee",
    employeeCode: "EMP007",
    role: StaffRole.ACCOUNTANT,
    phone: "+91 98765 43216",
    status: StaffStatus.ACTIVE,
    hasPin: true,
  },
];

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [searchQuery, setSearchQuery] = useState("");

  const handleResetPin = (name: string) => {
    const pin = prompt(`Enter new 4-digit POS PIN for ${name}:`);
    if (pin && pin.length === 4) {
      alert(`POS PIN updated successfully for ${name}.`);
    } else if (pin) {
      alert("PIN must be exactly 4 digits.");
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Staff & Access Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage operational roles (Owner, Manager, Cashier, Captain, Kitchen,
            Inventory, Accountant) & PINs
          </p>
        </div>

        <button
          onClick={() => alert("Add Staff member dialog opened")}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, role, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredStaff.length} Employees Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">POS PIN</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStaff.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.employeeCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{s.phone}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active (Hashed)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleResetPin(s.name)}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Key className="w-3 h-3 text-slate-500" />
                      Reset PIN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
