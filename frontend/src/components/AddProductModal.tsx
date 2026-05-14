"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/proxy";

interface DropdownItem {
  id: number;
  list_type: string;
  list_value: string;
}

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdowns, setDropdowns] = useState<DropdownItem[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    ref: "",
    product_name: "",
    category: "",
    size: "",
    color: "",
    factory_cost: "",
    retail_price: "",
    initial_stock: "",
  });

  useEffect(() => {
    if (isOpen && dropdowns.length === 0) {
      api.getAll("/api/inventory/dropdowns/")
        .then((res: unknown) => setDropdowns((res as DropdownItem[]) || []))
        .catch(err => console.error("Dropdown load failed:", err));
    }
  }, [isOpen, dropdowns.length]);

  const derivedSkuId = [formData.ref, formData.color, formData.size]
    .filter(Boolean)
    .join("-")
    .toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create Product
      const productPayload = {
        sku_id: derivedSkuId,
        ref: formData.ref,
        product_name: formData.product_name,
        category: formData.category,
        size: formData.size,
        color: formData.color,
      };

      const pRes = await fetch("/api/inventory/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!pRes.ok) {
        const errData = await pRes.json().catch(() => ({ detail: "Product creation failed" }));
        throw new Error(errData.sku_id?.[0] || errData.detail || "Validation Error");
      }

      // 2. Initialize Price History (Optional)
      if (formData.factory_cost || formData.retail_price) {
        await fetch("/api/inventory/price-history/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: derivedSkuId,
            factory_cost: parseFloat(formData.factory_cost || "0"),
            retail_price: parseFloat(formData.retail_price || "0"),
            effective_date: new Date().toISOString().split('T')[0]
          }),
        }).catch(err => console.error("PriceHistory silent fail:", err));
      }

      // 3. Initialize Stock (Optional)
      if (formData.initial_stock && parseInt(formData.initial_stock) > 0) {
        await fetch("/api/inventory/inventory-ledger/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: derivedSkuId,
            movement_type: "MANUAL_IN",
            qty_change: parseInt(formData.initial_stock),
            note: "Initial stock setup on product registration"
          }),
        }).catch(err => console.error("Ledger silent fail:", err));
      }

      setIsOpen(false);
      setFormData({ ref: "", product_name: "", category: "", size: "", color: "", factory_cost: "", retail_price: "", initial_stock: "" });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const categories = dropdowns.filter(d => d.list_type.toLowerCase() === "category");
  const sizes = dropdowns.filter(d => d.list_type.toLowerCase() === "size");
  const colors = dropdowns.filter(d => d.list_type.toLowerCase() === "color");

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md text-sm font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
      >
        + Create Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <header className="mb-6">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Register SKU</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Define your new inventory line and baseline economics.</p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 uppercase tracking-widest">
                Error: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Group 1: Identity */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   Identification
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Reference Code *</label>
                    <input type="text" name="ref" required value={formData.ref} onChange={handleChange} placeholder="e.g. TS001" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">SKU ID (Preview)</label>
                    <input type="text" readOnly value={derivedSkuId} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono text-zinc-400 outline-none cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Product Name *</label>
                    <input type="text" name="product_name" required value={formData.product_name} onChange={handleChange} placeholder="e.g. Premium Cotton Tee" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </section>

              {/* Group 2: Classification */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   Attributes
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Category *</label>
                     <input type="text" name="category" required list="cat-opts" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                     <datalist id="cat-opts">{categories.map(c => <option key={c.id} value={c.list_value}>{c.list_value}</option>)}</datalist>
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Color</label>
                     <input type="text" name="color" list="col-opts" value={formData.color} onChange={handleChange} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                     <datalist id="col-opts">{colors.map(c => <option key={c.id} value={c.list_value}>{c.list_value}</option>)}</datalist>
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Size</label>
                     <input type="text" name="size" list="siz-opts" value={formData.size} onChange={handleChange} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                     <datalist id="siz-opts">{sizes.map(c => <option key={c.id} value={c.list_value}>{c.list_value}</option>)}</datalist>
                   </div>
                </div>
              </section>

              {/* Group 3: Economics */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                   Initial Setup
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Cost (THB)</label>
                     <input type="number" step="0.01" name="factory_cost" value={formData.factory_cost} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Retail (THB)</label>
                     <input type="number" step="0.01" name="retail_price" value={formData.retail_price} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Initial Stock</label>
                     <input type="number" name="initial_stock" value={formData.initial_stock} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                </div>
              </section>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black rounded-2xl hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-3 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors uppercase tracking-widest text-xs"
                >
                  {loading ? "Processing..." : "Commit Registration"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
