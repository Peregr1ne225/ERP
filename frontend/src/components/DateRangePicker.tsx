"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";

  const handleDateChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      <div className="flex flex-col gap-0.5 px-3">
        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Start window</label>
        <input 
          type="date"
          value={startDate}
          onChange={(e) => handleDateChange("start_date", e.target.value)}
          className="bg-transparent border-none text-xs font-bold outline-none dark:text-white"
        />
      </div>
      <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex flex-col gap-0.5 px-3">
        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">End window</label>
        <input 
          type="date"
          value={endDate}
          onChange={(e) => handleDateChange("end_date", e.target.value)}
          className="bg-transparent border-none text-xs font-bold outline-none dark:text-white"
        />
      </div>
    </div>
  );
}
