import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import EditEmployeeModal from "@/components/EditEmployeeModal";

export const dynamic = "force-dynamic";

interface Employee {
  employee_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  role: string;
  time_working: string;
}

export default async function EmployeeDirectoryPage() {
  // Fetch all employees
  const employeesRaw = await api.getAll("/api/project/employees/").catch(() => [] as unknown[]);
  const employees = employeesRaw as Employee[];

  // Sort by Name alphabetically
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Employee Directory
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Active roster of {employees.length} personnel.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/project/attendance"
              className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold shadow-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
               View Attendance
            </Link>
            <AddEmployeeModal />
          </div>
        </header>

        {/* Master Data Table */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Role & Schedule
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400 italic">
                      No employees records found in the system.
                    </td>
                  </tr>
                ) : (
                  sortedEmployees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      
                      {/* Name & ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 items-center justify-center text-white font-bold text-sm shadow-inner hidden sm:flex">
                              {emp.name.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <Link 
                               href={`/project/employees/${emp.employee_id}`}
                               className="text-sm font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                             >
                                {emp.name}
                             </Link>
                             <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {emp.employee_id}
                             </div>
                           </div>
                        </div>
                      </td>

                      {/* Role & Schedule */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                           <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                             {emp.role}
                           </span>
                           <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             {emp.time_working}
                           </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                            <a href={`mailto:${emp.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                               {emp.email}
                            </a>
                            {emp.phone_number ? (
                               <a href={`tel:${emp.phone_number}`} className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-blue-600 transition-colors">
                                  {emp.phone_number}
                               </a>
                            ) : (
                               <span className="text-xs text-zinc-400 italic">No phone</span>
                            )}
                         </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <EditEmployeeModal employee={emp} />
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Bar */}
          <div className="bg-zinc-50 dark:bg-zinc-950/50 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm text-zinc-500">
             <span>Showing all {sortedEmployees.length} personnel.</span>
          </div>
        </section>

      </div>
    </div>
  );
}
