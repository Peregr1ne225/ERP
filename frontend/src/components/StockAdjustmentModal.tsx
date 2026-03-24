"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockAdjustmentModal({ sku_id, variant = "default" }: { sku_id: string; variant?: "default" | "text" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    movement_type: "MANUAL_IN",
    qty_change: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rawQty = parseInt(formData.qty_change, 10);
      if (isNaN(rawQty) || rawQty <= 0) {
         throw new Error("Quantity must be a positive number.");
      }

      // Automatically sign the integer based on movement type
      let finalQty = Math.abs(rawQty);
      if (formData.movement_type === "MANUAL_OUT" || formData.movement_type === "DAMAGED") {
         finalQty = -finalQty;
      }

      const payload = {
        sku: sku_id,
        movement_type: formData.movement_type,
        qty_change: finalQty,
        note: formData.note,
      };

      const res = await fetch("http://localhost:8000/api/inventory/inventory-ledger/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
         const errData = await res.json().catch(() => ({ detail: "Unknown error" }));
         throw new Error(JSON.stringify(errData));
      }

      setIsOpen(false);
      setFormData({ movement_type: "MANUAL_IN", qty_change: "", note: "" });
      
      // Tell Next.js to re-fetch Server Components (updating live stock & timeline natively)
      router.refresh(); 
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to adjust stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "text" ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          Adjust Stock
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="mt-6 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl shadow-md hover:scale-[1.02] transition-transform"
        >
          Adjust Stock
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Adjust Inventory</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Create a new ledger entry for <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">{sku_id}</span>.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Movement Type</label>
                <div className="flex gap-2">
                  {[
                    { val: "MANUAL_IN", label: "In (+)" },
                    { val: "MANUAL_OUT", label: "Out (-)" },
                    { val: "DAMAGED", label: "Damage (-)" }
                  ].map((type) => (
                    <button
                      key={type.val}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, movement_type: type.val }))}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                        formData.movement_type === type.val 
                          ? type.val === "MANUAL_IN" ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-400"
                          : type.val === "MANUAL_OUT" ? "bg-amber-100 dark:bg-amber-900/40 border-amber-500 text-amber-800 dark:text-amber-400"
                          : "bg-rose-100 dark:bg-rose-900/40 border-rose-500 text-rose-800 dark:text-rose-400"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Quantity (Absolute)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-zinc-500 font-mono text-lg font-bold">
                      {formData.movement_type === "MANUAL_IN" ? "+" : "-"}
                    </span>
                  </div>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 10"
                    value={formData.qty_change}
                    onChange={(e) => setFormData(p => ({ ...p, qty_change: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Note / Reason <span className="text-zinc-400 font-normal ml-1">(Optional)</span></label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Received new batch from supplier"
                  value={formData.note}
                  onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
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
                  disabled={loading || !formData.qty_change}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
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
