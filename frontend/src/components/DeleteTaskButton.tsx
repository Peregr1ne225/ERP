"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteTaskButtonProps {
  taskId: string;
}

export default function DeleteTaskButton({ taskId }: DeleteTaskButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to decommission task ${taskId}? This action is irreversible.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/project/tasks/${taskId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task.");
      
      // Navigate back to the project page since the task no longer exists
      // We need the project ID but we only have project name. 
      // Actually, it's safer to just go to portfolio if we don't know the exact back link, 
      // but usually the calling page knows.
      router.push("/project/project"); 
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className={`px-6 py-3 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      {loading ? "Decommissioning..." : "Decommission"}
    </button>
  );
}
