"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  campaign_id: string;
  campaign_name: string;
}

interface Props {
  campaigns: Campaign[];
}

export default function RecordConversionsModal({ campaigns }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dateRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    campaign: campaigns[0]?.campaign_id || "",
    page_views: "0",
    leads_collected: "0",
    add_to_cart: "0",
    checkouts_initiated: "0",
    purchases: "0",
    purchase_value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      page_views: parseInt(formData.page_views) || 0,
      leads_collected: parseInt(formData.leads_collected) || 0,
      add_to_cart: parseInt(formData.add_to_cart) || 0,
      checkouts_initiated: parseInt(formData.checkouts_initiated) || 0,
      purchases: parseInt(formData.purchases) || 0,
      purchase_value: parseFloat(formData.purchase_value) || 0,
    };

    try {
      const res = await fetch("http://localhost:8000/api/kpi/website-conversions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Conversion logging failed" }));
        throw new Error(errData.detail || "Validation Error");
      }

      setIsOpen(false);
      setFormData(p => ({ ...p, purchases: "0", purchase_value: "", page_views: "0" }));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-4xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all outline-none"
      >
        + Log Revenue Signal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl p-12 max-w-2xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">

            <header className="mb-8">
              <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">Conversion Funnel</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Sync daily website performance and revenue data.</p>
            </header>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl text-[10px] font-black border border-rose-200 uppercase tracking-[0.2em]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-50 dark:bg-zinc-950 rounded-4xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Signal Date</label>
                  <div className="relative group/date">
                    <input
                      ref={dateRef}
                      type="date" required
                      value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:shadow-inner outline-none transition-all appearance-none"
                    />
                    <button 
                      type="button"
                      onClick={() => dateRef.current?.showPicker()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Attribution source</label>
                  <select
                    value={formData.campaign} onChange={(e) => setFormData(p => ({ ...p, campaign: e.target.value }))}
                    className="w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:shadow-inner outline-none transition-all appearance-none"
                  >
                    {campaigns.map(c => <option key={c.campaign_id} value={c.campaign_id}>{c.campaign_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Funnel Metrics</span>
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1 italic underline decoration-blue-500">Gross Purchase Value (THB) *</label>
                    <input type="number" step="0.01" value={formData.purchase_value} onChange={e => setFormData(p => ({ ...p, purchase_value: e.target.value }))} placeholder="0.00" className="w-full px-5 py-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-lg font-black text-emerald-600 dark:text-emerald-400 placeholder:text-zinc-400/60" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Page Views</label>
                    <input type="number" value={formData.page_views} onChange={e => setFormData(p => ({ ...p, page_views: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Leads</label>
                    <input type="number" value={formData.leads_collected} onChange={e => setFormData(p => ({ ...p, leads_collected: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Add to Cart</label>
                    <input type="number" value={formData.add_to_cart} onChange={e => setFormData(p => ({ ...p, add_to_cart: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Checkouts</label>
                    <input type="number" value={formData.checkouts_initiated} onChange={e => setFormData(p => ({ ...p, checkouts_initiated: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Purchases</label>
                    <input type="number" value={formData.purchases} onChange={e => setFormData(p => ({ ...p, purchases: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-emerald-500/40 dark:border-emerald-900/50 shadow-emerald-500/5 shadow-sm rounded-2xl text-sm font-bold" />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all">
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 disabled:opacity-50 transition-all text-[10px] uppercase tracking-widest"
                >
                  {loading ? "Consolidating..." : "Finalize Signal"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
