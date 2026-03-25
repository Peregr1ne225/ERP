"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ChangeTaskStatusButtonProps {
  taskId: string;
  currentStatus: string;
}

export default function ChangeTaskStatusButton({ taskId, currentStatus }: ChangeTaskStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const statuses = ["TO DO", "IN PROGRESS", "DONE"];
  
  const handleStatusChange = async (e: React.MouseEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/project/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status.");
      
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DONE": return "bg-emerald-500 text-white hover:bg-emerald-600";
      case "IN PROGRESS": return "bg-indigo-500 text-white hover:bg-indigo-600";
      default: return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700";
    }
  };

  return (
    <div 
      className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {statuses.map((status) => (
        <button
          key={status}
          disabled={loading}
          onClick={(e) => handleStatusChange(e, status)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            status === currentStatus 
              ? getStatusStyle(status) 
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
