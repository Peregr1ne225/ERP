import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";
import CheckOutButton from "@/components/CheckOutButton";

export const dynamic = "force-dynamic";

interface Employee {
  employee_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  role: string;
  time_working: string;
}

interface AttendanceLog {
  id: number;
  check_in: string;
  check_out: string | null;
}

interface Task {
  task_id: string;
  task_name: string;
  status: string;
  priority: string;
  deadline: string;
  is_late: boolean;
  project: string;
}

interface PageProps {
  params: Promise<{ employee_id: string }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { employee_id } = await params;

  // Concurrently fetch all profile data using backend filters
  const [employeeRaw, logsRaw, tasksRaw] = await Promise.allSettled([
    api.get(`/api/project/employees/${employee_id}/`),
    api.getAll(`/api/project/attendance-logs/?employee=${employee_id}`),
    api.getAll(`/api/project/tasks/?assigned_to=${employee_id}`)
  ]);

  if (employeeRaw.status === "rejected") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-rose-600">Employee Not Found</h1>
        <Link href="/project/employees" className="text-blue-500 hover:underline mt-4 block">Back to Directory</Link>
      </div>
    );
  }

  const employee = employeeRaw.value as Employee;
  const logs = (logsRaw.status === "fulfilled" && Array.isArray(logsRaw.value) ? logsRaw.value : []) as AttendanceLog[];
  const tasks = (tasksRaw.status === "fulfilled" && Array.isArray(tasksRaw.value) ? tasksRaw.value : []) as Task[];

  const activeTasks = tasks.filter(t => t.status !== "DONE");
  const lateTasks = activeTasks.filter(t => t.is_late);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumbs / Back Link */}
        <nav className="flex items-center gap-2 text-sm font-medium text-zinc-500">
           <Link href="/project/employees" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Directory</Link>
           <span>/</span>
           <span className="text-zinc-900 dark:text-zinc-100 font-bold">{employee.name}</span>
        </nav>

        {/* Profile Header Card */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="h-24 w-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                 {employee.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                 <h1 className="text-4xl font-black tracking-tight">{employee.name}</h1>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800">
                       {employee.role}
                    </span>
                    <span className="text-sm font-mono text-zinc-400 dark:text-zinc-500">#{employee.employee_id}</span>
                 </div>
              </div>
              <div className="flex flex-col gap-2 items-center md:items-end">
                 <a href={`mailto:${employee.email}`} className="text-zinc-900 dark:text-white font-bold hover:underline">{employee.email}</a>
                 <span className="text-sm text-zinc-500">{employee.phone_number || "No Phone Registered"}</span>
                 <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-600 dark:text-zinc-400">
                    Schedule: {employee.time_working}
                 </span>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: Task Workload */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                       <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                       In-Flight Tasks
                    </h2>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-500">
                          {activeTasks.length} Total
                       </span>
                       {lateTasks.length > 0 && (
                          <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold animate-pulse">
                             {lateTasks.length} Late
                          </span>
                       )}
                    </div>
                 </div>

                 {activeTasks.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-50 dark:border-zinc-800 rounded-2xl text-zinc-400">
                       Zero active tasks assigned.
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {activeTasks.map(task => (
                          <div key={task.task_id} className={`p-5 rounded-2xl border transition-all ${task.is_late ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800/50'}`}>
                             <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{task.project}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-white'}`}>
                                   {task.priority}
                                </span>
                             </div>
                             <h3 className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{task.task_name}</h3>
                             <div className="mt-4 flex items-center justify-between text-[11px] font-bold">
                                <span className={task.is_late ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500'}>
                                   Due: {task.deadline}
                                </span>
                                <span className="text-zinc-400">{task.status}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Right Column: Attendance History */}
           <div className="space-y-8">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm h-fit">
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Recent Presence
                 </h2>
                 
                 {logs.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No attendance records found.</p>
                 ) : (
                    <div className="space-y-6">
                       {logs.slice(0, 10).map(log => (
                          <div key={log.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-zinc-100 dark:before:bg-zinc-800 last:before:hidden">
                             <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-sm" />
                             <div className="flex flex-col gap-1">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{log.check_out ? 'Completed Session' : 'Active Now'}</p>
                                <div className="text-[11px] font-medium text-zinc-400 flex flex-col pt-1">
                                   <span>In: {formatDateTime(log.check_in)}</span>
                                   {log.check_out && <span>Out: {formatDateTime(log.check_out)}</span>}
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                   {!log.check_out && <CheckOutButton logId={log.id} />}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
