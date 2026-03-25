import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";

export const dynamic = "force-dynamic";

interface AdMetric {
  spend: string | number;
  impressions: number;
  link_clicks: number;
}

interface ConversionMetric {
  purchases: number;
  purchase_value: string | number;
  page_views: number;
  add_to_cart: number;
}

export default async function KPIDashboard() {
  const [ads, conversions] = await Promise.all([
    api.getAll("/api/kpi/ad-performance/"),
    api.getAll("/api/kpi/website-conversions/")
  ]);

  const totalSpend = (ads as AdMetric[]).reduce((sum, a) => sum + Number(a.spend), 0);
  const totalRevenue = (conversions as ConversionMetric[]).reduce((sum, c) => sum + Number(c.purchase_value), 0);
  const totalPurchases = (conversions as ConversionMetric[]).reduce((sum, c) => sum + c.purchases, 0);
  
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0.00";
  const totalPageViews = (conversions as ConversionMetric[]).reduce((sum, c) => sum + c.page_views, 0);
  const totalATC = (conversions as ConversionMetric[]).reduce((sum, c) => sum + c.add_to_cart, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <header className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Marketing Intelligence</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-2xl">High-performance attribution and return on investment tracking for digital commerce.</p>
        </header>

        {/* Global ROI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="p-8 bg-zinc-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Gross Return</span>
              <div className="text-4xl font-black mt-4">{roas}x <span className="text-sm font-medium text-zinc-600 uppercase ml-2 tracking-widest italic">ROAS</span></div>
           </div>
           
           <MetricCard title="Total Spend" value={`฿${totalSpend.toLocaleString()}`} subtitle="Historical Logs" />
           <MetricCard title="Revenue" value={`฿${totalRevenue.toLocaleString()}`} subtitle="Attributed Sales" highlight />
           <MetricCard title="Conversions" value={totalPurchases.toLocaleString()} subtitle="Total Successes" />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <NavTile 
              title="Campaign Orchestration" 
              desc="Manage cross-platform initiatives and stream budgets." 
              href="/kpi/campaigns" 
              icon="🎯"
           />
           <NavTile 
              title="Ad Intelligence" 
              desc="Daily performance signals, CTR, and CPC analytics." 
              href="/kpi/ads" 
              icon="⚡"
           />
           <NavTile 
              title="Conversion Funnel" 
              desc="Downstream ROI, AOV, and customer behavior logs." 
              href="/kpi/conversions" 
              icon="💎"
           />
        </div>

        {/* Funnel Efficiency */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-12 shadow-sm">
           <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Conversion Efficiency</h2>
              <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">Funnel Attribution</div>
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-12">
              <FunnelStep label="Discovery" value={totalPageViews} percent={100} color="bg-blue-600" />
              <div className="hidden md:block text-zinc-300 dark:text-zinc-800">→</div>
              <FunnelStep label="Intent" value={totalATC} percent={totalPageViews > 0 ? (totalATC / totalPageViews * 100) : 0} color="bg-emerald-500" />
              <div className="hidden md:block text-zinc-300 dark:text-zinc-800">→</div>
              <FunnelStep label="Success" value={totalPurchases} percent={totalATC > 0 ? (totalPurchases / totalATC * 100) : 0} color="bg-rose-500" />
           </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, highlight = false }: { title: string, value: string, subtitle: string, highlight?: boolean }) {
  return (
    <div className={`p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm ${highlight ? 'ring-2 ring-emerald-500/20' : ''}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</span>
      <div className={`text-3xl font-black mt-2 ${highlight ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-900 dark:text-white'}`}>{value}</div>
      <p className="text-[10px] font-medium text-zinc-500 mt-2 uppercase tracking-widest italic">{subtitle}</p>
    </div>
  );
}

function NavTile({ title, desc, href, icon }: { title: string, desc: string, href: string, icon: string }) {
  return (
    <Link href={href} className="group p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
       <div className="absolute -bottom-10 -right-10 text-8xl opacity-[0.03] grayscale group-hover:grayscale-0 group-hover:opacity-[0.08] transition-all duration-700 -rotate-12 group-hover:rotate-0">{icon}</div>
       <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
       <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-zinc-900 dark:text-white">{title}</h3>
       <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{desc}</p>
    </Link>
  );
}

function FunnelStep({ label, value, percent, color }: { label: string, value: number, percent: number, color: string }) {
  return (
    <div className="flex-1 w-full space-y-4">
       <div className="flex items-end justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</span>
          <span className="text-sm font-black text-zinc-900 dark:text-white">{value.toLocaleString()}</span>
       </div>
       <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
       </div>
       <div className="text-right">
          <span className="text-[10px] font-black italic text-zinc-500">{percent < 100 ? `${percent.toFixed(1)}% drop-off from previous` : 'Baseline'}</span>
       </div>
    </div>
  );
}
