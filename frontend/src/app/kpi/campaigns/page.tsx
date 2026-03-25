import React from "react";
import { api } from "@/lib/proxy";
import Link from "next/link";
import CreateCampaignModal from "@/components/CreateCampaignModal";

export const dynamic = "force-dynamic";

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  platform: string;
}

export default async function CampaignsPage() {
  const campaigns = await api.getAll("/api/kpi/campaigns/") as Campaign[];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Facebook": return "🔵";
      case "TikTok": return "⚫";
      case "Google": return "🔴";
      case "Shopee Ads": return "🟠";
      default: return "🔘";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Facebook": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "TikTok": return "bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700";
      case "Google": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "Shopee Ads": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      default: return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Marketing Campaigns</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Coordinate and track multi-platform advertising initiatives.</p>
          </div>
          <CreateCampaignModal />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="md:col-span-full py-20 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <div className="text-4xl mb-4">📉</div>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">No active campaigns matched.</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="group p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${getPlatformColor(campaign.platform)}`}>
                      {getPlatformIcon(campaign.platform)} {campaign.platform}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{campaign.campaign_id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                    {campaign.campaign_name}
                  </h3>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">A</div>
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">M</div>
                  </div>
                  <Link
                    href={`/kpi/campaigns/${campaign.campaign_id}`}
                    className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
                  >
                    View Intelligence →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
