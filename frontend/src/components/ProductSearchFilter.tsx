"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface ProductSearchFilterProps {
  categories: string[];
}

export default function ProductSearchFilter({ categories }: ProductSearchFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const handleUpdateParams = useCallback((newSearch: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }

    // Reset to first page on search/filter change
    params.set("page", "1");
    
    replace(`${pathname}?${params.toString()}`);
  }, [pathname, replace, searchParams]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger if terms have actually changed compared to URL
      if (searchTerm !== (searchParams.get("search") || "")) {
         handleUpdateParams(searchTerm, category);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, category, handleUpdateParams, searchParams]);

  // Handle category change immediately
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    handleUpdateParams(searchTerm, val);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="w-full sm:max-w-xs relative">
        <input 
          type="text" 
          placeholder="Search by SKU, Name or Ref..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
        />
        <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="flex gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <select 
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full sm:w-48 pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <button 
           onClick={() => { setSearchTerm(""); setCategory(""); handleUpdateParams("", ""); }}
           className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
