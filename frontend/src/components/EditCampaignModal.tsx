"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string | number;
}

interface EditCampaignModalProps {
  campaign: Campaign;
}

export default function EditCampaignModal({ campaign }: EditCampaignModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    campaign_name: campaign.campaign_name,
    platform: campaign.platform,
    status: campaign.status,
    start_date: campaign.start_date || "",
    end_date: campaign.end_date || "",
    budget: campaign.budget.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/kpi/campaigns/${campaign.campaign_id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Mutation failed" }));
        throw new Error(errData.detail || "Validation Error");
      }

      setIsOpen(false);
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
        className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg outline-none"
      >
        Edit Configuration
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <header className="mb-8 relative">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none italic">Recalibrate</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-2">Adjust operational parameters for {campaign.campaign_id}.</p>
            </header>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl text-xs font-bold border border-rose-200 uppercase tracking-widest">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Initiative Name</label>
                <input 
                  type="text" required
                  value={formData.campaign_name} onChange={(e) => setFormData(p => ({ ...p, campaign_name: e.target.value }))}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Platform</label>
                    <select 
                    value={formData.platform} onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value }))}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google">Google</option>
                    <option value="Shopee Ads">Shopee Ads</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Lifecycle Status</label>
                    <select 
                    value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Window Start</label>
                  <div className="relative group/date">
                    <input 
                      ref={startDateRef}
                      type="date" required
                      value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                      className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    />
                    <button type="button" onClick={() => startDateRef.current?.showPicker()} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Window End</label>
                  <div className="relative group/date">
                    <input 
                      ref={endDateRef}
                      type="date" required
                      value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
                      className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    />
                    <button type="button" onClick={() => endDateRef.current?.showPicker()} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 pl-1">Cap Allocation (THB)</label>
                <input 
                  type="number" required
                  value={formData.budget} onChange={(e) => setFormData(p => ({ ...p, budget: e.target.value }))}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                  {loading ? "Re-scaling..." : "Commit Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
