"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteProductButtonProps {
  sku_id: string;
}

export default function DeleteProductButton({ sku_id }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you absolutely sure you want to PERMANENTLY delete product ${sku_id}? This will also delete all associated Price History and Ledger entries. This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/inventory/products/${encodeURIComponent(sku_id)}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Deletion failed. The product may be referenced in other active records.");
      
      router.refresh(); // Tell Next.js to re-fetch the products list
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className={`px-3 py-1.5 text-rose-600 dark:text-rose-400 font-bold hover:text-rose-800 dark:hover:text-rose-300 transition-colors flex items-center gap-1.5 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title="Permanently remove this SKU"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
