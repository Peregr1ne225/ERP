import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";

export const dynamic = "force-dynamic";

interface Product {
  sku_id: string;
  product_name: string;
  category: string;
}

interface CurrentInventory {
  sku: string;
  current_stock: number;
}

interface PriceHistory {
  sku: string;
  factory_cost: string | number;
  retail_price: string | number;
  effective_date: string;
}

interface LedgerEntry {
  id: number;
  sku: string;
  movement_type: string;
  qty_change: number;
  date: string;
  note: string | null;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default async function InventoryDashboardPage() {
  // Fetch all core datasets concurrently
  const [productsRaw, inventoryRaw, pricingRaw, ledgersTopRaw] = await Promise.allSettled([
    api.getAll("/api/inventory/products/"),
    api.getAll("/api/inventory/current-inventory/"),
    api.getAll("/api/inventory/price-history/"),
    // Just fetch the first page of the ledger for "Recent Activity"
    api.get("/api/inventory/inventory-ledger/")
  ]);

  const products = (productsRaw.status === "fulfilled" && Array.isArray(productsRaw.value) ? productsRaw.value : []) as Product[];
  const inventory = (inventoryRaw.status === "fulfilled" && Array.isArray(inventoryRaw.value) ? inventoryRaw.value : []) as CurrentInventory[];
  const pricing = (pricingRaw.status === "fulfilled" && Array.isArray(pricingRaw.value) ? pricingRaw.value : []) as PriceHistory[];
  const recentLedgers = (ledgersTopRaw.status === "fulfilled" ? (ledgersTopRaw.value as unknown as PaginatedResponse<LedgerEntry>)?.results || [] : []) as LedgerEntry[];

  // 1. Total Unique SKUs
  const totalSKUs = products.length;

  // 2. Total Units in Stock
  const totalUnits = inventory.reduce((sum, item) => sum + item.current_stock, 0);

  // 3. Valuations
  // Map latest price per SKU
  const latestPricing = new Map<string, PriceHistory>();
  const sortedPricing = [...pricing].sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());
  
  // As we iterate chronological ascending, the last one set in the map will be the latest
  sortedPricing.forEach(p => {
    latestPricing.set(p.sku, p);
  });

  let totalCapital = 0;
  let totalRetailValue = 0;

  inventory.forEach(item => {
    if (item.current_stock > 0) {
      const price = latestPricing.get(item.sku);
      if (price) {
        totalCapital += Number(price.factory_cost) * item.current_stock;
        totalRetailValue += Number(price.retail_price) * item.current_stock;
      }
    }
  });

  const potentialProfit = totalRetailValue - totalCapital;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Inventory Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              At-a-glance metrics covering {totalSKUs} unique products in your catalog.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/inventory/products/new"
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Product
            </Link>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           
           {/* Units in Stock */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Global Live Stock</h3>
                    <div className="mt-2 text-4xl font-black text-zinc-900 dark:text-white">{totalUnits.toLocaleString()}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">Physical units in warehouse</p>
              </div>
           </div>

           {/* Total Capital */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Tied Capital</h3>
                    <div className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-500">฿{totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">Based on factory cost</p>
              </div>
           </div>

           {/* Retail Value */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Inventory Value</h3>
                    <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-500">฿{totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">Based on retail matrix</p>
              </div>
           </div>

           {/* Potential Profit */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Est. Profit</h3>
                    <div className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">฿{potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">{totalCapital > 0 ? Math.round((potentialProfit / totalRetailValue) * 100) : 0}% aggregate margin</p>
              </div>
           </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Recent Activity Timeline */}
           <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Recent Ledger Activity
                 </h2>
                 <Link href="/inventory/ledger" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    View Full Audit Log &rarr;
                 </Link>
              </div>
              
              {recentLedgers.length === 0 ? (
                 <div className="py-12 text-center text-zinc-400 font-medium italic">No recent activity detected.</div>
              ) : (
                 <div className="space-y-4">
                    {recentLedgers.slice(0, 6).map((ledger) => (
                       <Link 
                         key={ledger.id} 
                         href={`/inventory/products/${ledger.sku}`}
                         className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group"
                       >
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner font-bold text-sm ${
                                ledger.movement_type === "MANUAL_IN" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" :
                                ledger.movement_type === "MANUAL_OUT" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
                                "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
                             }`}>
                                {ledger.movement_type === "MANUAL_IN" ? "IN" : ledger.movement_type === "MANUAL_OUT" ? "OUT" : "DMG"}
                             </div>
                             <div>
                                <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                                  {ledger.sku} 
                                  <span className={`ml-2 text-sm ${ledger.qty_change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                     {ledger.qty_change > 0 ? '+' : ''}{ledger.qty_change}
                                  </span>
                                </p>
                                <p className="text-sm text-zinc-500">
                                  {new Date(ledger.date).toLocaleString(undefined, {
                                     month: 'short',
                                     day: 'numeric',
                                     hour: '2-digit',
                                     minute: '2-digit'
                                  })}
                                </p>
                             </div>
                          </div>
                          
                          {ledger.note && (
                             <div className="hidden md:block text-sm text-zinc-400 italic max-w-xs truncate">
                                &quot;{ledger.note}&quot;
                             </div>
                          )}
                       </Link>
                    ))}
                 </div>
              )}
           </div>

           {/* Quick Actions / Ecosystem */}
           <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-white relative overflow-hidden">
                 <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">Master Product List</h2>
                    <p className="text-zinc-400 text-sm mb-6">Manage all {totalSKUs} SKUs, adjust individual limits, and configure economics.</p>
                    <Link href="/inventory/products" className="inline-block px-5 py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors shadow-lg">
                       Open Product Master
                    </Link>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-zinc-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
              </div>

              <Link href="/inventory/settings" className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-6 transition-colors group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                       <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Inventory Settings</h3>
                       <p className="text-sm text-zinc-500">Manage categories & tags</p>
                    </div>
                 </div>
              </Link>
           </div>

        </div>

      </div>
    </div>
  );
}
