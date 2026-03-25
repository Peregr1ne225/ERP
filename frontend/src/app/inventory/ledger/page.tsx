import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";

export const dynamic = "force-dynamic";

interface LedgerEntry {
  id: number;
  sku: string;
  movement_type: string;
  qty_change: number;
  date: string;
  note: string | null;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default async function InventoryLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sku?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const sku = resolvedParams.sku || "";
  const pageSize = 50;

  // Build query string
  let query = `?page=${page}`;
  if (sku) {
    query += `&sku=${encodeURIComponent(sku)}`;
  }

  // Fetch paginated explicit data using standard GET instead of getAll
  const dataRaw = await api.get(`/api/inventory/inventory-ledger/${query}`).catch(() => null);
  const data = dataRaw as PaginatedResponse<LedgerEntry> | null;

  const ledgers: LedgerEntry[] = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getMovementColor = (type: string) => {
    switch (type) {
      case "MANUAL_IN":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
      case "MANUAL_OUT":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
      case "DAMAGED":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  const getMovementLabel = (type: string) => {
     return type.replace("_", " ");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Inventory Ledger
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Immutable audit log of all stock movements and transactions.
            </p>
          </div>
          
          {/* Search Filter UI */}
          <form method="GET" action="/inventory/ledger" className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                name="sku"
                placeholder="Search by SKU..." 
                defaultValue={sku}
                className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              type="submit"
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Filter
            </button>
            {sku && (
              <Link 
                href="/inventory/ledger"
                className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"
                title="Clear filter"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Link>
            )}
          </form>
        </header>

        {/* Ledger Data Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden relative">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Linked Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Delta</th>
                  <th className="px-6 py-4">Note / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {ledgers.length > 0 ? (
                  ledgers.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-zinc-400 dark:text-zinc-500 text-xs shadow-inner bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                          #{row.id.toString().padStart(5, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                        {new Date(row.date).toLocaleDateString(undefined, {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/inventory/products/${row.sku}`} 
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 group-hover:underline"
                        >
                          {row.sku}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getMovementColor(row.movement_type)}`}>
                          {getMovementLabel(row.movement_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`font-mono font-extrabold ${row.qty_change > 0 ? "text-emerald-500" : row.qty_change < 0 ? "text-rose-500" : "text-zinc-500"}`}>
                          {row.qty_change > 0 ? `+${row.qty_change}` : row.qty_change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                        {row.note || <span className="italic opacity-50">No note provided</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      {sku ? `No transactions found for SKU "${sku}".` : "No ledger transactions found on this page."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">
                Displaying page <span className="font-bold text-zinc-800 dark:text-zinc-200">{page}</span> of{" "}
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalPages}</span>
                <span className="ml-2">({totalCount} total entries)</span>
              </p>
              <div className="flex gap-2">
                <Link
                  href={page > 1 ? `/inventory/ledger?page=${page - 1}${sku ? `&sku=${sku}` : ""}` : "#"}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    page > 1
                      ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 cursor-not-allowed opacity-50"
                  }`}
                  aria-disabled={page <= 1}
                >
                  Previous
                </Link>
                <Link
                  href={page < totalPages ? `/inventory/ledger?page=${page + 1}${sku ? `&sku=${sku}` : ""}` : "#"}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    page < totalPages
                      ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800 cursor-not-allowed opacity-50"
                  }`}
                  aria-disabled={page >= totalPages}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
