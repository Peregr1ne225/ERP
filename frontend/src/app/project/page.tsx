import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";

export const dynamic = "force-dynamic";

interface Employee {
  employee_id: string;
  name: string;
  role: string;
}

interface Project {
  project_id: string;
  project_name: string;
  percent_complete: number;
}

interface Task {
  task_id: string;
  task_name: string;
  status: string;
  priority: string;
  is_late: boolean;
  project: string; // ForeginKey
}

export default async function HRProjectDashboardPage() {
  // Concurrently fetch overview data
  const [employeesRaw, projectsRaw, tasksRaw, lateTasksRaw] = await Promise.allSettled([
    api.getAll("/api/project/employees/"),
    api.getAll("/api/project/projects/"),
    api.getAll("/api/project/tasks/"),
    api.get("/api/project/tasks/late_work/") // Specialized array response
  ]);

  const employees = (employeesRaw.status === "fulfilled" && Array.isArray(employeesRaw.value) ? employeesRaw.value : []) as Employee[];
  const projects = (projectsRaw.status === "fulfilled" && Array.isArray(projectsRaw.value) ? projectsRaw.value : []) as Project[];
  const tasks = (tasksRaw.status === "fulfilled" && Array.isArray(tasksRaw.value) ? tasksRaw.value : []) as Task[];
  const lateTasks = (lateTasksRaw.status === "fulfilled" && Array.isArray(lateTasksRaw.value) ? lateTasksRaw.value : []) as Task[];

  const activeProjects = projects.filter(p => Math.floor(p.percent_complete) < 100);
  const completedProjects = projects.filter(p => Math.floor(p.percent_complete) === 100);
  
  const pendingTasks = tasks.filter(t => t.status !== "DONE");

  // Overall Project Health metric (average completion)
  const averageCompletion = activeProjects.length > 0 
    ? Math.round(activeProjects.reduce((sum, p) => sum + p.percent_complete, 0) / activeProjects.length)
    : completedProjects.length > 0 ? 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Operations & HR Hub
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Tracking {employees.length} employees across {activeProjects.length} active engagements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/project/project"
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
            >
               Browse Projects
            </Link>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           
           {/* Active Projects */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Active Projects</h3>
                    <div className="mt-2 text-4xl font-black text-blue-600 dark:text-blue-500">{activeProjects.length}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">Out of {projects.length} total historical</p>
              </div>
           </div>

           {/* Health / Progress */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Global Progress</h3>
                    <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-500">{averageCompletion}%</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">Average across active portfolio</p>
              </div>
           </div>

           {/* Pending Tasks */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Pending Tasks</h3>
                    <div className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-500">{pendingTasks.length}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">In backlog & in-progress</p>
              </div>
           </div>

           {/* Blocked / Late */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Late / Overdue</h3>
                    <div className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-500">{lateTasks.length}</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">{lateTasks.length > 0 ? "Requires immediate attention" : "Everything is on schedule"}</p>
              </div>
           </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Overdue Attention Feed */}
           <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    URGENT: Late Tasks
                 </h2>
                 <span className="text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    {lateTasks.length} Items
                 </span>
              </div>
              
              {lateTasks.length === 0 ? (
                 <div className="py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                    <svg className="w-10 h-10 mb-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">Zero late tasks! You&apos;re crushing it.</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                    {lateTasks.slice(0, 5).map((task) => (
                       <div 
                         key={task.task_id} 
                         className="flex items-center justify-between p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30"
                       >
                          <div className="flex flex-col">
                             <span className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">{task.project}</span>
                             <p className="font-bold text-zinc-900 dark:text-zinc-100">{task.task_name}</p>
                          </div>
                          
                          <div className="text-right">
                             <span className="inline-block px-3 py-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 shadow-sm">
                                {task.priority}
                             </span>
                          </div>
                       </div>
                    ))}
                    {lateTasks.length > 5 && (
                      <p className="text-center text-sm font-medium text-zinc-500 pt-2">
                        + {lateTasks.length - 5} more overdue tasks hidden
                      </p>
                    )}
                 </div>
              )}
           </div>

           {/* Quick Actions / Ecosystem */}
           <div className="lg:col-span-1 space-y-6">
              
              {/* Employee Quick Link */}
              <Link href="/project/employees" className="block bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-white relative overflow-hidden group transition-transform hover:scale-[1.02]">
                 <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">Employee Roster</h2>
                    <p className="text-zinc-400 text-sm mb-6">Manage roles, contact details, and working hours for {employees.length} staff members.</p>
                    <span className="inline-flex items-center gap-2 font-bold text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                       Open Directory &rarr;
                    </span>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
              </Link>

              {/* Attendance Log Link */}
              <Link href="/project/attendance" className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-6 transition-all group hover:scale-[1.02] shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                       <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Live Attendance</h3>
                       <p className="text-sm text-zinc-500">Monitor check-ins & hours</p>
                    </div>
                 </div>
              </Link>

           </div>

        </div>

      </div>
    </div>
  );
}
