"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEmployeeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Record<string, string[]> | string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone_number: "",
    role: "",
    time_working: "Mo-Fri",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/project/employees/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
         const errData = await res.json().catch(() => ({ detail: "Unknown error occurred." }));
         throw errData;
      }

      setIsOpen(false);
      setFormData({
         employee_id: "",
         name: "",
         email: "",
         phone_number: "",
         role: "",
         time_working: "Mo-Fri",
      });
      // Force Next.js to re-fetch the server component state
      router.refresh(); 
    } catch (err: unknown) {
      setError(err as Record<string, string[]> | string);
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayError = (): string | null => {
      if (!error) return null;
      if (typeof error === 'string') return error;
      if (error.detail) return error.detail as unknown as string;
      
      // Parse structured DRF validation errors
      const errs = [];
      for (const [key, msgs] of Object.entries(error)) {
         errs.push(`${key}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`);
      }
      return errs.join(" | ");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Employee
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">New Employee</h2>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Enter the official personnel details into the database.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-medium">
                {handleDisplayError()}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Employee ID <span className="text-rose-500">*</span></label>
                   <input 
                     type="text" required placeholder="e.g. EMP-001"
                     value={formData.employee_id} onChange={(e) => setFormData(p => ({ ...p, employee_id: e.target.value }))}
                     className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name <span className="text-rose-500">*</span></label>
                   <input 
                     type="text" required placeholder="John Doe"
                     value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                     className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email <span className="text-rose-500">*</span></label>
                <input 
                  type="email" required placeholder="john@example.com"
                  value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                   <input 
                     type="text" placeholder="+1 234 567 890"
                     value={formData.phone_number} onChange={(e) => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                     className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Role <span className="text-rose-500">*</span></label>
                   <input 
                     type="text" required placeholder="e.g. Senior Engineer"
                     value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                     className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Working Schedule <span className="text-rose-500">*</span></label>
                <input 
                  type="text" required placeholder="e.g. Mo-Fri"
                  value={formData.time_working} onChange={(e) => setFormData(p => ({ ...p, time_working: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
