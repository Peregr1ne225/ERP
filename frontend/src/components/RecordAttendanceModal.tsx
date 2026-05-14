"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  employee_id: string;
  name: string;
}

interface RecordAttendanceModalProps {
  employees: Employee[];
}

export default function RecordAttendanceModal({ employees }: RecordAttendanceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    employee: "",
    check_in: new Date().toISOString().slice(0, 16), // datetime-local format
    check_out: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      check_out: formData.check_out || null,
    };

    try {
      const res = await fetch("/api/project/attendance-logs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
         const errData = await res.json().catch(() => ({ detail: "Unknown error occurred." }));
         throw errData;
      }

      setIsOpen(false);
      setFormData({
        employee: "",
        check_in: new Date().toISOString().slice(0, 16),
        check_out: "",
      });
      router.refresh(); 
    } catch (err: unknown) {
      const errorObj = err as { detail?: string };
      setError(errorObj.detail || "Failed to record attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Log Attendance
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Record Presence</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Manually log a check-in/out session for an employee.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Employee <span className="text-rose-500">*</span></label>
                <select 
                  required
                  value={formData.employee}
                  onChange={(e) => setFormData(p => ({ ...p, employee: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                >
                  <option value="">Select Personnel...</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>{emp.name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Check In <span className="text-rose-500">*</span></label>
                    <div className="relative group/date">
                      <input 
                        ref={checkInRef}
                        type="datetime-local" required
                        value={formData.check_in}
                        onChange={(e) => setFormData(p => ({ ...p, check_in: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white pr-10"
                      />
                      <button 
                         type="button"
                         onClick={() => checkInRef.current?.showPicker()}
                         className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-indigo-600 transition-colors"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Check Out</label>
                    <div className="relative group/date">
                      <input 
                        ref={checkOutRef}
                        type="datetime-local"
                        value={formData.check_out}
                        onChange={(e) => setFormData(p => ({ ...p, check_out: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white pr-10"
                      />
                      <button 
                         type="button"
                         onClick={() => checkOutRef.current?.showPicker()}
                         className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-indigo-600 transition-colors"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
               </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {loading ? "Recording..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
