"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    description: "",
    status: "PLANNED",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/project/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Failed to create project." }));
        throw errData;
      }

      setIsOpen(false);
      setFormData({
        project_id: "",
        project_name: "",
        description: "",
        status: "PLANNED",
      });
      router.refresh();
    } catch (err: unknown) {
      const errorObj = err as { detail?: string };
      setError(errorObj.detail || (typeof err === 'object' ? JSON.stringify(err) : "An error occurred."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Initiate Project</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium">Define high-level objectives and timelines for a new initiative.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-bold overflow-hidden">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Unique Key</label>
                  <input
                    type="text" required placeholder="PRJ-2024-01"
                    value={formData.project_id} onChange={(e) => setFormData(p => ({ ...p, project_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Status</label>
                  <select
                    value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Project Name</label>
                <input
                  type="text" required placeholder="e.g. Q4 Website Redesign"
                  value={formData.project_name} onChange={(e) => setFormData(p => ({ ...p, project_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white resize-none"
                />
              </div>



              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black rounded-2xl hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 uppercase tracking-widest text-xs"
                >
                  {loading ? "Processing..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
