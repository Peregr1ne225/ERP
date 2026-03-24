"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/proxy";

interface DropdownItem {
  id: number;
  list_type: string;
  list_value: string;
}

export default function CreateProductPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    sku_id: "",
    product_name: "",
    ref: "",
    category: "",
    size: "",
    color: "",
    factory_cost: "",
    retail_price: "",
  });

  const [dropdowns, setDropdowns] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dropdown options
  useEffect(() => {
    api.getAll("/api/inventory/dropdowns/")
      .then((res: unknown) => {
        setDropdowns((res as DropdownItem[]) || []);
      })
      .catch((err) => {
        console.error("Failed to load dropdowns:", err);
      });
  }, []);

  // Auto-generate SKU from Ref, Color, and Size
  const derivedSkuId = [formData.ref, formData.color, formData.size]
    .filter(Boolean)
    .join("-")
    .toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData, sku_id: derivedSkuId };
      
      const response = await fetch("http://localhost:8000/api/inventory/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
        throw new Error(JSON.stringify(errData));
      }

      // Automatically seed the baseline PriceHistory configuration for this product
      if (formData.factory_cost || formData.retail_price) {
         const pricePayload = {
            sku: derivedSkuId,
            factory_cost: parseFloat(formData.factory_cost || "0"),
            retail_price: parseFloat(formData.retail_price || "0"),
            effective_date: new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
         };

         await fetch("http://localhost:8000/api/inventory/price-history/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pricePayload)
         }).catch(err => console.error("Non-fatal PriceHistory initialization error:", err));
      }

      // Success, route back to product detail or list
      router.push(`/inventory/products/${derivedSkuId}`);
      router.refresh(); // Tell Next.js to invalidate server cache for the products list
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create product");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter dropdown groups
  const categories = dropdowns.filter((d) => d.list_type.toLowerCase() === "category");
  const sizes = dropdowns.filter((d) => d.list_type.toLowerCase() === "size");
  const colors = dropdowns.filter((d) => d.list_type.toLowerCase() === "color");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation / Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
           <Link href="/inventory" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Inventory</Link>
           <span>/</span>
           <Link href="/inventory/products" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Products</Link>
           <span>/</span>
           <span className="text-zinc-900 dark:text-zinc-50">Create</span>
        </nav>

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Product
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Register a new SKU into the master inventory list.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
          
          {error && (
            <div className="p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-mono">
              Error: {error}
            </div>
          )}

          {/* Primary Identifiers */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
               Primary Identifiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">SKU ID (Auto-generated) <span className="text-zinc-500 ml-1">🔒</span></label>
                <input 
                  type="text" 
                  name="sku_id" 
                  required
                  placeholder="e.g., TS001-RED-M"
                  value={derivedSkuId}
                  readOnly
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none font-mono text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Reference / Model <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="ref" 
                  required
                  placeholder="e.g., TS001"
                  value={formData.ref}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Product Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="product_name" 
                  required
                  placeholder="Classic Red T-Shirt"
                  value={formData.product_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Classification */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
               Classification & Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="category" 
                  required 
                  list="category-options"
                  placeholder="Select or type custom..."
                  value={formData.category} 
                  onChange={handleChange} 
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                />
                <datalist id="category-options">
                  {categories.map((c) => <option key={c.id} value={c.list_value} />)}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Color</label>
                <input 
                  type="text" 
                  name="color" 
                  list="color-options"
                  placeholder="Select or type custom..."
                  value={formData.color} 
                  onChange={handleChange} 
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                />
                <datalist id="color-options">
                  {colors.map((c) => <option key={c.id} value={c.list_value} />)}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Size</label>
                <input 
                  type="text" 
                  name="size" 
                  list="size-options"
                  placeholder="Select or type custom..."
                  value={formData.size} 
                  onChange={handleChange} 
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                />
                <datalist id="size-options">
                  {sizes.map((s) => <option key={s.id} value={s.list_value} />)}
                </datalist>
              </div>

            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Economics */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
               Baseline Economics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Factory Cost (THB)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="text-zinc-500 font-mono">฿</span>
                   </div>
                   <input 
                     type="number" 
                     step="0.01"
                     name="factory_cost" 
                     placeholder="0.00"
                     value={formData.factory_cost} 
                     onChange={handleChange} 
                     className="w-full pl-9 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Retail Price (THB)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="text-zinc-500 font-mono">฿</span>
                   </div>
                   <input 
                     type="number" 
                     step="0.01"
                     name="retail_price" 
                     placeholder="0.00"
                     value={formData.retail_price} 
                     onChange={handleChange} 
                     className="w-full pl-9 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link href="/inventory/products" className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : "Create Product"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
