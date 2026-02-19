"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AnimatedAvatar, { AvatarState } from "@/components/AnimatedAvatar";
import { useRouter } from "next/navigation";
import { useContent, useCalendar, useMemories, useTeam, useOffice } from "@/hooks/useData";

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
    return newTask;
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

  // Data hooks - MUST be called before any early returns
  const { tasks, isLoaded, isOnline, addTask, updateTaskStatus, updateTaskAssignee, updateTaskPriority, deleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("carlos");
  const [linkedDocs, setLinkedDocs] = useState<Record<string, string[]>>({});
  const [pendingDoc, setPendingDoc] = useState<string | null>(null);
  const [showDocsModal, setShowDocsModal] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>("resting");
  const [view, setView] = useState<"tasks" | "docs" | "content" | "calendar" | "memory" | "team" | "office">("tasks");

  // Data hooks
  const { items: contentItems, isLoaded: contentLoaded, addContent, updateContentStage } = useContent();
  const { events: calendarEvents, isLoaded: calendarLoaded, addEvent } = useCalendar();
  const { memories, isLoaded: memoryLoaded, addMemory } = useMemories();
  const { members: teamMembers, isLoaded: teamLoaded } = useTeam();
  const { agents: officeAgents, isLoaded: officeLoaded } = useOffice();
  const [allDocs, setAllDocs] = useState<string[]>([]);

  // Load docs from storage
  useEffect(() => {
    const loadDocs = async () => {
      const token = localStorage.getItem("sb-access-token");
      try {
        const res = await fetch("https://cvofvffeabstndbuzwjc.supabase.co/storage/v1/object/list/documents", {
          headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
          const data = await res.json();
          setAllDocs(data.map((f: any) => f.name));
        }
      } catch(e) { console.log("No docs"); }
    };
    if (view === "docs") loadDocs();
  }, [view]);

  // Auth check - runs once on mount
  useEffect(() => {
    const token = localStorage.getItem("sb-access-token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  // Avatar state
  useEffect(() => {
    if (isLoaded) {
      setAvatarState(detectAvatarState(tasks));
    }
  }, [tasks, isLoaded]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center">
        <div className="text-orange-500">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) return null;

  // Data not loaded
  if (!isLoaded) return <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center"><div className="text-[#7c3aed]">Loading...</div></div>;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = await addTask(newTaskTitle, newTaskAssignee, newTaskPriority, newTaskDescription);
    if (pendingDoc && newTask?.id) {
      setLinkedDocs(prev => ({ ...prev, [newTask.id]: [pendingDoc] }));
      setPendingDoc(null);
    }
    setNewTaskTitle(""); setNewTaskDescription(""); setNewTaskPriority("medium");
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

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
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#16181a] border border-[#272829] rounded-xl text-sm text-[#9aa0a6] cursor-pointer hover:border-[#7c3aed]/50">
                    <span>📎</span>
                    <span className="text-xs">Adjuntar</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const token = localStorage.getItem("sb-access-token");
                          const formData = new FormData();
                          formData.append("file", file);
                          
                          try {
                            const res = await fetch("https://cvofvffeabstndbuzwjc.supabase.co/storage/v1/object/documents/" + file.name, {
                              method: "POST",
                              headers: {
                                "Authorization": "Bearer " + token,
                                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2b2Z2ZmZlYWJzdG5kYnV6d2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTA0NDgsImV4cCI6MjA4NzA4NjQ0OH0.aEeyaSMDKWuUeNTPRHguPhwrlXbB6yj5T2FdPwcdbSM"
                              },
                              body: formData
                            });
                            if (res.ok) {
                              setPendingDoc(file.name);
                              alert("✅ Listo: " + file.name);
                            } else {
                              alert("❌ Error: " + res.statusText);
                            }
                          } catch(err) {
                            alert("❌ Error: " + err);
                          }
                        }
                      }} 
                    />
                    {pendingDoc && <span className="text-xs text-orange-400">📎 {pendingDoc}</span>}
                  </label>
                </div>
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
                          {(linkedDocs[task.id] || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {(linkedDocs[task.id] || []).map((doc, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400">📎 {doc}</span>
                              ))}
                            </div>
                          )}
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
        {view === "docs" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">📁 Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDocs.length === 0 ? (
                <p className="text-[#9aa0a6] col-span-full">No hay documentos. Sube uno en Tasks.</p>
              ) : (
                allDocs.map((doc, i) => (
                  <div key={i} className="bg-[#16181a] rounded-2xl p-4 border border-[#272829] flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{doc}</p>
                      <a 
                        href={`https://cvofvffeabstndbuzwjc.supabase.co/storage/v1/object/public/documents/${doc}`} 
                        target="_blank" 
                        className="text-xs text-orange-400 hover:underline"
                      >
                        Ver →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === "content" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">🎬 Content Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["idea", "script", "thumbnail", "filming", "editing", "published"].map((stage) => (
                <div key={stage} className="bg-[#16181a] rounded-2xl p-4 border border-[#272829]">
                  <h3 className="font-medium text-white mb-3 capitalize">{stage}</h3>
                  <div className="space-y-2">
                    {contentItems.filter(i => i.stage === stage).map(item => (
                      <div key={item.id} className="p-3 bg-[#0f1113] rounded-xl border border-[#272829]">
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="text-xs text-[#9aa0a6]">{item.platform} • {item.assignee}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "calendar" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">📅 Calendar</h2>
            <div className="bg-[#16181a] rounded-2xl p-6 border border-[#272829]">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-xs text-[#9aa0a6] py-2">{day}</div>
                ))}
              </div>
              <div className="space-y-2">
                {calendarEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-[#0f1113] rounded-xl border-l-4" style={{ borderColor: event.color }}>
                    <span className="text-sm font-medium text-white">{event.time}</span>
                    <span className="text-sm text-[#9aa0a6]">{event.title}</span>
                    {event.is_recurring && <span className="text-xs text-[#7c3aed]">🔄</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "memory" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">🧠 Memory</h2>
            <div className="space-y-3">
              {memories.map(memory => (
                <div key={memory.id} className="bg-[#16181a] rounded-2xl p-4 border border-[#272829]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-lg bg-[#7c3aed]/20 text-[#7c3aed]">{memory.memory_type}</span>
                    <span className="text-xs text-[#9aa0a6]">{new Date(memory.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-medium text-white">{memory.title}</h3>
                  <p className="text-sm text-[#9aa0a6] mt-1">{memory.content}</p>
                </div>
              ))}
              {memories.length === 0 && (
                <p className="text-[#9aa0a6] text-center py-8">No memories yet</p>
              )}
            </div>
          </div>
        )}

        {view === "team" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">👥 Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map(member => (
                <div key={member.id} className="bg-[#16181a] rounded-2xl p-4 border border-[#272829]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: member.color + "20" }}>
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{member.name}</h3>
                      <p className="text-xs text-[#9aa0a6]">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#9aa0a6]">{member.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.isArray(member.skills) && member.skills.map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-lg bg-[#272829] text-[#9aa0a6]">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "office" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">🏢 Office</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {["desk", "meeting", "lobby"].map(zone => (
                <div key={zone} className="bg-[#16181a] rounded-2xl p-4 border border-[#272829]">
                  <h3 className="font-medium text-white mb-3 capitalize">{zone}</h3>
                  <div className="space-y-2">
                    {officeAgents.filter(a => a.zone === zone).map(agent => (
                      <div key={agent.id} className="flex items-center gap-2 p-2 bg-[#0f1113] rounded-xl">
                        <span className="text-xl">{agent.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{agent.name}</p>
                          <p className="text-xs text-[#9aa0a6]">{agent.current_task}</p>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-lg" style={{ 
                          backgroundColor: agent.agent_state === "executing" ? "#10b98120" : agent.agent_state === "idle" ? "#272829" : "#f59e0b20",
                          color: agent.agent_state === "executing" ? "#10b981" : agent.agent_state === "idle" ? "#9aa0a6" : "#f59e0b"
                        }}>
                          {agent.task_progress}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "content" && <div className="p-6 text-[#9aa0a6]">🎬 Content Pipeline - Coming soon</div>}
        {view === "calendar" && <div className="p-6 text-[#9aa0a6]">📅 Calendar - Coming soon</div>}
        {view === "memory" && <div className="p-6 text-[#9aa0a6]">🧠 Memory - Coming soon</div>}
        {view === "team" && <div className="p-6 text-[#9aa0a6]">👥 Team - Coming soon</div>}
        {view === "office" && <div className="p-6 text-[#9aa0a6]">🏢 Office - Coming soon</div>}
      </div>
    </div>
  );
}
