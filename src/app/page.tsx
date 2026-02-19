"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AnimatedAvatar, { AvatarState } from "@/components/AnimatedAvatar";
import { useRouter } from "next/navigation";

type TaskStatus = "todo" | "in-progress" | "done";
type Assignee = "carlos" | "amigo";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
  priority?: "low" | "medium" | "high";
  notes?: string;
  created_at: number;
  updated_at: number;
}

// Task hook with Supabase
function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTasks(data.map((t: any) => ({
          ...t,
          created_at: new Date(t.created_at).getTime(),
          updated_at: new Date(t.updated_at).getTime(),
        })));
        setIsOnline(true);
        console.log("📡 Loaded from Supabase:", data.length, "tasks");
      }
    } catch (err) {
      console.log("Using localStorage fallback for tasks");
      const stored = localStorage.getItem("amigo-tasks");
      if (stored) setTasks(JSON.parse(stored));
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("amigo-tasks", JSON.stringify(newTasks));
    
    if (isOnline && newTasks.length > 0) {
      try {
        await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("tasks").insert(
          newTasks.map(t => ({
            title: t.title,
            description: t.description,
            status: t.status,
            assignee: t.assignee,
            priority: t.priority || "medium",
            notes: t.notes,
            created_at: new Date(t.created_at),
            updated_at: new Date(),
          }))
        );
        console.log("✅ Synced to Supabase");
      } catch (e) { console.error("Sync failed", e); }
    }
  };

  const addTask = async (title: string, assignee: Assignee, priority: string, description?: string) => {
    const now = Date.now();
    const newTask: Task = {
      id: `task-${now}`,
      title, description, status: "todo", assignee,
      priority: priority as any, notes: "",
      created_at: now, updated_at: now,
    };
    await saveTasks([...tasks, newTask]);
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await saveTasks(tasks.map(t => t.id === id ? { ...t, status, updated_at: Date.now() } : t));
  };

  const updateTaskAssignee = async (id: string, assignee: Assignee) => {
    await saveTasks(tasks.map(t => t.id === id ? { ...t, assignee, updated_at: Date.now() } : t));
  };

  const updateTaskPriority = async (id: string, priority: string) => {
    await saveTasks(tasks.map(t => t.id === id ? { ...t, priority: priority as any, updated_at: Date.now() } : t));
  };

  const deleteTask = async (id: string) => {
    await saveTasks(tasks.filter(t => t.id !== id));
  };

  return { tasks, isLoaded, isOnline, addTask, updateTaskStatus, updateTaskAssignee, updateTaskPriority, deleteTask, loadTasks };
}

const statusLabels: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

const statusColors: Record<TaskStatus, string> = {
  "todo": "bg-[#16181a] border-[#272829]",
  "in-progress": "bg-[#1a1b2e] border-[#4c3fff]",
  "done": "bg-[#16181a] border-[#10b981]",
};

function detectAvatarState(tasks: Task[]): AvatarState {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const amigoActiveTasks = tasks.filter(t => t.assignee === "amigo" && (t.status === "in-progress" || t.status === "todo") && t.updated_at > fiveMinutesAgo);
  if (amigoActiveTasks.length > 0) return "working";
  const pendingTasks = tasks.filter(t => t.status !== "done");
  if (pendingTasks.length === 0) return "resting";
  return "thinking";
}

