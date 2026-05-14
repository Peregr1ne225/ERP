"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SetTaskRatingProps {
  taskId: string;
  currentRating: number | null;
}

export default function SetTaskRating({ taskId, currentRating }: SetTaskRatingProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetRating = async (val: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/project/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: val }),
      });

      if (!res.ok) throw new Error("Failed to set rating.");
      
      setRating(val);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 pt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={loading}
          onClick={() => handleSetRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`transition-transform hover:scale-125 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg 
            className={`w-7 h-7 ${(hover || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 dark:text-zinc-800'}`} 
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="ml-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
        {loading ? "Syncing..." : (currentRating ? "Finalized" : "Pending Evaluation")}
      </span>
    </div>
  );
}
