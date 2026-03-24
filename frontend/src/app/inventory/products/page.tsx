import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";

export const dynamic = "force-dynamic";

interface ProductItem {
  sku_id: string;
  ref: string;
  product_name: string;
  category: string;
  size: string;
  color: string;
}

interface InventoryItem {
  sku: string;
  current_stock: number;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProductsListPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15+ App Router
  const params = await searchParams;
  const page = params.page || "1";
  
  // Fetch products and current inventory concurrently respecting DRF Pagination
  const [productsRes, inventoryRes] = await Promise.allSettled([
    api.get(`/api/inventory/products/?page=${page}`),
    // By paginating current-inventory directly, we ensure total sync and 100% efficient queries
    api.get(`/api/inventory/current-inventory/?page=${page}`)
  ]);

  const extractPageData = (res: PromiseSettledResult<unknown>) => {
    if (res.status === "fulfilled" && res.value) {
      const val = res.value as Record<string, unknown>;
      return {
        results: Array.isArray(val.results) ? val.results : [],
        count: typeof val.count === 'number' ? val.count : 0,
        next: typeof val.next === 'string' ? val.next : null,
        previous: typeof val.previous === 'string' ? val.previous : null,
      };
    }
    return { results: [], count: 0, next: null, previous: null };
  };

  const productsData = extractPageData(productsRes);
  const products = productsData.results as ProductItem[];
  const totalCount = productsData.count;
  const hasNext = !!productsData.next;
  const hasPrevious = !!productsData.previous;
  
  const inventoryData = extractPageData(inventoryRes);
  const inventoryList = inventoryData.results as InventoryItem[];

  // Create a map for O(1) lookups: SKU ID -> Current Stock
  const stockMap = new Map<string, number>();
  inventoryList.forEach((inv) => {
    if (inv.sku) {
       stockMap.set(inv.sku, inv.current_stock);
    }
  });

  const currentPage = parseInt(page, 10) || 1;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Products Master List
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Manage all company SKUs, references, and product metadata.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory/products/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md text-sm font-medium hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              + Create Product
            </Link>
          </div>
        </header>

        {/* Filters & Actions Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="w-full sm:max-w-xs relative">
             <input 
               type="text" 
               placeholder="Search by SKU or Name..." 
               className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-zinc-900 dark:text-zinc-100"
             />
             <svg className="w-4 h-4 absolute left-3 top-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Filter by Category
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">SKU ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ref / Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Color</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Size</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">In Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      No products found on this page.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stock = stockMap.get(product.sku_id) || 0;
                    return (
                      <tr key={product.sku_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{product.sku_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.product_name}</span>
                            <span className="text-xs text-zinc-500">{product.ref}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                          {product.color || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                          {product.size || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            stock > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' :
                            stock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400'
                          }`}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/inventory/products/${product.sku_id}`} 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mr-4"
                          >
                            View
                          </Link>
                          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-800/30 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500">
            <span>Showing <strong className="text-zinc-900 dark:text-zinc-100">{products.length}</strong> of <strong className="text-zinc-900 dark:text-zinc-100">{totalCount}</strong> products</span>
            <div className="flex gap-2">
               <Link 
                 href={hasPrevious ? `/inventory/products?page=${currentPage - 1}` : "#"}
                 className={`px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!hasPrevious ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
               >
                 Previous
               </Link>
               <Link 
                 href={hasNext ? `/inventory/products?page=${currentPage + 1}` : "#"}
                 className={`px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!hasNext ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
               >
                 Next
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
