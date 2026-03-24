"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/proxy";

interface DropdownItem {
  id: number;
  list_type: string;
  list_value: string;
}

export default function SettingsPage() {
  const [dropdowns, setDropdowns] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [newListType, setNewListType] = useState("Category");
  const [newListValue, setNewListValue] = useState("");

  const fetchDropdowns = async () => {
    setLoading(true);
    try {
      const data = await api.getAll("/api/inventory/dropdowns/") as DropdownItem[];
      setDropdowns(data || []);
    } catch {
      setError("Failed to fetch dropdowns from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListValue.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        list_type: newListType,
        list_value: newListValue.trim()
      };

      const res = await fetch("http://localhost:8000/api/inventory/dropdowns/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create dropdown value");

      setNewListValue(""); // Reset input
      await fetchDropdowns(); // Refresh list
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error creating dropdown.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/inventory/dropdowns/${id}/`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete dropdown value");

      setDropdowns(prev => prev.filter(d => d.id !== id));
    } catch {
      alert("Failed to delete the item. It might be in use.");
    }
  };

  // Group by type for UI
  const grouped = dropdowns.reduce((acc, curr) => {
    if (!acc[curr.list_type]) acc[curr.list_type] = [];
    acc[curr.list_type].push(curr);
    return acc;
  }, {} as Record<string, DropdownItem[]>);

  const availableTypes = ["Category", "Color", "Size"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            System Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Configure global dropdowns, enumerations, and lists used across the ERP.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-medium">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm sticky top-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add New Option
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">List Type</label>
                  <select
                    value={newListType}
                    onChange={(e) => setNewListType(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Value String</label>
                  <input
                    type="text"
                    required
                    value={newListValue}
                    onChange={(e) => setNewListValue(e.target.value)}
                    placeholder="e.g. Red, XL, Electronics"
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newListValue.trim()}
                  className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Option"}
                </button>
              </form>
            </div>
          </div>

          {/* List Display */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-zinc-500">Loading dropdown configurations...</div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
                <p className="text-zinc-500">No dropdown options configured. Add your first category or color to the left!</p>
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">{type}</h3>
                  </div>
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.list_value}</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
