"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface PriceAdjustmentModalProps {
  sku_id: string;
  currentFactoryCost: number | string;
  currentRetailPrice: number | string;
}

export default function PriceAdjustmentModal({ sku_id, currentFactoryCost, currentRetailPrice }: PriceAdjustmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    factory_cost: currentFactoryCost.toString(),
    retail_price: currentRetailPrice.toString(),
    effective_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cost = parseFloat(formData.factory_cost);
      const retail = parseFloat(formData.retail_price);
      
      if (isNaN(cost) || isNaN(retail) || cost < 0 || retail < 0) {
         throw new Error("Prices must be valid positive numbers.");
      }

      // Create a brand new PriceHistory record (chronological append)
      const payload = {
        sku: sku_id,
        factory_cost: cost,
        retail_price: retail,
        effective_date: formData.effective_date, // YYYY-MM-DD
      };

      const res = await fetch("/api/inventory/price-history/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
         const errData = await res.json().catch(() => ({ detail: "Unknown error" }));
         throw new Error(JSON.stringify(errData));
      }

      setIsOpen(false);
      // Let Next.js re-fetch and re-render Server Components
      router.refresh(); 
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to update pricing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        Update Pricing
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Update Pricing</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Create a new effective price block for <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">{sku_id}</span>.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Factory Cost */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Factory Cost (฿)</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.factory_cost}
                  onChange={(e) => setFormData(p => ({ ...p, factory_cost: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              {/* Retail Price */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Retail Price (฿)</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.retail_price}
                  onChange={(e) => setFormData(p => ({ ...p, retail_price: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Effective Date</label>
                <input 
                  type="date"
                  required
                  value={formData.effective_date}
                  onChange={(e) => setFormData(p => ({ ...p, effective_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? "Saving..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
