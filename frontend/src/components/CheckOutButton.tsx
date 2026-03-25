"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckOutButtonProps {
  logId: number;
}

export default function CheckOutButton({ logId }: CheckOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const res = await fetch(`http://localhost:8000/api/project/attendance-logs/${logId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ check_out: now })
      });

      if (!res.ok) {
        throw new Error("Failed to check out");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to record check-out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckOut}
      disabled={loading}
      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm active:scale-95"
    >
      {loading ? (
        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      )}
      {loading ? "Syncing..." : "Check Out"}
    </button>
  );
}
