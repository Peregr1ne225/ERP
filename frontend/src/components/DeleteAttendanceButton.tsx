"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

interface DeleteAttendanceButtonProps {
  logId: number;
}

export default function DeleteAttendanceButton({ logId }: DeleteAttendanceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/project/attendance-logs/${logId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Deletion failed.");
      
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
        title="Purge Record"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        loading={loading}
        title="Purge Record"
        message="Delete this attendance record? This will permanently remove the logged hours from the audit stream."
        confirmText="Confirm Deletion"
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
      />
    </>
  );
}
