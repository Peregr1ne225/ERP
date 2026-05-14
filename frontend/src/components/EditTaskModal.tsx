"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  employee_id: string;
  name: string;
}

interface Task {
  task_id: string;
  project: string;
  assigned_to: string | null;
  task_name: string;
  priority: string;
  status: string;
  due_date: string;
  deadline: string;
}

interface EditTaskModalProps {
  task: Task;
  employees: Employee[];
}

export default function EditTaskModal({ task, employees }: EditTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const dueDateRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    task_name: task.task_name,
    priority: task.priority,
    status: task.status,
    assigned_to: task.assigned_to || "",
    due_date: task.due_date,
    deadline: task.deadline,
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
      const res = await fetch(`/api/project/tasks/${task.task_id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update task.");

      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        Edit Specifications
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Adjust Task</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium">Modify operational parameters for {task.task_id}.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl text-sm border border-rose-200 font-bold overflow-hidden">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Task Name</label>
                <input 
                  type="text" required
                  value={formData.task_name} onChange={(e) => setFormData(p => ({ ...p, task_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Due Date</label>
                   <div className="relative">
                     <input 
                       ref={dueDateRef}
                       type="date" required
                       value={formData.due_date} onChange={(e) => setFormData(p => ({ ...p, due_date: e.target.value }))}
                       className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none"
                     />
                     <button type="button" onClick={() => dueDateRef.current?.showPicker()} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </button>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 pl-1">Deadline</label>
                   <div className="relative">
                     <input 
                       ref={deadlineRef}
                       type="date" required
                       value={formData.deadline} onChange={(e) => setFormData(p => ({ ...p, deadline: e.target.value }))}
                       className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none"
                     />
                     <button type="button" onClick={() => deadlineRef.current?.showPicker()} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
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
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors uppercase tracking-widest text-xs"
                >
                  {loading ? "Processing..." : "Commit Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
