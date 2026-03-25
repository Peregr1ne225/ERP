import React from "react";
import Link from "next/link";
import { api } from "@/lib/proxy";
import AddProjectModal from "@/components/AddProjectModal";

export const dynamic = "force-dynamic";

interface Project {
  project_id: string;
  project_name: string;
  description: string;
  status: string;
  percent_complete: number;
}

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    const projectsRaw = await api.getAll("/api/project/projects/");
    projects = (Array.isArray(projectsRaw) ? projectsRaw : []) as Project[];
  } catch (err) {
    console.error("Failed to fetch projects:", err);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-500 text-white";
      case "PLANNED": return "bg-blue-500 text-white";
      case "ON_HOLD": return "bg-amber-500 text-white";
      case "COMPLETED": return "bg-indigo-600 text-white";
      case "CANCELLED": return "bg-zinc-500 text-white";
      default: return "bg-zinc-800 text-white";
    }
  };



  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase">
              Project Portfolio
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Real-time strategic oversight of all active and planned initiatives.
            </p>
          </div>
          <AddProjectModal />
        </header>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-xl font-black uppercase tracking-widest opacity-40">No Initiatives Found</p>
            <p className="mt-2 font-medium">Start by initiating your first strategic project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link
                key={project.project_id}
                href={`/project/project/${project.project_id}`}
                className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl relative overflow-hidden"
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full pointer-events-none ${getStatusColor(project.status || "PLANNED").split(' ')[0]}`} />

                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(project.status || "PLANNED")}`}>
                    {(project.status || "PLANNED").replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-indigo-500 transition-colors">
                    {project.project_id}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {project.project_name}
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-8 font-medium">
                  {project.description || "No strategic summary provided for this initiative."}
                </p>

                {/* Progress Bar */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Completion</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{project.percent_complete}%</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out"
                      style={{ width: `${project.percent_complete}%` }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span>Project Overview</span>
                </div>

                {/* Arrow Hint */}
                <div className="absolute bottom-4 right-8 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
