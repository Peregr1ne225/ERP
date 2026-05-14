"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCampaignModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    campaign_id: "",
    campaign_name: "",
    platform: "Facebook",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: "10000",
    status: "Active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kpi/campaigns/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Creation failed" }));
        throw new Error(errData.campaign_id?.[0] || errData.detail || "Validation Error");
      }

      setIsOpen(false);
      setFormData({ 
        campaign_id: "", 
        campaign_name: "", 
        platform: "Facebook",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: "10000",
        status: "Active"
      });
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
        className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all outline-none"
      >
        + Build Initiative
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <header className="mb-8 relative">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">New Campaign</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-2">Initialize a cross-channel marketing stream.</p>
            </header>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl text-xs font-bold border border-rose-200 uppercase tracking-widest">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Campaign ID (Unique)</label>
                <input 
                  type="text" required
                  placeholder="e.g. MKT-2024-SUMMER"
                  value={formData.campaign_id} onChange={(e) => setFormData(p => ({ ...p, campaign_id: e.target.value }))}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Initiative Name</label>
                <input 
                  type="text" required
                  placeholder="Summer Collection Push"
                  value={formData.campaign_name} onChange={(e) => setFormData(p => ({ ...p, campaign_name: e.target.value }))}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Traffic Platform</label>
                <select 
                  value={formData.platform} onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value }))}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="Facebook">Facebook Ads</option>
                  <option value="TikTok">TikTok Ads</option>
                  <option value="Google">Google Search/Display</option>
                  <option value="Shopee Ads">Shopee Internal Ads</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Start Date</label>
                  <input 
                    type="date" required
                    value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">End Date</label>
                  <input 
                    type="date" required
                    value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Initial Budget (THB)</label>
                <input 
                  type="number" required
                  placeholder="10000"
                  value={formData.budget} onChange={(e) => setFormData(p => ({ ...p, budget: e.target.value }))}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all uppercase tracking-widest text-[10px]">
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-2 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  {loading ? "Initializing..." : "Activate Initiative"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
