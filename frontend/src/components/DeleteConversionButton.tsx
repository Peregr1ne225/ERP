"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

interface DeleteConversionButtonProps {
  conversionId: number;
}

export default function DeleteConversionButton({ conversionId }: DeleteConversionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kpi/website-conversions/${conversionId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Purge failed.");
      
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className={`p-2 text-zinc-400 hover:text-rose-500 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Purge Signal"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        loading={loading}
        title="Purge Signal"
        message="Are you sure you want to purge this conversion signal? This will impact historical ROAS calculations."
        confirmText="Confirm Purge"
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
      />
    </>
  );
}
