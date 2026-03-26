import React from "react";
import { api } from "@/lib/proxy";
import RecordAdPerformanceModal from "@/components/RecordAdPerformanceModal";

export const dynamic = "force-dynamic";

interface AdPerformance {
  id: number;
  date: string;
  campaign: string;
  campaign_name?: string;
  spend: string | number;
  impressions: number;
  link_clicks: number;
  ctr: number;
  cpc: number;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  status: string;
}

export default async function AdPerformancePage() {
  const [performanceRaw, campaigns] = await Promise.all([
    api.getAll("/api/kpi/ad-performance/"),
    api.getAll("/api/kpi/campaigns/?status=Active") as Promise<Campaign[]>
  ]);

  const performance = performanceRaw as AdPerformance[];

  // Map campaign names for display if not returned by API
  const campaignMap = new Map(campaigns.map(c => [c.campaign_id, c.campaign_name]));

  // Sort performance by date descending
  const sortedPerformance = [...performance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpend = performance.reduce((sum, p) => sum + Number(p.spend), 0);
  const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0);
  const avgCtr = performance.length > 0 ? performance.reduce((sum, p) => sum + p.ctr, 0) / performance.length : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Ad Intelligence</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">High-frequency performance metrics for cross-channel attribution.</p>
          </div>
          <RecordAdPerformanceModal campaigns={campaigns} />
        </header>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Aggregated Spend</span>
            <div className="text-3xl font-black mt-2 text-zinc-900 dark:text-white">฿{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total reach</span>
            <div className="text-3xl font-black mt-2 text-zinc-900 dark:text-white">{totalImpressions.toLocaleString()}</div>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Mean CTR</span>
            <div className="text-3xl font-black mt-2 text-blue-600 dark:text-blue-500">{avgCtr.toFixed(2)}%</div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Campaign</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Spend (THB)</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Impr.</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Clicks</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">CTR</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">CPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs italic">
                      No ad signals detected in historical logs.
                    </td>
                  </tr>
                ) : (
                  sortedPerformance.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {p.date}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{campaignMap.get(p.campaign) || p.campaign}</span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{p.campaign}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-mono text-zinc-900 dark:text-white text-sm">
                        {Number(p.spend).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-zinc-500 font-medium">
                        {p.impressions.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-zinc-500 font-medium">
                        {p.link_clicks.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-black">
                          {p.ctr}%
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        ฿{p.cpc}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
