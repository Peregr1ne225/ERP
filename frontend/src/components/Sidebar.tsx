import Link from "next/link";
import React from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  {
    name: "Inventory",
    icon: "📦",
    href: "/inventory",
    items: [
      { name: "Products", href: "/inventory/products" },
      { name: "Ledger", href: "/inventory/ledger" },
      { name: "Settings", href: "/inventory/settings" },
    ],
  },
  {
    name: "Marketing & KPIs",
    icon: "📈",
    href: "/kpi",
    items: [
      { name: "Campaigns", href: "/kpi/campaigns" },
      { name: "Ad Performance", href: "/kpi/ads" },
      { name: "Conversions", href: "/kpi/conversions" },
    ],
  },
  {
    name: "HR & Projects",
    icon: "👥",
    href: "/project",
    items: [
      { name: "Employees", href: "/project/employees" },
      { name: "Attendance", href: "/project/attendance" },
      { name: "Projects", href: "/project/project" },
    ],
  },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-500">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <span className="text-sm">E</span>
          </div>
          ERP System
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-8">
          {navigation.map((group) => (
            <div key={group.name} className="space-y-3">
              {group.items ? (
                <>
                  {group.href ? (
                    <Link href={group.href} className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                      <span className="text-base">{group.icon}</span> {group.name}
                    </Link>
                  ) : (
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="text-base">{group.icon}</span> {group.name}
                    </h3>
                  )}
                  <div className="space-y-1 pl-7 mt-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={group.href}
                  className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                >
                  <span className="text-base text-zinc-400 group-hover:text-zinc-500">{group.icon}</span>
                  {group.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      {/* <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-white">Admin User</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">admin@erp.com</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