export default function TaskBoard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center">
        <div className="text-orange-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const { tasks, isLoaded, isOnline, addTask, updateTaskStatus, updateTaskAssignee, updateTaskPriority, deleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("carlos");
  const [avatarState, setAvatarState] = useState<AvatarState>("resting");
  const [view, setView] = useState<"tasks" | "docs" | "content" | "calendar" | "memory" | "team" | "office">("tasks");

  useEffect(() => {
    if (isLoaded) {
      setAvatarState(detectAvatarState(tasks));
    }
  }, [tasks, isLoaded]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, newTaskAssignee, newTaskPriority, newTaskDescription);
    setNewTaskTitle(""); setNewTaskDescription(""); setNewTaskPriority("medium");
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  if (!isLoaded) return <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center"><div className="text-[#7c3aed]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-[#0f1113] flex items-center justify-between px-3 z-50 border-b border-[#272829]">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: "tasks", icon: "📋" }, { key: "content", icon: "🎬" }, { key: "calendar", icon: "📅" },
            { key: "memory", icon: "🧠" }, { key: "team", icon: "👥" }, { key: "office", icon: "🏢" }, { key: "docs", icon: "📁" }
          ].map(tab => (
            <button key={tab.key} onClick={() => setView(tab.key as any)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === tab.key ? "bg-[#7c3aed]" : "bg-[#272829]"}`}>
              {tab.icon}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-yellow-500"}`} title={isOnline ? "Online" : "Offline"} />
          <div className={`w-2 h-2 rounded-full ${avatarState === "working" ? "bg-orange-500" : avatarState === "thinking" ? "bg-yellow-500" : "bg-zinc-500"}`} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed left-0 top-0 h-full w-16 bg-[#0f1113] flex flex-col items-center py-6 gap-4 z-50">
        <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center text-lg font-bold">🤝</div>
        {[
          { key: "tasks", icon: "📋" }, { key: "content", icon: "🎬" }, { key: "calendar", icon: "📅" },
          { key: "memory", icon: "🧠" }, { key: "team", icon: "👥" }, { key: "office", icon: "🏢" }, { key: "docs", icon: "📁" }
        ].map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key as any)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${view === tab.key ? "bg-[#7c3aed]" : "hover:bg-[#272829]"}`} title={tab.key}>
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="pt-12 md:pt-0 md:pl-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 md:p-6 border-b border-[#272829]">
          <div className="flex items-center gap-4">
            <AnimatedAvatar state={avatarState} size="sm" className="hidden md:block" />
            <div>
              <h1 className="text-lg md:text-xl font-semibold">Mission Control {isOnline && <span className="text-xs text-green-500 ml-1">📡</span>}</h1>
              <p className="text-xs text-[#9aa0a6]">{avatarState === "working" ? "🔄 Working" : avatarState === "thinking" ? "💭 Waiting" : "😴 Resting"}</p>
            </div>
          </div>
          <div className="hidden md:flex gap-1">
            {[
              { key: "tasks", icon: "📋", label: "Tasks" }, { key: "content", icon: "🎬", label: "Content" },
              { key: "calendar", icon: "📅", label: "Calendar" }, { key: "memory", icon: "🧠", label: "Memory" },
              { key: "team", icon: "👥", label: "Team" }, { key: "office", icon: "🏢", label: "Office" }, { key: "docs", icon: "📁", label: "Docs" }
            ].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key as any)} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${view === tab.key ? "bg-[#7c3aed] text-white" : "bg-[#16181a] text-[#9aa0a6] hover:bg-[#272829]"}`}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs md:text-sm">
            <div><span className="text-[#9aa0a6]">Week</span><span className="ml-1 md:ml-2 font-semibold text-[#7c3aed]">{tasksByStatus("done").length}/{tasks.length}</span></div>
            <div><span className="text-[#9aa0a6]">Active</span><span className="ml-1 md:ml-2 font-semibold text-[#6366f1]">{tasksByStatus("in-progress").length}</span></div>
          </div>
        </div>

        {view === "tasks" && (
          <>
            <form onSubmit={handleCreateTask} className="p-4 md:p-6 pb-0">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Nueva tarea..." className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-[#16181a] border border-[#272829] rounded-xl focus:ring-2 focus:ring-[#7c3aed] text-white text-sm" />
                  <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)} className={`px-3 py-2 rounded-xl text-sm ${newTaskPriority === "high" ? "bg-red-500/20 text-red-400 border border-red-500/30" : newTaskPriority === "low" ? "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                    <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option>
                  </select>
                  <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value as Assignee)} className="px-3 md:px-4 py-2 md:py-3 bg-[#16181a] border border-[#272829] rounded-xl text-white text-sm">
                    <option value="carlos">👤</option><option value="amigo">🤖</option>
                  </select>
                  <button type="submit" className="px-4 md:px-6 py-2 md:py-3 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl text-sm font-medium">+</button>
                </div>
                <input type="text" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} placeholder="Descripción / Notas..." className="w-full px-3 py-2 bg-[#16181a] border border-[#272829] rounded-xl text-sm text-white" />
              </div>
            </form>

            <div className="overflow-x-auto p-4 md:p-6">
              <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 min-w-[800px] md:min-w-0">
                {(["todo", "in-progress", "done"] as TaskStatus[]).map(status => (
                  <div key={status} className="min-w-[200px]">
                    <h2 className="text-xs font-semibold mb-3 flex items-center gap-2 px-2">
                      <span className={`w-2 h-2 rounded-full ${status === "todo" ? "bg-[#9aa0a6]" : status === "in-progress" ? "bg-[#6366f1]" : "bg-[#10b981]"}`} />
                      <span className="text-[#9aa0a6]">{statusLabels[status]}</span>
                      <span className="ml-auto text-xs text-[#9aa0a6]">{tasksByStatus(status).length}</span>
                    </h2>
                    <div className="space-y-2 md:space-y-3">
                      {tasksByStatus(status).map(task => (
                        <div key={task.id} className={`rounded-2xl border p-3 ${statusColors[status]} hover:border-[#7c3aed]/50 cursor-pointer`} onClick={() => task.notes && alert(`📝 ${task.notes}`)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-start gap-2">
                              {task.priority === "high" && <span className="text-red-400 text-xs">🔴</span>}
                              {task.priority === "medium" && <span className="text-yellow-400 text-xs">🟡</span>}
                              <p className="font-medium text-sm pr-2 line-clamp-2">{task.title}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }} className="text-[#9aa0a6] hover:text-red-500 text-xs">✕</button>
                          </div>
                          {task.description && <p className="text-xs text-[#9aa0a6] mb-2 line-clamp-1">{task.description}</p>}
                          {task.notes && <p className="text-xs text-[#7c3aed] mb-2">📝 {task.notes.substring(0,20)}...</p>}
                          <div className="flex flex-wrap gap-1.5">
                            <select value={task.priority || "medium"} onClick={e => e.stopPropagation()} onChange={e => updateTaskPriority(task.id, e.target.value)} className={`text-xs px-2 py-1 rounded-lg ${task.priority === "high" ? "bg-red-500/20 text-red-400" : task.priority === "low" ? "bg-zinc-500/20 text-zinc-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                              <option value="low">🟢</option><option value="medium">🟡</option><option value="high">🔴</option>
                            </select>
                            <select value={task.status} onClick={e => e.stopPropagation()} onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)} className="text-xs px-2 py-1 bg-[#0f1113] border border-[#272829] rounded-lg text-[#9aa0a6]">
                              <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                            </select>
                            <select value={task.assignee} onClick={e => e.stopPropagation()} onChange={e => updateTaskAssignee(task.id, e.target.value as Assignee)} className={`text-xs px-2 py-1 border rounded-lg ${task.assignee === "carlos" ? "bg-[#7c3aed]/10 border-[#7c3aed]/30 text-[#7c3aed]" : "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"}`}>
                              <option value="carlos">👤</option><option value="amigo">🤖</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      {tasksByStatus(status).length === 0 && <p className="text-[#9aa0a6] text-xs text-center py-6">No tasks</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {view === "docs" && <div className="p-6 text-[#9aa0a6]">📁 Documents - Coming soon</div>}
        {view === "content" && <div className="p-6 text-[#9aa0a6]">🎬 Content Pipeline - Coming soon</div>}
        {view === "calendar" && <div className="p-6 text-[#9aa0a6]">📅 Calendar - Coming soon</div>}
        {view === "memory" && <div className="p-6 text-[#9aa0a6]">🧠 Memory - Coming soon</div>}
        {view === "team" && <div className="p-6 text-[#9aa0a6]">👥 Team - Coming soon</div>}
        {view === "office" && <div className="p-6 text-[#9aa0a6]">🏢 Office - Coming soon</div>}
      </div>
    </div>
  );
}
