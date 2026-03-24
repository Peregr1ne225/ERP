import Link from "next/link";
import React from "react";
import { api } from "@/lib/proxy";

export const dynamic = "force-dynamic";

interface InventoryItem {
  current_stock: number;
}

interface ConversionItem {
  aov: number;
  conversion_rate: number;
}

interface ProjectItem {
  percent_complete: number;
}

interface LedgerItem {
  movement_type: string;
  sku: string;
  qty_change: number;
  date: string;
}

export default async function DashboardPage() {
  // Fetch data from Django backend
  // Use getAll for metrics aggregating entire datasets to handle DRF Pagination
  const [inventoryRes, conversionsRes, projectsRes, ledgerRes] = await Promise.allSettled([
    api.getAll("/api/inventory/current-inventory/"),
    api.get("/api/kpi/website-conversions/"),
    api.getAll("/api/project/projects/"),
    api.get("/api/inventory/inventory-ledger/"),
  ]);

  // Safely extract data ignoring failed requests
  const extractData = (res: PromiseSettledResult<unknown>) => {
    if (res.status === "fulfilled" && res.value) {
      const val = res.value as Record<string, unknown>;
      // api.getAll returns an array directly, api.get might return paginated object
      return Array.isArray(val) ? val : (val.results || val);
    }
    return [];
  };

  const inventoryList = (Array.isArray(extractData(inventoryRes)) ? extractData(inventoryRes) : []) as InventoryItem[];
  const conversionsList = (Array.isArray(extractData(conversionsRes)) ? extractData(conversionsRes) : []) as ConversionItem[];
  const projectsList = (Array.isArray(extractData(projectsRes)) ? extractData(projectsRes) : []) as ProjectItem[];
  const ledgerList = (Array.isArray(extractData(ledgerRes)) ? extractData(ledgerRes) : []) as LedgerItem[];

  // Calculate UI Metrics
  // 1. Total Inventory
  const totalInventory = inventoryList.reduce((sum, item) => sum + (item.current_stock || 0), 0);

  // 2. Average Order Value (AOV) from Conversions (Using Latest)
  const latestConversion = conversionsList[0] || { aov: 0, conversion_rate: 0 };
  const avgOrderValue = `฿${latestConversion.aov || 0}`;

  // 3. Average Project Completion
  const avgProjectComp = projectsList.length > 0
    ? Math.round(projectsList.reduce((sum, p) => sum + (p.percent_complete || 0), 0) / projectsList.length)
    : 0;

  // 4. Recent Ledgers limit to 4
  const recentLedgers = ledgerList.slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              ERP Overview
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-lg">
              Welcome back. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500">
              Refresh Data
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Physical Inventory"
            value={totalInventory.toLocaleString()}
            metric="Live Data"
            metricPositive={true}
            gradient="from-emerald-500/10 to-teal-500/10"
            icon={
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <DashboardCard
            title="Avg Order Value (Latest)"
            value={avgOrderValue}
            metric={`${latestConversion.conversion_rate || 0}% CVR`}
            metricPositive={true}
            gradient="from-blue-500/10 to-indigo-500/10"
            icon={
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <DashboardCard
            title="Avg Project Comp."
            value={`${avgProjectComp}%`}
            metric="From tracked projects"
            metricPositive={avgProjectComp > 50}
            gradient="from-purple-500/10 to-pink-500/10"
            icon={
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
        </div>

        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {recentLedgers.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">No recent transactions found.</p>
              ) : recentLedgers.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <span className="font-semibold text-sm">{tx.movement_type === "MANUAL_IN" ? "IN" : "OUT"}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {tx.sku} <span className="text-zinc-400 font-normal">({tx.qty_change > 0 ? "+" : ""}{tx.qty_change})</span>
                      </p>
                      <p className="text-sm text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-medium px-3 py-1 rounded-full text-xs transition-colors ${tx.movement_type === "MANUAL_IN"
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200'
                    }`}>
                    {tx.movement_type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickLink href="/inventory/products" label="Products" icon="📦" />
                <QuickLink href="/kpi/campaigns" label="Campaigns" icon="📈" />
                <QuickLink href="/projects" label="Projects" icon="🎯" />
                <QuickLink href="/hr/employees" label="Directory" icon="👥" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  metric: string;
  metricPositive: boolean;
  icon: React.ReactNode;
  gradient: string;
}

function DashboardCard({ title, value, metric, metricPositive, icon, gradient }: DashboardCardProps) {
  return (
    <div className={`relative p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${gradient} rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`} />
      <div className="relative z-10 flex justify-between items-start">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-4">
        <h3 className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">{title}</h3>
        <p className="text-4xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{value}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${metricPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
            {metric}
          </span>
        </div>
      </div>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  label: string;
  icon: string | React.ReactNode;
}

function QuickLink({ href, label, icon }: QuickLinkProps) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group focus:outline-none focus:ring-2 focus:ring-zinc-500">
      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">{label}</span>
    </Link>
  );
}
