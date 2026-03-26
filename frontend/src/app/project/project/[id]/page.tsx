import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";
import AddTaskModal from "@/components/AddTaskModal";
import ChangeTaskStatusButton from "@/components/ChangeTaskStatusButton";
import UpdateProjectStatusModal from "@/components/UpdateProjectStatusModal";

export const dynamic = "force-dynamic";

interface Task {
  task_id: string;
  task_name: string;
  priority: string;
  status: string;
  due_date: string;
  deadline: string;
  assigned_to: string | null;
  assigned_to_name?: string; // We'll enrich this
}

interface Project {
  project_id: string;
  project_name: string;
  description: string;
  status: string;
  percent_complete: number;
}

interface Employee {
  employee_id: string;
  name: string;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || id === "undefined") {
    return (
      <div className="p-16 text-center">
        <h1 className="text-2xl font-bold text-rose-600">Invalid Project ID</h1>
        <Link href="/project/project" className="text-blue-500 hover:underline mt-4 block">Return to Portfolio</Link>
      </div>
    );
  }

  // Parallel data fetching
  const [project, tasksRaw, employees] = await Promise.all([
    api.get(`/api/project/projects/${encodeURIComponent(id)}/`) as Promise<Project>,
    api.getAll(`/api/project/tasks/?project=${encodeURIComponent(id)}`) as Promise<Task[]>,
    api.getAll("/api/project/employees/") as Promise<Employee[]>,
  ]);

  const tasks = (Array.isArray(tasksRaw) ? tasksRaw : []) as Task[];

  // Map employee IDs to names for the task list
  const employeeMap = new Map(employees.map(e => [e.employee_id, e.name]));
  const enrichedTasks = tasks.map(t => ({
    ...t,
    assigned_to_name: t.assigned_to ? employeeMap.get(t.assigned_to) : "Unassigned"
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Emergency": return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "Urgent": return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "Moderate": return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default: return "text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE": return "bg-emerald-500 text-white";
      case "IN PROGRESS": return "bg-indigo-500 text-white";
      default: return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Breadcrumb & Navigation */}
        <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
          <Link href="/project/project" className="hover:text-indigo-600 transition-colors">Portfolio</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">{project.project_id}</span>
        </nav>

        {/* Project Header Card */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <UpdateProjectStatusModal projectId={id} currentStatus={project.status} />
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                  {project.project_name}
                </h1>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium max-w-3xl leading-relaxed">
                {project.description || "No strategic overview provided for this initiative."}
              </p>
            </div>

            {/* Progress Gauges */}
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <div className="text-sm font-black uppercase tracking-widest text-zinc-400">Project Momentum</div>
              <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 leading-none tabular-nums">
                {project.percent_complete}%
              </div>
              <div className="w-48 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-linear-to-r from-indigo-600 to-purple-500"
                  style={{ width: `${project.percent_complete}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Task Management Section */}
        <section className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Strategic Tasks</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{tasks.length} Operational items tracked</p>
            </div>
            <AddTaskModal projectId={id} employees={employees} />
          </header>

          {enrichedTasks.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 italic">
              <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="font-medium text-lg">No tasks deployed yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {enrichedTasks.sort((a, b) => b.priority === "Emergency" ? 1 : -1).map(task => (
                <Link
                  key={task.task_id}
                  href={`/project/tasks/${task.task_id}`}
                  className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="flex-1 flex items-start gap-5">
                      <div className="mt-1 shrink-0">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status).split(' ')[0]}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-mono text-zinc-400">{task.task_id}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.task_name}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                            <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {task.assigned_to_name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <ChangeTaskStatusButton taskId={task.task_id} currentStatus={task.status} />
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
