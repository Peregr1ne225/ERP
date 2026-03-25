"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  campaign_id: string;
  campaign_name: string;
}

interface Props {
  campaigns: Campaign[];
}

export default function RecordAdPerformanceModal({ campaigns }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    campaign: campaigns[0]?.campaign_id || "",
    spend: "",
    impressions: "0",
    reach: "0",
    link_clicks: "0",
    video_views: "0",
    engagement: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      spend: parseFloat(formData.spend) || 0,
      impressions: parseInt(formData.impressions) || 0,
      reach: parseInt(formData.reach) || 0,
      link_clicks: parseInt(formData.link_clicks) || 0,
      video_views: parseInt(formData.video_views) || 0,
      engagement: parseInt(formData.engagement) || 0,
    };

    try {
      const res = await fetch("http://localhost:8000/api/kpi/ad-performance/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Metric recording failed" }));
        throw new Error(errData.detail || "Validation Error");
      }

      setIsOpen(false);
      setFormData(p => ({ ...p, spend: "", impressions: "0", reach: "0", link_clicks: "0", video_views: "0", engagement: "0" }));
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
        className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all outline-none"
      >
        + Log Session Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
            
            <header className="mb-8">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Session Logging</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Capture daily ad performance signals for attribution.</p>
            </header>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-2xl text-xs font-black border border-rose-200 uppercase tracking-widest">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Core Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Target Date</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Campaign Stream</label>
                  <select 
                    value={formData.campaign} onChange={(e) => setFormData(p => ({ ...p, campaign: e.target.value }))}
                    className="w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    {campaigns.map(c => <option key={c.campaign_id} value={c.campaign_id}>{c.campaign_name}</option>)}
                  </select>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Hard Metrics</span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                 </div>
                 
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Spend (THB)</label>
                      <input type="number" step="0.01" value={formData.spend} onChange={e => setFormData(p => ({ ...p, spend: e.target.value }))} placeholder="0.00" className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Impressions</label>
                      <input type="number" value={formData.impressions} onChange={e => setFormData(p => ({ ...p, impressions: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Link Clicks</label>
                      <input type="number" value={formData.link_clicks} onChange={e => setFormData(p => ({ ...p, link_clicks: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Reach</label>
                      <input type="number" value={formData.reach} onChange={e => setFormData(p => ({ ...p, reach: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Video Views</label>
                      <input type="number" value={formData.video_views} onChange={e => setFormData(p => ({ ...p, video_views: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 pl-1">Engagement</label>
                      <input type="number" value={formData.engagement} onChange={e => setFormData(p => ({ ...p, engagement: e.target.value }))} className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold" />
                    </div>
                 </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-[10px] uppercase tracking-widest">
                  Cancel Logging
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-2 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl shadow-xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                >
                  {loading ? "Saving Logs..." : "Commit Signal"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
