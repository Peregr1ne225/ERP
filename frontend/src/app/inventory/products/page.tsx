import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";
import StockAdjustmentModal from "@/components/StockAdjustmentModal";
import AddProductModal from "@/components/AddProductModal";
import DeleteProductButton from "@/components/DeleteProductButton";
import ProductSearchFilter from "@/components/ProductSearchFilter";

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

interface PriceHistoryItem {
  sku: string;
  retail_price: string | number;
  factory_cost: string | number;
  effective_date: string;
}

interface DropdownItem {
  list_type: string;
  list_value: string;
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function ProductsListPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15+ App Router
  const params = await searchParams;
  const page = params.page || "1";
  const search = params.search || "";
  const category = params.category || "";

  // Construct query string for filtered fetching
  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  if (search) queryParams.set("search", search);
  if (category) queryParams.set("category", category);

  // Fetch products, current inventory, pricing, and categories concurrently
  const [productsRes, inventoryRes, pricingRaw, categoriesRes] = await Promise.allSettled([
    api.get(`/api/inventory/products/?${queryParams.toString()}`),
    // For inventory, we usually want to fetch the matched SKUs only if possible, 
    // but the current API might be paginated separately. 
    // We'll fetch the same page to maintain alignment if possible.
    api.get(`/api/inventory/current-inventory/?page=${page}`),
    api.getAll("/api/inventory/price-history/"),
    api.getAll("/api/inventory/dropdowns/?list_type=Category")
  ]);

  const extractPageData = (res: PromiseSettledResult<unknown>) => {
    if (res.status === "fulfilled" && res.value) {
      const val = res.value as Record<string, unknown>;
      return {
        results: Array.isArray(val.results) ? val.results : (Array.isArray(val) ? val : []),
        count: typeof val.count === 'number' ? val.count : (Array.isArray(val) ? val.length : 0),
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

  const stockMap = new Map<string, number>();
  inventoryList.forEach((inv) => {
    if (inv.sku) {
      stockMap.set(inv.sku, inv.current_stock);
    }
  });

  // Calculate latest pricing matrix per SKU
  const priceMap = new Map<string, { retail: number; cost: number }>();
  if (pricingRaw.status === "fulfilled" && Array.isArray(pricingRaw.value)) {
    const sortedPrices = [...(pricingRaw.value as PriceHistoryItem[])].sort(
      (a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()
    );
    sortedPrices.forEach((p) => {
      if (p.sku) {
        priceMap.set(p.sku, { retail: Number(p.retail_price), cost: Number(p.factory_cost) });
      }
    });
  }

  // Extract category names for the filter
  const categories = categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)
    ? (categoriesRes.value as DropdownItem[]).map(d => d.list_value)
    : [];

  const currentPage = parseInt(page, 10) || 1;

  // Pagination Helper with State Preservation
  const getPaginationHref = (newPage: number) => {
    const p = new URLSearchParams();
    p.set("page", newPage.toString());
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    return `/inventory/products?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-00 dark:text-zinc-50">
              Products Master List
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Manage all company SKUs, references, and product metadata.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AddProductModal />
          </div>
        </header>

        {/* Filters & Actions Bar */}
        <ProductSearchFilter categories={categories} />

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
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Retail</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">In Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-zinc-200 dark:text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">No matching products found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stock = stockMap.get(product.sku_id) || 0;
                    return (
                      <tr key={product.sku_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/inventory/products/${product.sku_id}`} className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {product.sku_id}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/inventory/products/${product.sku_id}`} className="flex flex-col group/row">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors uppercase text-[13px] tracking-tight">{product.product_name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{product.ref}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                          {product.color || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                          {product.size || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                          ฿{priceMap.get(product.sku_id)?.cost?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                          ฿{priceMap.get(product.sku_id)?.retail?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${stock > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' :
                              stock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400' :
                                'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400'
                            }`}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-3">
                          <StockAdjustmentModal sku_id={product.sku_id} variant="text" />
                          <DeleteProductButton sku_id={product.sku_id} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/30 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500">
            <span className="uppercase text-[10px] font-black tracking-widest text-zinc-400">Showing <strong className="text-zinc-900 dark:text-zinc-100">{products.length}</strong> of <strong className="text-zinc-900 dark:text-zinc-100">{totalCount}</strong> products</span>
            <div className="flex gap-2">
              <Link
                href={hasPrevious ? getPaginationHref(currentPage - 1) : "#"}
                className={`px-4 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!hasPrevious ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
              >
                Previous
              </Link>
              <Link
                href={hasNext ? getPaginationHref(currentPage + 1) : "#"}
                className={`px-4 py-1.5 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!hasNext ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
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

