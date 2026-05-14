"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface UpdateProjectStatusModalProps {
  projectId: string;
  currentStatus: string;
}

export default function UpdateProjectStatusModal({ projectId, currentStatus }: UpdateProjectStatusModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const statusChoices = [
    { value: "PLANNED", label: "Planned" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const handleUpdate = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/project/projects/${projectId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update project status.");
      
      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-indigo-600 dark:bg-indigo-500 text-white";
      case "COMPLETED": return "bg-emerald-600 dark:bg-emerald-500 text-white";
      case "ON_HOLD": return "bg-amber-600 dark:bg-amber-500 text-white";
      case "CANCELLED": return "bg-rose-600 dark:bg-rose-500 text-white";
      default: return "bg-zinc-600 dark:bg-zinc-500 text-white";
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest leading-none hover:bg-indigo-700 transition-colors shadow-sm"
      >
        {currentStatus || "Planned"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4">Reposition Project</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-medium">Select the new operational state for this initiative.</p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
               {statusChoices.map(status => (
                 <button
                   key={status.value}
                   disabled={loading}
                   onClick={() => handleUpdate(status.value)}
                   className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                     status.value === currentStatus 
                       ? getStatusColor(status.value) 
                       : "bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                   }`}
                 >
                   {status.label}
                   {status.value === currentStatus && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </button>
               ))}
            </div>

            <button 
              onClick={() => setIsOpen(false)} 
              className="mt-6 w-full py-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
