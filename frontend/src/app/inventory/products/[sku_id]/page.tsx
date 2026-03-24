import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/proxy';
import StockAdjustmentModal from './StockAdjustmentModal';

export const dynamic = "force-dynamic";

interface LedgerItem {
  id?: number;
  sku: string;
  movement_type: string;
  qty_change: number;
  date: string;
  note?: string;
}

interface PricingItem {
  id?: number;
  sku: string;
  factory_cost: string | number;
  retail_price: string | number;
  effective_date: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ sku_id: string }> }) {
  // Extract and decode SKU from URL param
  const resolvedParams = await params;
  const decodedSku = decodeURIComponent(resolvedParams.sku_id);
  
  // Directly fetch primary details targeting the detail endpoints (assuming PK is sku_id/sku)
  const productRes = await api.get(`/api/inventory/products/${decodedSku}/`).catch(() => null);
  const stockRes = await api.get(`/api/inventory/current-inventory/${decodedSku}/`).catch(() => null);
  
  // For related sets, we use getAll and filter locally to ensure it works regardless of DRF filter configurations
  const ledgersRaw = await api.getAll("/api/inventory/inventory-ledger/").catch(() => []);
  const allLedgers: LedgerItem[] = ledgersRaw as LedgerItem[];
  
  const pricingRaw = await api.getAll("/api/inventory/price-history/").catch(() => []);
  const allPricing: PricingItem[] = pricingRaw as PricingItem[];
  
  // Narrow down the aggregated lists to just this SKU
  const ledgers = allLedgers.filter((l) => l.sku === decodedSku);
  const pricing = allPricing.filter((p) => p.sku === decodedSku);

  // If Product endpoint 404s
  if (!productRes) {
     return (
        <div className="p-16 text-center bg-zinc-50 dark:bg-zinc-950 font-sans min-h-screen text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold tracking-tight">Product Not Found</h1>
          <p className="text-zinc-500 mt-2">We couldn&apos;t find any product matching the SKU: <span className="font-mono text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-md">{decodedSku}</span></p>
          <Link href="/inventory/products" className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm">
            &larr; Back to Inventory
          </Link>
        </div>
     );
  }

  // Calculate live values
  const stockLevel = stockRes?.current_stock || 0;
  
  // Sort pricing history latest to oldest
  const sortedPricing = [...pricing].sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());
  const currentPrice = sortedPricing[0] || { retail_price: 0, factory_cost: 0 };
  const profitMargin = Number(currentPrice.retail_price) - Number(currentPrice.factory_cost);
  const marginPercent = currentPrice.retail_price ? Math.round((profitMargin / Number(currentPrice.retail_price)) * 100) : 0;

  // Sort ledgers latest to oldest
  const sortedLedgers = [...ledgers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation / Breedcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
           <Link href="/inventory" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Inventory</Link>
           <span>/</span>
           <Link href="/inventory/products" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Products</Link>
           <span>/</span>
           <span className="text-zinc-900 dark:text-zinc-50">{decodedSku}</span>
        </nav>

        {/* Top Header Card */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl p-8 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-blue-500/10 to-indigo-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
           
           <div className="relative z-10 flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                 <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-full">
                    {productRes.category}
                 </span>
                 <span className="px-3 py-1 bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-full">
                    Ref: {productRes.ref}
                 </span>
              </div>
              
              <div>
                 <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">{productRes.product_name}</h1>
                 <p className="text-xl font-mono text-zinc-500 dark:text-zinc-400">{decodedSku}</p>
              </div>

              <div className="flex gap-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                 <div>
                    <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-1">Color</p>
                    <p className="text-lg font-medium">{productRes.color || "—"}</p>
                 </div>
                 <div>
                    <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-1">Size</p>
                    <p className="text-lg font-medium">{productRes.size || "—"}</p>
                 </div>
              </div>
           </div>

           <div className="relative z-10 shrink-0 min-w-[240px]">
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center shadow-inner">
                 <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Live Stock Level</p>
                 <div className={`text-6xl font-black font-mono tracking-tighter ${
                    stockLevel > 20 ? 'text-emerald-500' :
                    stockLevel > 0 ? 'text-amber-500' : 'text-rose-500'
                 }`}>
                   {stockLevel}
                 </div>
                 <StockAdjustmentModal sku_id={decodedSku} />
              </div>
           </div>
        </section>

        {/* Details Grid (Pricing & Margins) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                 <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Pricing Matrix
                 </h2>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                       <span className="text-sm font-medium text-zinc-500">Retail Price</span>
                       <span className="text-lg font-bold text-zinc-900 dark:text-white">฿{currentPrice.retail_price}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                       <span className="text-sm font-medium text-zinc-500">Factory Cost</span>
                       <span className="text-lg font-bold text-zinc-900 dark:text-white">฿{currentPrice.factory_cost}</span>
                    </div>
                 </div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Profit Margin</p>
                       <p className="text-2xl font-black text-emerald-500">฿{profitMargin.toFixed(2)}</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full font-bold text-sm">
                       {marginPercent}%
                    </div>
                 </div>
              </div>
           </div>

           {/* Ledger Timeline */}
           <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                   <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   Inventory Ledger History
                </h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</button>
             </div>
             
             {sortedLedgers.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                   <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                   <p className="font-medium">No ledger movements yet</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {sortedLedgers.map((ledger, idx) => (
                      <div key={ledger.id || idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner font-bold text-sm ${
                               ledger.movement_type === "MANUAL_IN" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" :
                               ledger.movement_type === "MANUAL_OUT" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" :
                               "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
                            }`}>
                               {ledger.movement_type === "MANUAL_IN" ? "IN" : ledger.movement_type === "MANUAL_OUT" ? "OUT" : "DMG"}
                            </div>
                            <div>
                               <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                 {ledger.movement_type.replace('_', ' ')} 
                                 <span className={`ml-2 text-sm ${ledger.qty_change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {ledger.qty_change > 0 ? '+' : ''}{ledger.qty_change}
                                 </span>
                               </p>
                               <p className="text-sm text-zinc-500">{new Date(ledger.date).toLocaleDateString()} {ledger.note ? `— ${ledger.note}` : ''}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
