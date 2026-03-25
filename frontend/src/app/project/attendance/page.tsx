import React from "react";
import { api } from "@/lib/proxy";
import RecordAttendanceModal from "@/components/RecordAttendanceModal";
import CheckOutButton from "@/components/CheckOutButton";

export const dynamic = "force-dynamic";

interface AttendanceLog {
  id: number;
  employee: string; // ID
  check_in: string;
  check_out: string | null;
}

interface Employee {
  employee_id: string;
  name: string;
}

export default async function AttendanceLogPage() {
  // Concurrently fetch logs and employees
  const [logsRaw, employeesRaw] = await Promise.allSettled([
    api.getAll("/api/project/attendance-logs/"),
    api.getAll("/api/project/employees/")
  ]);

  const logs = (logsRaw.status === "fulfilled" && Array.isArray(logsRaw.value) ? logsRaw.value : []) as AttendanceLog[];
  const employees = (employeesRaw.status === "fulfilled" && Array.isArray(employeesRaw.value) ? employeesRaw.value : []) as Employee[];

  // Sort logs by check_in descending (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return null;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMs = end - start;
    
    if (diffMs < 0) return "Invalid";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.employee_id === id);
    return emp ? emp.name : id;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Attendance Monitoring
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Live timeline of employee check-ins and session durations.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <RecordAttendanceModal employees={employees} />
          </div>
        </header>

        {/* Timeline List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden p-8">
           <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Activity Feed
              </h2>
              <span className="text-sm font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-4 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-700">
                 {logs.length} Total Sessions
              </span>
           </div>

           {sortedLogs.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                <p className="font-medium italic text-zinc-500">No attendance logs found for this period.</p>
             </div>
           ) : (
             <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                
                {sortedLogs.map((log) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                     
                     {/* Icon Dot */}
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        {!log.check_out ? (
                           <span className="relative flex h-3 w-3">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                           </span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                     </div>

                     {/* Content Card */}
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:scale-[1.01]">
                        <div className="flex items-center justify-between mb-1">
                           <span className="font-black text-lg text-zinc-900 dark:text-zinc-100">{getEmployeeName(log.employee)}</span>
                           <time className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{formatDateTime(log.check_in)}</time>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                           {!log.check_out ? (
                             <div className="flex items-center gap-3">
                               <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                                 Currently Active
                               </span>
                               <CheckOutButton logId={log.id} />
                             </div>
                           ) : (
                             <>
                             <div className="flex flex-col gap-2">
                               <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-bold flex items-center justify-between gap-4">
                                  <span>Duration: <span className="text-indigo-600 dark:text-indigo-400 ml-1">{calculateDuration(log.check_in, log.check_out)}</span></span>
                               </span>
                               <div className="flex flex-col gap-1 text-[11px] text-zinc-500 font-medium pl-1">
                                  <span>In: {formatDateTime(log.check_in)}</span>
                                  <span>Out: {formatDateTime(log.check_out)}</span>
                               </div>
                             </div>
                             </>
                           )}
                        </div>
                        <p className="mt-4 text-xs font-mono text-zinc-400 dark:text-zinc-600">SID: {log.id}</p>
                     </div>

                  </div>
                ))}

             </div>
           )}

        </div>

      </div>
    </div>
  );
}
