"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  employee_id: string;
  name: string;
}

interface AddTaskModalProps {
  projectId: string;
  employees: Employee[];
}

export default function AddTaskModal({ projectId, employees }: AddTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const dueDateRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    task_id: "",
    project: projectId,
    assigned_to: "",
    task_name: "",
    priority: "Moderate",
    status: "TO DO",
    due_date: new Date().toISOString().slice(0, 10),
    deadline: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      assigned_to: formData.assigned_to || null,
    };

    try {
      const res = await fetch("/api/project/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Failed to create task." }));
        throw errData;
      }

      setIsOpen(false);
      setFormData({
        task_id: "",
        project: projectId,
        assigned_to: "",
        task_name: "",
        priority: "Moderate",
        status: "TO DO",
        due_date: new Date().toISOString().slice(0, 10),
        deadline: new Date().toISOString().slice(0, 10),
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
        className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        New Task
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Deploy Task</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium">Assign specific working items to personnel within this initiative.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900 font-bold overflow-hidden">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Task ID</label>
                  <input 
                    type="text" required placeholder="TASK-101"
                    value={formData.task_id} onChange={(e) => setFormData(p => ({ ...p, task_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Assignee</label>
                  <select 
                    value={formData.assigned_to} onChange={(e) => setFormData(p => ({ ...p, assigned_to: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Task Name</label>
                <input 
                  type="text" required placeholder="e.g. Design System Audit"
                  value={formData.task_name} onChange={(e) => setFormData(p => ({ ...p, task_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Priority</label>
                  <select 
                    value={formData.priority} onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                  >
                    <option value="Relaxed">Relaxed</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Status</label>
                  <select 
                    value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                  >
                    <option value="TO DO">To Do</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Due Date</label>
                   <div className="relative group/date">
                     <input 
                       ref={dueDateRef}
                       type="date" required
                       value={formData.due_date} onChange={(e) => setFormData(p => ({ ...p, due_date: e.target.value }))}
                       className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                     />
                     <button 
                        type="button"
                        onClick={() => dueDateRef.current?.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                     >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </button>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Deadline</label>
                   <div className="relative group/date">
                     <input 
                       ref={deadlineRef}
                       type="date" required
                       value={formData.deadline} onChange={(e) => setFormData(p => ({ ...p, deadline: e.target.value }))}
                       className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                     />
                     <button 
                        type="button"
                        onClick={() => deadlineRef.current?.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                     >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </button>
                   </div>
                 </div>
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
                  {loading ? "Processing..." : "Deploy Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
