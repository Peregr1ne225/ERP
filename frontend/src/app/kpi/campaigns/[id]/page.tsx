import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";
import DateRangePicker from "@/components/DateRangePicker";

export const dynamic = "force-dynamic";

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string | number;
}

interface CampaignKPIs {
  total_spend: number;
  total_revenue: number;
  total_purchases: number;
  cpa: number;
  roas: number;
}

interface AdRecord {
  id: number;
  date: string;
  spend: string | number;
  impressions: number;
  link_clicks: number;
  ctr: number;
}

export default async function CampaignDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ start_date?: string, end_date?: string }>
}) {
  const { id } = await params;
  const sParams = await searchParams;
  
  const campaign = await api.get(`/api/kpi/campaigns/${id}/`) as Campaign;
  
  // Normalize dates for API request
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = sParams.start_date || campaign.start_date || thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = sParams.end_date || campaign.end_date || today.toISOString().split('T')[0];
  
  const kpis = await api.get(`/api/kpi/campaigns/${id}/campaign_kpis/?start_date=${startDate}&end_date=${endDate}`) as CampaignKPIs;

  const performanceRaw = await api.getAll("/api/kpi/ad-performance/");
  const performance = (performanceRaw as (AdRecord & { campaign: string })[]).filter(p => p.campaign === id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <Link href="/kpi/campaigns" className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 hover:opacity-70 flex items-center gap-2 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Orchestration
             </Link>
             <div className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">{campaign.campaign_name}</h1>
                <div className="flex items-center gap-4">
                   <span className="px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-full">{campaign.platform}</span>
                   <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{campaign.campaign_id}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
              <DateRangePicker />
              <div className="px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Lifetime Budget</span>
                  <div className="text-xl font-black">฿{Number(campaign.budget).toLocaleString()}</div>
              </div>
          </div>
        </header>

        {/* Aggregated KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <KPICard title="Total Spend" value={`฿${kpis.total_spend.toLocaleString()}`} />
           <KPICard title="Attributed Revenue" value={`฿${kpis.total_revenue.toLocaleString()}`} color="text-emerald-500" />
           <KPICard title="ROAS" value={`${kpis.roas}x`} color="text-blue-600 dark:text-blue-400" />
           <KPICard title="CPA" value={`฿${kpis.cpa.toLocaleString()}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Performance Table */}
           <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] shadow-sm overflow-hidden">
              <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                 <h2 className="text-xl font-black uppercase tracking-tighter">Performance Logs</h2>
                 <span className="text-xs font-bold text-zinc-400">{performance.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800 font-black text-[10px] uppercase tracking-widest text-zinc-400">
                          <th className="px-10 py-5">Date</th>
                          <th className="px-10 py-5 text-right">Spend</th>
                          <th className="px-10 py-5 text-right">Impr.</th>
                          <th className="px-10 py-5 text-right">CTR</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                       {performance.length === 0 ? (
                          <tr><td colSpan={4} className="px-10 py-20 text-center italic text-zinc-400 uppercase text-xs font-bold">No active signals</td></tr>
                       ) : (
                          performance.map((p: AdRecord) => (
                             <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                                <td className="px-10 py-6 text-sm font-bold">{p.date}</td>
                                <td className="px-10 py-6 text-sm text-right font-mono">฿{Number(p.spend).toLocaleString()}</td>
                                <td className="px-10 py-6 text-sm text-right text-zinc-500">{p.impressions.toLocaleString()}</td>
                                <td className="px-10 py-6 text-right">
                                   <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-black">{p.ctr}%</span>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Campaign Config Sidecard */}
           <div className="space-y-8">
              <div className="p-10 bg-zinc-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                 <h3 className="text-lg font-black uppercase tracking-tighter mb-8 italic">Configuration</h3>
                 <div className="space-y-6">
                    <ConfigItem label="Status" value={campaign.status} />
                    <ConfigItem label="Window Start" value={campaign.start_date} />
                    <ConfigItem label="Window End" value={campaign.end_date} />
                    <ConfigItem label="Attribution Model" value="Last Touch (Omni)" />
                 </div>
              </div>
              
              <div className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] shadow-sm">
                 <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Action Stream</h3>
                 <div className="flex flex-col gap-4">
                    <button className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all focus:ring-2 focus:ring-blue-500 outline-none">
                       Recalibrate Budget
                    </button>
                    <button className="w-full py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all outline-none">
                       Export Intelligence
                    </button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, color = "text-zinc-900 dark:text-white" }: { title: string, value: string, color?: string }) {
  return (
    <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-2">{title}</span>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
       <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}
