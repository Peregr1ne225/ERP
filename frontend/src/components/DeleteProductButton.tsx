"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

interface DeleteProductButtonProps {
  sku_id: string;
}

export default function DeleteProductButton({ sku_id }: DeleteProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inventory/products/${encodeURIComponent(sku_id)}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Deletion failed. The product may be referenced in other active records.");
      
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className={`px-3 py-1.5 text-rose-600 dark:text-rose-400 font-bold hover:text-rose-800 dark:hover:text-rose-300 transition-colors flex items-center gap-1.5 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Permanently remove this SKU"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        {loading ? "Deleting..." : "Delete"}
      </button>

      <ConfirmationModal 
        isOpen={isOpen}
        loading={loading}
        title="Purge Stock Record"
        message={`Are you absolutely sure you want to\nPERMANENTLY delete product ${sku_id}?\n\nThis will also delete all associated\nPrice History and Ledger entries.\n\nThis action is irreversible.`}
        confirmText="Confirm Purge"
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
        errorMessage={error}
      />
    </>
  );
}
