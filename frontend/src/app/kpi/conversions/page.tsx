import React from "react";
import { api } from "@/lib/proxy";
import RecordConversionsModal from "@/components/RecordConversionsModal";

export const dynamic = "force-dynamic";

interface Conversion {
  id: number;
  date: string;
  campaign: string;
  campaign_name?: string;
  page_views: number;
  purchases: number;
  purchase_value: string | number;
  conversion_rate: number;
  aov: number;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
}

export default async function ConversionsPage() {
  const [conversionsRaw, campaigns] = await Promise.all([
    api.getAll("/api/kpi/website-conversions/"),
    api.getAll("/api/kpi/campaigns/") as Promise<Campaign[]>
  ]);

  const conversions = conversionsRaw as Conversion[];
  const campaignMap = new Map(campaigns.map(c => [c.campaign_id, c.campaign_name]));

  // Sort by date descending
  const sortedConversions = [...conversions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalRevenue = conversions.reduce((sum, c) => sum + Number(c.purchase_value), 0);
  const totalPurchases = conversions.reduce((sum, c) => sum + c.purchases, 0);
  const avgAov = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">Conversion Funnel</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Downstream revenue and e-commerce effectiveness metrics.</p>
          </div>
          <RecordConversionsModal campaigns={campaigns} />
        </header>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-12 -mt-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Gross Revenue</span>
            <div className="text-3xl font-black mt-2">฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Purchase Events</span>
            <div className="text-3xl font-black mt-2 text-zinc-900 dark:text-white">{totalPurchases.toLocaleString()}</div>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Average Order Value</span>
            <div className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-500">฿{avgAov.toFixed(2)}</div>
          </div>
        </div>

        {/* Conversions Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Entry Date</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Source Stream</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Revenue (THB)</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Volume</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">CVR</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">AOV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedConversions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs italic">
                      Zero conversion signals recorded.
                    </td>
                  </tr>
                ) : (
                  sortedConversions.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {c.date}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{campaignMap.get(c.campaign) || c.campaign}</span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{c.campaign}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-zinc-900 dark:text-white text-sm">
                        ฿{Number(c.purchase_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-zinc-500 font-medium">
                        {c.purchases}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black">
                          {c.conversion_rate}%
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-sm font-black text-zinc-900 dark:text-zinc-100">
                        ฿{c.aov}
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
