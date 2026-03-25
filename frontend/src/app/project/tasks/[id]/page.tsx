import Link from "next/link";
import { api } from "@/lib/proxy";
import ChangeTaskStatusButton from "@/components/ChangeTaskStatusButton";
import SetTaskRating from "@/components/SetTaskRating";
import EditTaskModal from "@/components/EditTaskModal";
import DeleteTaskButton from "@/components/DeleteTaskButton";

export const dynamic = "force-dynamic";

interface Task {
  task_id: string;
  project: string;
  assigned_to: string | null;
  task_name: string;
  priority: string;
  status: string;
  due_date: string;
  deadline: string;
  rating: number | null;
}

interface Project {
  project_id: string;
  project_name: string;
}

interface Employee {
  employee_id: string;
  name: string;
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Single task fetch
  const task = await api.get(`/api/project/tasks/${encodeURIComponent(id)}/`) as Task;
  
  // Parallel fetch for related data
  const [project, employees, employee] = await Promise.all([
    api.get(`/api/project/projects/${task.project}/`) as Promise<Project>,
    api.getAll("/api/project/employees/") as Promise<Employee[]>,
    task.assigned_to 
      ? api.get(`/api/project/employees/${task.assigned_to}/`) as Promise<Employee>
      : Promise.resolve(null),
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Emergency": return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "Urgent": return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "Moderate": return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default: return "text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Breadcrumb & Navigation */}
        <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
          <Link href="/project/project" className="hover:text-indigo-600 transition-colors">Portfolio</Link>
          <span>/</span>
          <Link href={`/project/project/${project.project_id}`} className="hover:text-indigo-600 transition-colors">{project.project_name}</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">{task.task_id}</span>
        </nav>

        {/* Task Title Section */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
             <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
               {task.priority}
             </span>
             <span className="text-sm font-mono text-zinc-400">{task.task_id}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 leading-tight">
            {task.task_name}
          </h1>
        </header>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Lifecycle State</h3>
            <div className="pt-2">
              <ChangeTaskStatusButton taskId={task.task_id} currentStatus={task.status} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Owner</h3>
            <Link 
              href={employee ? `/project/employees/${employee.employee_id}` : "#"}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                {employee?.name.charAt(0) || "?"}
              </div>
              <div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{employee?.name || "Unassigned"}</div>
                <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-none">{employee?.employee_id || "N/A"}</div>
              </div>
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Quality Rating</h3>
            <SetTaskRating taskId={task.task_id} currentRating={task.rating} />
          </div>

        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Timeline & Deadlines */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="text-center md:text-left">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Target Start</div>
             <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{new Date(task.due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
           </div>

           <div className="flex flex-col items-center">
              <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-1" />
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Tenure</div>
           </div>

           <div className="text-center md:text-right">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Final Deadline</div>
             <div className={`text-2xl font-black ${new Date(task.deadline) < new Date() && task.status !== 'DONE' ? 'text-rose-600 animate-pulse' : 'text-zinc-900 dark:text-zinc-50'}`}>
               {new Date(task.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
           </div>
        </section>

        {/* Action Center */}
        <div className="flex flex-wrap justify-center items-center gap-6 pt-8">
           <Link 
            href={`/project/project/${project.project_id}`}
            className="px-8 py-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Return to Project
           </Link>

           <EditTaskModal task={task} employees={employees} />
           <DeleteTaskButton taskId={task.task_id} />
        </div>

      </div>
    </div>
  );
}
