"use client";

import { useState, useEffect } from "react";
import AnimatedAvatar, { AvatarState } from "@/components/AnimatedAvatar";
import ReactMarkdown from "react-markdown";

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
  linkedDocs?: string[];
  createdAt: number;
  updatedAt: number;
}

interface Document {
  id: string;
  name: string;
  type: "md" | "pdf" | "image";
  content?: string;
  url?: string;
  uploadedAt: number;
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

const STORAGE_KEY = "amigo-mission-control-tasks";
const DOCS_KEY = "amigo-mission-control-docs";

function detectAvatarState(tasks: Task[]): AvatarState {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  const amigoActiveTasks = tasks.filter(
    t => t.assignee === "amigo" && 
    (t.status === "in-progress" || t.status === "todo") &&
    t.updatedAt > fiveMinutesAgo
  );
  
  if (amigoActiveTasks.length > 0) return "working";
  
  const pendingTasks = tasks.filter(t => t.status !== "done");
  if (pendingTasks.length === 0) return "resting";
  
  return "thinking";
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("carlos");
  const [avatarState, setAvatarState] = useState<AvatarState>("resting");
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<"tasks" | "docs" | "content" | "calendar" | "memory" | "team" | "office">("tasks");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let loadedTasks: Task[] = [];
    if (stored) {
      try {
        loadedTasks = JSON.parse(stored);
        
        // Check if Supabase tasks exist, if not add them
        const hasSupabaseTask = loadedTasks.some((t: Task) => t.title.includes("Supabase"));
        if (!hasSupabaseTask) {
          const now = Date.now();
          loadedTasks.push({
            id: `task-${now + 1}`,
            title: "Crear proyecto Supabase + obtener keys",
            status: "todo",
            assignee: "carlos",
            createdAt: now + 1,
            updatedAt: now + 1,
          });
          loadedTasks.push({
            id: `task-${now + 2}`,
            title: "Configurar Supabase en Mission Control",
            status: "todo",
            assignee: "amigo",
            createdAt: now + 2,
            updatedAt: now + 2,
          });
        }
        
        // Mark OpenClaw research as done
        const hasResearchDone = loadedTasks.some((t: Task) => t.title.includes("OpenClaw") && t.status === "done");
        if (!hasResearchDone) {
          loadedTasks = loadedTasks.map((t: Task) => 
            t.title.includes("OpenClaw") ? { ...t, status: "done" as TaskStatus, updatedAt: Date.now() } : t
          );
        }
        
        setTasks(loadedTasks);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    
    if (loadedTasks.length === 0) {
      const now = Date.now();
      const defaultTasks: Task[] = [
        {
          id: `task-${now}`,
          title: "Investigar casos uso OpenClaw para creators",
          status: "in-progress",
          assignee: "amigo",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `task-${now + 1}`,
          title: "Crear proyecto Supabase + obtener keys",
          status: "todo",
          assignee: "carlos",
          createdAt: now + 1,
          updatedAt: now + 1,
        },
        {
          id: `task-${now + 2}`,
          title: "Configurar Supabase en Mission Control",
          status: "todo",
          assignee: "amigo",
          createdAt: now + 2,
          updatedAt: now + 2,
        },
      ];
      setTasks(defaultTasks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setAvatarState(detectAvatarState(tasks));
    }
  }, [tasks, isLoaded]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const now = Date.now();
    const task: Task = {
      id: `task-${now}`,
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      status: "todo",
      assignee: newTaskAssignee,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [...prev, task]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status, updatedAt: Date.now() } : t
      )
    );
  };

  const handleAssigneeChange = (taskId: string, assignee: Assignee) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assignee, updatedAt: Date.now() } : t
      )
    );
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center">
        <div className="text-[#7c3aed]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white">
      {/* Mobile Header - Simplified */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-[#0f1113] flex items-center justify-between px-3 z-50 border-b border-[#272829]">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setView("tasks")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "tasks" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Tasks"
          >
            📋
          </button>
          <button
            onClick={() => setView("content")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "content" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Content"
          >
            🎬
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "calendar" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Calendar"
          >
            📅
          </button>
          <button
            onClick={() => setView("memory")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "memory" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Memory"
          >
            🧠
          </button>
          <button
            onClick={() => setView("team")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "team" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Team"
          >
            👥
          </button>
          <button
            onClick={() => setView("office")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "office" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Office"
          >
            🏢
          </button>
          <button
            onClick={() => setView("docs")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${view === "docs" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
            title="Docs"
          >
            📁
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini Avatar Status */}
          <div className={`w-2 h-2 rounded-full ${
            avatarState === "working" ? "bg-orange-500" :
            avatarState === "thinking" ? "bg-yellow-500" : "bg-zinc-500"
          }`} title={avatarState} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed left-0 top-0 h-full w-16 bg-[#0f1113] flex flex-col items-center py-6 gap-4 z-50">
        <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center text-lg font-bold">
          🤝
        </div>
        <button
          onClick={() => setView("tasks")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "tasks" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Tasks"
        >
          📋
        </button>
        <button
          onClick={() => setView("docs")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "docs" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Documents"
        >
          📁
        </button>
        <button
          onClick={() => setView("content")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "content" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Content Pipeline"
        >
          🎬
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "calendar" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Calendar"
        >
          📅
        </button>
        <button
          onClick={() => setView("memory")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "memory" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Memory"
        >
          🧠
        </button>
        <button
          onClick={() => setView("team")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "team" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Team"
        >
          👥
        </button>
        <button
          onClick={() => setView("office")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            view === "office" ? "bg-[#7c3aed]" : "hover:bg-[#272829]"
          }`}
          title="Office"
        >
          🏢
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-12 md:pt-0 md:pl-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 md:p-6 border-b border-[#272829]">
          <div className="flex items-center gap-4">
            <AnimatedAvatar state={avatarState} size="sm" className="hidden md:block" />
            <div>
              <h1 className="text-lg md:text-xl font-semibold">Mission Control</h1>
              <p className="text-xs text-[#9aa0a6]">
                {avatarState === "working" && "🔄 Working"}
                {avatarState === "thinking" && "💭 Waiting"}
                {avatarState === "resting" && "😴 Resting"}
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex gap-1">
            {[
              { key: "tasks", icon: "📋", label: "Tasks" },
              { key: "content", icon: "🎬", label: "Content" },
              { key: "calendar", icon: "📅", label: "Calendar" },
              { key: "memory", icon: "🧠", label: "Memory" },
              { key: "team", icon: "👥", label: "Team" },
              { key: "office", icon: "🏢", label: "Office" },
              { key: "docs", icon: "📁", label: "Docs" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key as typeof view)}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                  view === tab.key 
                    ? "bg-[#7c3aed] text-white" 
                    : "bg-[#16181a] text-[#9aa0a6] hover:bg-[#272829]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm">
            <div>
              <span className="text-[#9aa0a6]">Week</span>
              <span className="ml-1 md:ml-2 font-semibold text-[#7c3aed]">
                {tasksByStatus("done").length}/{tasks.length}
              </span>
            </div>
            <div>
              <span className="text-[#9aa0a6]">Active</span>
              <span className="ml-1 md:ml-2 font-semibold text-[#6366f1]">
                {tasksByStatus("in-progress").length}
              </span>
            </div>
          </div>
        </div>

        {view === "tasks" ? (
          <>
            {/* Create Task Form */}
            <form
              onSubmit={handleCreateTask}
              className="p-4 md:p-6 pb-0"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nueva tarea..."
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-[#16181a] border border-[#272829] rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-white placeholder-[#9aa0a6] text-sm"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                    className={`px-3 py-2 rounded-xl text-sm ${
                      newTaskPriority === "high" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                        : newTaskPriority === "low"
                        ? "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value as Assignee)}
                    className="px-3 md:px-4 py-2 md:py-3 bg-[#16181a] border border-[#272829] rounded-xl focus:ring-2 focus:ring-[#7c3aed] text-white text-sm"
                  >
                    <option value="carlos">👤</option>
                    <option value="amigo">🤖</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 md:px-6 py-2 md:py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Descripción / Notas (opcional)..."
                  className="w-full px-3 py-2 bg-[#16181a] border border-[#272829] rounded-xl text-sm text-white placeholder-[#9aa0a6]"
                />
              </div>
            </form>

            {/* Kanban Board - Horizontal scroll on mobile */}
            <div className="overflow-x-auto p-4 md:p-6">
              <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 min-w-[800px] md:min-w-0">
                {(["todo", "in-progress", "done"] as TaskStatus[]).map((status) => (
                  <div key={status} className="min-w-[200px]">
                    <h2 className="text-xs font-semibold mb-3 flex items-center gap-2 px-2">
                      <span className={`w-2 h-2 rounded-full ${
                        status === "todo" ? "bg-[#9aa0a6]" :
                        status === "in-progress" ? "bg-[#6366f1]" : "bg-[#10b981]"
                      }`} />
                      <span className="text-[#9aa0a6]">{statusLabels[status]}</span>
                      <span className="ml-auto text-xs text-[#9aa0a6]">
                        {tasksByStatus(status).length}
                      </span>
                    </h2>

                    <div className="space-y-2 md:space-y-3">
                      {tasksByStatus(status).map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-2xl border p-3 ${statusColors[status]} hover:border-[#7c3aed]/50 transition-colors cursor-pointer`}
                          onClick={() => {
                            // Toggle notes view - for now just show alert
                            if (task.notes) {
                              alert(`📝 Notas:\n${task.notes}`);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-start gap-2">
                              {/* Priority Indicator */}
                              {task.priority === "high" && (
                                <span className="text-red-400 text-xs">🔴</span>
                              )}
                              {task.priority === "medium" && (
                                <span className="text-yellow-400 text-xs">🟡</span>
                              )}
                              <p className="font-medium text-sm pr-2 line-clamp-2">{task.title}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task.id);
                              }}
                              className="text-[#9aa0a6] hover:text-red-500 transition-colors text-xs flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Description/Notes preview */}
                          {task.description && (
                            <p className="text-xs text-[#9aa0a6] mb-2 line-clamp-1">{task.description}</p>
                          )}

                          {/* Notes indicator */}
                          {task.notes && (
                            <p className="text-xs text-[#7c3aed] mb-2">📝 {task.notes.substring(0, 30)}...</p>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            {/* Priority Select */}
                            <select
                              value={task.priority || "medium"}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const newPriority = e.target.value as "low" | "medium" | "high";
                                setTasks(tasks.map(t => 
                                  t.id === task.id ? { ...t, priority: newPriority, updatedAt: Date.now() } : t
                                ));
                              }}
                              className={`text-xs px-2 py-1 rounded-lg ${
                                task.priority === "high" 
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                                  : task.priority === "low"
                                  ? "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              <option value="low">🟢 Low</option>
                              <option value="medium">🟡 Med</option>
                              <option value="high">🔴 High</option>
                            </select>

                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(task.id, e.target.value as TaskStatus)
                              }
                              className="text-xs px-2 py-1 bg-[#0f1113] border border-[#272829] rounded-lg text-[#9aa0a6]"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>

                            <select
                              value={task.assignee}
                              onChange={(e) =>
                                handleAssigneeChange(task.id, e.target.value as Assignee)
                              }
                              className={`text-xs px-2 py-1 border rounded-lg ${
                                task.assignee === "carlos"
                                  ? "bg-[#7c3aed]/10 border-[#7c3aed]/30 text-[#7c3aed]"
                                  : "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                              }`}
                            >
                              <option value="carlos">👤</option>
                              <option value="amigo">🤖</option>
                            </select>
                          </div>
                        </div>
                      ))}

                      {tasksByStatus(status).length === 0 && (
                        <p className="text-[#9aa0a6] text-xs text-center py-6">
                          No tasks
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : view === "docs" ? (
          <DocumentRepository />
        ) : view === "calendar" ? (
          <CalendarView />
        ) : view === "memory" ? (
          <MemoryView />
        ) : view === "team" ? (
          <TeamView />
        ) : view === "office" ? (
          <OfficeView />
        ) : (
          <ContentPipeline />
        )}
      </div>
    </div>
  );
}

function DocumentRepository() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DOCS_KEY);
    if (stored) {
      try {
        setDocs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse docs", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    }
  }, [docs, isLoaded]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = Date.now();
    const ext = file.name.split(".").pop()?.toLowerCase() || "md";
    
    if (ext === "md") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc: Document = {
          id: `doc-${now}`,
          name: file.name,
          type: "md",
          content: event.target?.result as string,
          uploadedAt: now,
        };
        setDocs((prev) => [newDoc, ...prev]);
      };
      reader.readAsText(file);
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc: Document = {
          id: `doc-${now}`,
          name: file.name,
          type: "image",
          url: event.target?.result as string,
          uploadedAt: now,
        };
        setDocs((prev) => [newDoc, ...prev]);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF and other files, just store metadata
      const newDoc: Document = {
        id: `doc-${now}`,
        name: file.name,
        type: ext === "pdf" ? "pdf" : "md",
        uploadedAt: now,
      };
      setDocs((prev) => [newDoc, ...prev]);
    }
    
    e.target.value = "";
  };

  const deleteDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const downloadDoc = (doc: Document) => {
    if (doc.type === "image" && doc.url) {
      const link = document.createElement("a");
      link.href = doc.url;
      link.download = doc.name;
      link.click();
    } else if (doc.type === "md" && doc.content) {
      const blob = new Blob([doc.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="p-6">
      {/* Upload Area */}
      <div className="mb-6">
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl cursor-pointer transition-colors">
          <span>📤 Subir documento</span>
          <input
            type="file"
            accept=".md,.pdf,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <span className="ml-3 text-xs text-[#9aa0a6]">
          MD, PDF, Imágenes
        </span>
      </div>

      {/* Documents Grid */}
      {docs.length === 0 ? (
        <div className="text-center py-20 text-[#9aa0a6]">
          <p className="text-4xl mb-4">📁</p>
          <p>No hay documentos aún</p>
          <p className="text-sm">Sube archivos MD, PDF o imágenes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-[#16181a] border border-[#272829] rounded-2xl p-4 hover:border-[#7c3aed]/50 cursor-pointer transition-colors group"
            >
              <div className="text-3xl mb-2">
                {doc.type === "md" && "📝"}
                {doc.type === "pdf" && "📄"}
                {doc.type === "image" && "🖼️"}
              </div>
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-[#9aa0a6]">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadDoc(doc); }}
                  className="text-xs text-[#7c3aed] hover:underline"
                >
                  ⬇️
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Viewer */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div 
            className="bg-[#16181a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#272829]">
              <h3 className="font-semibold">{selectedDoc.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadDoc(selectedDoc)}
                  className="px-3 py-1 bg-[#7c3aed] rounded-lg text-sm"
                >
                  ⬇️ Descargar
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1 bg-[#272829] rounded-lg text-sm"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
            <div className="p-4">
              {selectedDoc.type === "md" && selectedDoc.content && (
                <div className="bg-[#0f1113] p-6 rounded-xl overflow-auto text-sm text-[#e6e6e6]">
                  <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                </div>
              )}
              {selectedDoc.type === "image" && selectedDoc.url && (
                <img 
                  src={selectedDoc.url} 
                  alt={selectedDoc.name}
                  className="max-w-full rounded-xl"
                />
              )}
              {selectedDoc.type === "pdf" && (
                <div className="text-center py-20 text-[#9aa0a6]">
                  <p className="text-4xl mb-4">📄</p>
                  <p>Vista previa de PDF no disponible</p>
                  <p className="text-sm">Descarga el archivo para verlo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Content Pipeline Types
type ContentStage = "idea" | "script" | "thumbnail" | "filming" | "editing" | "published";
type Platform = "youtube" | "instagram" | "tiktok" | "linkedin" | "twitter";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  stage: ContentStage;
  platform: Platform;
  assignee: Assignee;
  script?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

const CONTENT_KEY = "amigo-mission-control-content";

const stageConfig: Record<ContentStage, { label: string; color: string; bgColor: string }> = {
  idea: { label: "Ideas", color: "text-yellow-500", bgColor: "bg-yellow-500" },
  script: { label: "Scripting", color: "text-blue-500", bgColor: "bg-blue-500" },
  thumbnail: { label: "Thumbnail", color: "text-purple-500", bgColor: "bg-purple-500" },
  filming: { label: "Filming", color: "text-pink-500", bgColor: "bg-pink-500" },
  editing: { label: "Editing", color: "text-orange-500", bgColor: "bg-orange-500" },
  published: { label: "Published", color: "text-green-500", bgColor: "bg-green-500" },
};

const platformIcons: Record<Platform, string> = {
  youtube: "▶️",
  instagram: "📸",
  tiktok: "🎵",
  linkedin: "💼",
  twitter: "🐦",
};

function ContentPipeline() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [newItem, setNewItem] = useState({ title: "", description: "", platform: "youtube" as Platform });

  useEffect(() => {
    const stored = localStorage.getItem(CONTENT_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse content", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const now = Date.now();
    const item: ContentItem = {
      id: `content-${now}`,
      title: newItem.title,
      description: newItem.description,
      stage: "idea",
      platform: newItem.platform,
      assignee: "carlos",
      createdAt: now,
      updatedAt: now,
    };
    setItems([...items, item]);
    setNewItem({ title: "", description: "", platform: "youtube" });
    setShowAddModal(false);
  };

  const moveItem = (itemId: string, newStage: ContentStage) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, stage: newStage, updatedAt: Date.now() } : item
    ));
  };

  const updateItem = (itemId: string, updates: Partial<ContentItem>) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, ...updates, updatedAt: Date.now() } : item
    ));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const itemsByStage = (stage: ContentStage) => items.filter(item => item.stage === stage);

  const stageOrder: ContentStage[] = ["idea", "script", "thumbnail", "filming", "editing", "published"];

  if (!isLoaded) return null;

  return (
    <div className="p-4 md:p-6">
      {/* Summary Tiles */}
      <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2">
        {stageOrder.map(stage => (
          <div
            key={stage}
            className="flex-shrink-0 px-3 md:px-4 py-2 bg-[#16181a] border border-[#272829] rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${stageConfig[stage].bgColor}`} />
              <span className="text-xs text-[#9aa0a6]">{stageConfig[stage].label}</span>
            </div>
            <p className={`text-lg md:text-xl font-bold ${stageConfig[stage].color}`}>
              {itemsByStage(stage).length}
            </p>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-4 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl text-sm font-medium"
      >
        + Nueva Idea
      </button>

      {/* Kanban Columns */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4">
        {stageOrder.map(stage => (
          <div key={stage} className="flex-shrink-0 w-[280px] md:w-[300px]">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stageConfig[stage].bgColor}`} />
                <span className="text-sm font-medium">{stageConfig[stage].label}</span>
              </div>
              <span className="text-xs text-[#9aa0a6]">{itemsByStage(stage).length}</span>
            </div>
            
            <div className="space-y-2 min-h-[200px] bg-[#0f1113]/50 rounded-xl p-2">
              {itemsByStage(stage).map(item => (
                <div
                  key={item.id}
                  className="bg-[#16181a] border border-[#272829] rounded-xl p-3 hover:border-[#7c3aed]/50 transition-colors cursor-pointer"
                  onClick={() => setEditingItem(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm pr-2 line-clamp-2">{item.title}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="text-[#9aa0a6] hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  {item.description && (
                    <p className="text-xs text-[#9aa0a6] mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-[#0f1113] rounded">
                      {platformIcons[item.platform]} {item.platform}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.assignee === "carlos" 
                        ? "bg-[#7c3aed]/20 text-[#7c3aed]" 
                        : "bg-[#10b981]/20 text-[#10b981]"
                    }`}>
                      {item.assignee === "carlos" ? "👤" : "🤖"}
                    </span>
                  </div>
                </div>
              ))}
              
              {itemsByStage(stage).length === 0 && (
                <p className="text-[#9aa0a6] text-xs text-center py-8">No items</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#16181a] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nueva Idea</h3>
            <input
              type="text"
              value={newItem.title}
              onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="Título del video..."
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-3 text-white placeholder-[#9aa0a6]"
            />
            <textarea
              value={newItem.description}
              onChange={e => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Descripción breve..."
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-3 text-white placeholder-[#9aa0a6] h-20"
            />
            <select
              value={newItem.platform}
              onChange={e => setNewItem({ ...newItem, platform: e.target.value as Platform })}
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-4 text-white"
            >
              <option value="youtube">▶️ YouTube</option>
              <option value="instagram">📸 Instagram</option>
              <option value="tiktok">🎵 TikTok</option>
              <option value="linkedin">💼 LinkedIn</option>
              <option value="twitter">🐦 Twitter</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-[#272829] rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={addItem}
                className="flex-1 px-4 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl font-medium"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
          <div className="bg-[#16181a] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Editar Contenido</h3>
            
            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6] mb-1 block">Título</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl text-white"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6] mb-1 block">Descripción</label>
              <textarea
                value={editingItem.description || ""}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl text-white h-20"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6] mb-1 block">Etapa</label>
              <select
                value={editingItem.stage}
                onChange={e => setEditingItem({ ...editingItem, stage: e.target.value as ContentStage })}
                className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl text-white"
              >
                {stageOrder.map(stage => (
                  <option key={stage} value={stage}>{stageConfig[stage].label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6] mb-1 block">Plataforma</label>
              <select
                value={editingItem.platform}
                onChange={e => setEditingItem({ ...editingItem, platform: e.target.value as Platform })}
                className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl text-white"
              >
                <option value="youtube">▶️ YouTube</option>
                <option value="instagram">📸 Instagram</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="twitter">🐦 Twitter</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6] mb-1 block">Asignado a</label>
              <select
                value={editingItem.assignee}
                onChange={e => setEditingItem({ ...editingItem, assignee: e.target.value as Assignee })}
                className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl text-white"
              >
                <option value="carlos">👤 Carlos</option>
                <option value="amigo">🤖 Amigo</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6] mb-1 block">Script</label>
              <textarea
                value={editingItem.script || ""}
                onChange={e => setEditingItem({ ...editingItem, script: e.target.value })}
                placeholder="Escribe el script aquí..."
                className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl text-white h-40"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-3 bg-[#272829] rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateItem(editingItem.id, editingItem);
                  setEditingItem(null);
                }}
                className="flex-1 px-4 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar Types and Component
type CalendarEvent = {
  id: string;
  title: string;
  time: string; // HH:MM format
  dayOfWeek: number; // 0-6 (Sun-Sat)
  color: string;
  colorHex: string;
  isRecurring: boolean;
  interval?: "daily" | "weekly";
};

const CALENDAR_KEY = "amigo-mission-control-calendar";

const defaultEvents: CalendarEvent[] = [
  { id: "1", title: "Mission Control Check", time: "30min", dayOfWeek: -1, color: "blue", colorHex: "#3b82f6", isRecurring: true, interval: "daily" },
  { id: "2", title: "AI Scarcity Research", time: "05:00", dayOfWeek: 1, color: "purple", colorHex: "#8b5cf6", isRecurring: true, interval: "daily" },
  { id: "3", title: "Morning Brief", time: "08:00", dayOfWeek: 1, color: "yellow", colorHex: "#eab308", isRecurring: true, interval: "daily" },
  { id: "4", title: "Newsletter Reminder", time: "09:00", dayOfWeek: 2, color: "green", colorHex: "#22c55e", isRecurring: true, interval: "weekly" },
  { id: "5", title: "Competitor YouTube Scan", time: "10:00", dayOfWeek: 1, color: "red", colorHex: "#ef4444", isRecurring: true, interval: "daily" },
  { id: "6", title: "Last30Days Report", time: "08:00", dayOfWeek: 4, color: "orange", colorHex: "#f97316", isRecurring: true, interval: "weekly" },
];

function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "09:00", dayOfWeek: 1, color: "blue" });

  useEffect(() => {
    const stored = localStorage.getItem(CALENDAR_KEY);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse calendar", e);
        setEvents(defaultEvents);
      }
    } else {
      setEvents(defaultEvents);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
    }
  }, [events, isLoaded]);

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      time: newEvent.time,
      dayOfWeek: newEvent.dayOfWeek,
      color: newEvent.color,
      colorHex: getColorHex(newEvent.color),
      isRecurring: true,
      interval: "weekly",
    };
    setEvents([...events, event]);
    setNewEvent({ title: "", time: "09:00", dayOfWeek: 1, color: "blue" });
    setShowAddModal(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getColorHex = (color: string) => {
    const colors: Record<string, string> = {
      blue: "#3b82f6", purple: "#8b5cf6", yellow: "#eab308", green: "#22c55e", red: "#ef4444", orange: "#f97316"
    };
    return colors[color] || "#3b82f6";
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  
  // Get events for each day of the week (starting from today or Sunday)
  const getEventsForDay = (dayIndex: number) => {
    return events.filter(e => 
      e.dayOfWeek === dayIndex || (e.dayOfWeek === -1) // -1 = always running
    );
  };

  // Always running events
  const alwaysRunning = events.filter(e => e.dayOfWeek === -1);

  // Next up events (sorted by time)
  const nextUpEvents = events
    .filter(e => e.dayOfWeek !== -1)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  const getRelativeTime = (time: string, day: number) => {
    if (day === today) return `Today at ${time}`;
    if (day === today + 1) return `Tomorrow at ${time}`;
    return `${dayNames[day]} at ${time}`;
  };

  if (!isLoaded) return null;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Scheduled Tasks</h1>
          <p className="text-sm text-[#9aa0a6]">Amigo's automated routines</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl text-sm font-medium"
        >
          + Add Task
        </button>
      </div>

      {/* Always Running */}
      {alwaysRunning.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500">⚡</span>
            <span className="font-medium">Always Running</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alwaysRunning.map(event => (
              <div
                key={event.id}
                className="flex items-center gap-2 px-3 py-2 bg-[#16181a] border border-[#272829] rounded-xl"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.colorHex }} />
                <span className="text-sm">{event.title}</span>
                <span className="text-xs text-[#9aa0a6]">• {event.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week Grid */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 md:gap-4 min-w-[700px]">
          {dayNames.map((day, index) => (
            <div key={day} className="flex-1 min-w-[90px]">
              <div className={`text-xs font-medium mb-2 px-2 py-1 rounded-lg text-center ${
                index === today ? "bg-[#7c3aed]" : "text-[#9aa0a6]"
              }`}>
                {day}
              </div>
              <div className="space-y-2 min-h-[150px] bg-[#0f1113]/50 rounded-xl p-2">
                {getEventsForDay(index).map(event => (
                  <div
                    key={event.id}
                    className="rounded-lg p-2 text-xs cursor-pointer hover:opacity-80 transition-opacity group"
                    style={{ backgroundColor: event.colorHex }}
                    onClick={() => deleteEvent(event.id)}
                  >
                    <p className="font-medium text-white truncate">{event.title}</p>
                    <p className="text-white/80">{event.time}</p>
                  </div>
                ))}
                {getEventsForDay(index).length === 0 && (
                  <p className="text-[#9aa0a6] text-xs text-center py-8">-</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Up */}
      <div>
        <h2 className="text-sm font-medium mb-3 px-2">Next Up</h2>
        <div className="space-y-2">
          {nextUpEvents.map(event => (
            <div
              key={event.id}
              className="flex items-center justify-between px-3 py-2 bg-[#16181a] border border-[#272829] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.colorHex }} />
                <span className="text-sm">{event.title}</span>
              </div>
              <span className="text-xs text-[#9aa0a6]">
                {getRelativeTime(event.time, event.dayOfWeek)}
              </span>
            </div>
          ))}
          {nextUpEvents.length === 0 && (
            <p className="text-[#9aa0a6] text-sm text-center py-4">No upcoming tasks</p>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#16181a] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add Scheduled Task</h3>
            <input
              type="text"
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Task name..."
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-3 text-white placeholder-[#9aa0a6]"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-3 text-white"
            />
            <select
              value={newEvent.dayOfWeek}
              onChange={e => setNewEvent({ ...newEvent, dayOfWeek: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-3 text-white"
            >
              <option value={-1}>Always Running</option>
              {dayNames.map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
            <select
              value={newEvent.color}
              onChange={e => setNewEvent({ ...newEvent, color: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f1113] border border-[#272829] rounded-xl mb-4 text-white"
            >
              <option value="blue">🔵 Blue</option>
              <option value="purple">🟣 Purple</option>
              <option value="yellow">🟡 Yellow</option>
              <option value="green">🟢 Green</option>
              <option value="red">🔴 Red</option>
              <option value="orange">🟠 Orange</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-[#272829] rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={addEvent}
                className="flex-1 px-4 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl font-medium"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Memory Types and Component
interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  type: "decision" | "issue" | "conversation" | "learning" | "daily";
}

const MEMORY_KEY = "amigo-mission-control-memories";

const defaultMemories: MemoryEntry[] = [
  {
    id: "1",
    title: "Journal: 2026-02-19",
    content: `## Mission Control Launch
- Created task board with auto state detection
- Added content pipeline (Ideas → Publishing)
- Added calendar for scheduled tasks
- Avatar auto-changes based on task status

## Decisions Made
- Using Supabase instead of Convex (already in stack)
- LocalStorage for now, Supabase sync later
- Dark theme with purple accents

## OpenClaw Research
- Email automation is #1 use case
- Daily briefings high value, low setup
- Content pipeline automation popular`,
    timestamp: Date.now(),
    type: "daily"
  },
  {
    id: "2", 
    title: "Architecture Decision: Subagents",
    content: `- Decided to NOT use subagents for now
- Main agent can handle most tasks
- Subagents adds complexity without clear ROI
- Can revisit if complexity grows`,
    timestamp: Date.now() - 86400000,
    type: "decision"
  },
  {
    id: "3",
    title: "Setup: VPS Configuration",
    content: `- Host: srv1325690 (Hostinger)
- IP: 72.60.114.217
- Connection: Telegram + SSH tunnel
- Purpose: OpenClaw host`,
    timestamp: Date.now() - 172800000,
    type: "learning"
  },
  {
    id: "4",
    title: "User Profile: Carlos Domínguez",
    content: `- Founder: Upper Edge Property Management, LandlordPal, Virtual Staging Pro
- Stack: React, Node, Make, n8n, Supabase
- Goals 2026: Scale VSP to 50-100 clients, automate UEPM
- Communication: Spanish, audio for audio, text for text`,
    timestamp: Date.now() - 259200000,
    type: "conversation"
  },
];

function MemoryView() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "decision" | "issue" | "conversation" | "learning" | "daily">("all");

  useEffect(() => {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMemories(parsed);
        if (parsed.length > 0) setSelectedMemory(parsed[0]);
      } catch (e) {
        console.error("Failed to parse memories", e);
        setMemories(defaultMemories);
        setSelectedMemory(defaultMemories[0]);
      }
    } else {
      setMemories(defaultMemories);
      setSelectedMemory(defaultMemories[0]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && memories.length > 0) {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
    }
  }, [memories, isLoaded]);

  // Group memories by time
  const groupedMemories = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;
    const monthAgo = today - 30 * 86400000;

    const groups: { label: string; items: MemoryEntry[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "This Week", items: [] },
      { label: "This Month", items: [] },
      { label: "Older", items: [] },
    ];

    memories.forEach(m => {
      if (m.timestamp >= today) groups[0].items.push(m);
      else if (m.timestamp >= yesterday) groups[1].items.push(m);
      else if (m.timestamp >= weekAgo) groups[2].items.push(m);
      else if (m.timestamp >= monthAgo) groups[3].items.push(m);
      else groups[4].items.push(m);
    });

    return groups.filter(g => g.items.length > 0);
  };

  // Filter by search and type
  const filteredMemories = memories.filter(m => {
    const matchesSearch = searchQuery === "" || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || m.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      decision: "text-purple-400",
      issue: "text-red-400",
      conversation: "text-blue-400",
      learning: "text-green-400",
      daily: "text-yellow-400",
    };
    return colors[type] || "text-gray-400";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      decision: "⚡",
      issue: "⚠️",
      conversation: "💬",
      learning: "📚",
      daily: "📝",
    };
    return icons[type] || "📄";
  };

  if (!isLoaded) return null;

  const wordCount = selectedMemory ? selectedMemory.content.split(/\s+/).length : 0;

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left: Memory Browser */}
      <div className="w-full md:w-72 border-r border-[#272829] flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-[#272829]">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full px-3 py-2 bg-[#0f1113] border border-[#272829] rounded-lg text-sm text-white placeholder-[#9aa0a6]"
          />
        </div>

        {/* Filters */}
        <div className="p-2 border-b border-[#272829] flex flex-wrap gap-1">
          {(["all", "decision", "conversation", "learning", "daily"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-xs capitalize ${
                filter === f ? "bg-[#7c3aed]" : "bg-[#16181a] text-[#9aa0a6]"
              }`}
            >
              {f === "all" ? "All" : getTypeIcon(f) + " " + f}
            </button>
          ))}
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto">
          {groupedMemories().map(group => (
            <div key={group.label}>
              <div className="px-4 py-2 text-xs text-[#9aa0a6] font-medium sticky top-0 bg-[#0b0c0e]">
                {group.label} ({group.items.length})
              </div>
              {group.items.map(memory => (
                <button
                  key={memory.id}
                  onClick={() => setSelectedMemory(memory)}
                  className={`w-full text-left px-4 py-3 border-b border-[#272829] hover:bg-[#16181a] transition-colors ${
                    selectedMemory?.id === memory.id ? "bg-[#16181a] border-l-2 border-l-[#7c3aed]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{getTypeIcon(memory.type)}</span>
                    <span className="text-sm font-medium truncate">{memory.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9aa0a6]">
                      {new Date(memory.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-[#9aa0a6]">
                      {memory.content.split(/\s+/).length} words
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}
          {filteredMemories.length === 0 && (
            <p className="text-[#9aa0a6] text-sm text-center py-8">No memories found</p>
          )}
        </div>
      </div>

      {/* Right: Memory Content */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        {selectedMemory ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-[#272829]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(selectedMemory.type)}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedMemory.title}</h2>
                    <p className="text-sm text-[#9aa0a6]">
                      {new Date(selectedMemory.timestamp).toLocaleString()} • {wordCount} words
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getTypeColor(selectedMemory.type)} bg-[#0f1113]`}>
                  {selectedMemory.type}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none">
                {selectedMemory.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace("## ", "")}</h3>;
                  }
                  if (line.startsWith("- ")) {
                    return <li key={i} className="text-[#e6e6e6] ml-4">{line.replace("- ", "")}</li>;
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i} className="text-[#e6e6e6]">{line}</p>;
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#9aa0a6]">
            <p>Select a memory to view</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Team Types and Component
interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  color: string;
  colorHex: string;
  layer: "lead" | "agent" | "meta";
  avatar: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Carlos",
    role: "Founder & CEO",
    description: "Visionario, decisiones estratégicas y negocio",
    skills: ["Strategy", "Business", "Sales"],
    color: "blue",
    colorHex: "#3b82f6",
    layer: "lead",
    avatar: "👤"
  },
  {
    id: "2",
    name: "Amigo",
    role: "Chief of Staff",
    description: "Tu mano derecha, coordina todo",
    skills: ["Orchestration", "Clarity", "Delegation"],
    color: "slate",
    colorHex: "#64748b",
    layer: "lead",
    avatar: "🤝"
  },
  {
    id: "3",
    name: "Scout",
    role: "Research Agent",
    description: "Investiga temas, analiza información",
    skills: ["Web Search", "Analysis", "Summaries"],
    color: "teal",
    colorHex: "#14b8a6",
    layer: "agent",
    avatar: "🔍"
  },
  {
    id: "4",
    name: "Quill",
    role: "Content Writer",
    description: "Escribe posts, guiones y copy",
    skills: ["Writing", "Copy", "Scripts"],
    color: "purple",
    colorHex: "#8b5cf6",
    layer: "agent",
    avatar: "✍️"
  },
  {
    id: "5",
    name: "Pixel",
    role: "Design Agent",
    description: "Genera imágenes y assets visuales",
    skills: ["Images", "Design", "Thumbnails"],
    color: "pink",
    colorHex: "#ec4899",
    layer: "agent",
    avatar: "🎨"
  },
  {
    id: "6",
    name: "Echo",
    role: "Outreach Agent",
    description: "Gestiona comunicación y seguimiento",
    skills: ["Messages", "Outreach", "Follow-up"],
    color: "cyan",
    colorHex: "#06b6d4",
    layer: "agent",
    avatar: "📢"
  },
  {
    id: "7",
    name: "Codex",
    role: "Developer Agent",
    description: "Escribe código y construye features",
    skills: ["Code", "Debug", "Deploy"],
    color: "orange",
    colorHex: "#f97316",
    layer: "meta",
    avatar: "⚙️"
  },
];

function TeamView() {
  const lead = teamMembers.filter(m => m.layer === "lead");
  const agents = teamMembers.filter(m => m.layer === "agent");
  const meta = teamMembers.filter(m => m.layer === "meta");

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Meet the Team</h1>
        <p className="text-sm text-[#9aa0a6]">
          6 agentes especializados, cada uno con un rol específico
        </p>
      </div>

      {/* Lead Layer */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-[#9aa0a6] mb-4 uppercase tracking-wider text-center">Leadership</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {lead.map(member => (
            <div
              key={member.id}
              className="w-full md:w-64 bg-[#16181a] border-2 rounded-2xl p-4 hover:border-[#7c3aed]/50 transition-colors cursor-pointer"
              style={{ borderColor: member.colorHex }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: member.colorHex + "20" }}>
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-xs" style={{ color: member.colorHex }}>{member.role}</p>
                </div>
              </div>
              <p className="text-sm text-[#9aa0a6] mb-3">{member.description}</p>
              <div className="flex flex-wrap gap-1">
                {member.skills.map(skill => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded bg-[#0f1113] text-[#9aa0a6]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input/Output Labels */}
      <div className="flex items-center justify-center gap-4 mb-4 text-xs text-[#9aa0a6]">
        <span>INPUT SIGNAL →</span>
        <span>← OUTPUT ACTION</span>
      </div>

      {/* Agent Layer */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-4">
          {agents.map(member => (
            <div
              key={member.id}
              className="w-full md:w-48 bg-[#16181a] border-2 rounded-2xl p-4 hover:border-[#7c3aed]/50 transition-colors cursor-pointer"
              style={{ borderColor: member.colorHex }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: member.colorHex + "20" }}>
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{member.name}</h3>
                  <p className="text-xs" style={{ color: member.colorHex }}>{member.role}</p>
                </div>
              </div>
              <p className="text-xs text-[#9aa0a6] mb-2">{member.description}</p>
              <div className="flex flex-wrap gap-1">
                {member.skills.map(skill => (
                  <span key={skill} className="text-xs px-1.5 py-0.5 rounded bg-[#0f1113] text-[#9aa0a6]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta Layer */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-[#9aa0a6] mb-4 uppercase tracking-wider text-center">Meta Layer</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {meta.map(member => (
            <div
              key={member.id}
              className="w-full md:w-64 bg-[#16181a] border-2 rounded-2xl p-4 hover:border-[#7c3aed]/50 transition-colors cursor-pointer"
              style={{ borderColor: member.colorHex }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: member.colorHex + "20" }}>
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-xs" style={{ color: member.colorHex }}>{member.role}</p>
                </div>
              </div>
              <p className="text-sm text-[#9aa0a6] mb-3">{member.description}</p>
              <div className="flex flex-wrap gap-1">
                {member.skills.map(skill => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded bg-[#0f1113] text-[#9aa0a6]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Team Member */}
      <div className="text-center">
        <button className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl text-sm font-medium">
          + Agregar Agente
        </button>
      </div>
    </div>
  );
}

// Office Types and Component
type AgentState = "planning" | "executing" | "waiting_api" | "waiting_human" | "error" | "review" | "idle";

interface OfficeAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  colorHex: string;
  state: AgentState;
  currentTask?: string;
  taskProgress?: number;
  zone: "desk" | "meeting" | "lobby";
  lastActivity?: number;
  channel?: string;
}

const stateConfig: Record<AgentState, { label: string; color: string; bgColor: string; icon: string }> = {
  planning: { label: "Planificando", color: "text-blue-400", bgColor: "bg-blue-400", icon: "📝" },
  executing: { label: "Ejecutando", color: "text-green-400", bgColor: "bg-green-400", icon: "⚡" },
  waiting_api: { label: "Esperando API", color: "text-yellow-400", bgColor: "bg-yellow-400", icon: "⏳" },
  waiting_human: { label: "Esperando input", color: "text-purple-400", bgColor: "bg-purple-400", icon: "💬" },
  error: { label: "Error", color: "text-red-400", bgColor: "bg-red-400", icon: "⚠️" },
  review: { label: "Revisión", color: "text-cyan-400", bgColor: "bg-cyan-400", icon: "👀" },
  idle: { label: "Inactivo", color: "text-zinc-400", bgColor: "bg-zinc-400", icon: "💤" },
};

// Sample agents with states
const sampleAgents: OfficeAgent[] = [
  { id: "amigo", name: "Amigo", role: "Chief of Staff", avatar: "🤝", color: "slate", colorHex: "#64748b", state: "executing", currentTask: "Respondiendo a Carlos", taskProgress: 65, zone: "desk", lastActivity: Date.now(), channel: "Telegram" },
  { id: "scout", name: "Scout", role: "Research", avatar: "🔍", color: "teal", colorHex: "#14b8a6", state: "idle", zone: "lobby", lastActivity: Date.now() - 300000 },
  { id: "quill", name: "Quill", role: "Writer", avatar: "✍️", color: "purple", colorHex: "#8b5cf6", state: "executing", currentTask: "Escribiendo script para Reel", taskProgress: 30, zone: "desk", lastActivity: Date.now(), channel: "Content" },
  { id: "pixel", name: "Pixel", role: "Designer", avatar: "🎨", color: "pink", colorHex: "#ec4899", state: "waiting_api", currentTask: "Generando thumbnail", zone: "desk", lastActivity: Date.now(), channel: "Content" },
  { id: "echo", name: "Echo", role: "Outreach", avatar: "📢", color: "cyan", colorHex: "#06b6d4", state: "waiting_human", currentTask: "Esperando approve de mensaje", zone: "desk", lastActivity: Date.now(), channel: "WhatsApp" },
  { id: "codex", name: "Codex", role: "Developer", avatar: "⚙️", color: "orange", colorHex: "#f97316", state: "idle", zone: "lobby", lastActivity: Date.now() - 600000 },
];

function OfficeView() {
  const [agents, setAgents] = useState<OfficeAgent[]>(sampleAgents);
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgent | null>(null);

  // Calculate KPIs
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.state !== "idle").length;
  const idleAgents = agents.filter(a => a.state === "idle").length;
  const errorAgents = agents.filter(a => a.state === "error").length;
  const tasksInProgress = agents.filter(a => ["executing", "planning", "waiting_api"].includes(a.state)).length;

  const getAgentPosition = (agent: OfficeAgent, index: number) => {
    // Zone-based positioning
    if (agent.zone === "desk") {
      const deskPositions = [
        { x: 10, y: 20 }, { x: 35, y: 20 }, { x: 60, y: 20 }, // Row 1
        { x: 10, y: 55 }, { x: 35, y: 55 }, { x: 60, y: 55 }, // Row 2
      ];
      return deskPositions[index % 6] || { x: 10, y: 20 };
    }
    if (agent.zone === "meeting") {
      return { x: 80, y: 35 };
    }
    return { x: 85, y: 75 }; // lobby
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Office Canvas */}
      <div className="flex-1 relative bg-[#0f1113] overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle, #272829 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        {/* Zone Labels */}
        <div className="absolute top-4 left-4 text-xs text-[#9aa0a6] font-medium">ESCRITORIOS</div>
        <div className="absolute top-4 right-4 text-xs text-[#9aa0a6] font-medium">SALA DE JUNTAS</div>
        <div className="absolute bottom-4 right-4 text-xs text-[#9aa0a6] font-medium">LOBBY</div>

        {/* Desks Area */}
        <div className="absolute inset-x-4 top-10 bottom-1/3 bg-[#16181a] rounded-xl border border-[#272829] p-4">
          <div className="grid grid-cols-3 gap-4 h-full">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="bg-[#0f1113] rounded-lg border border-dashed border-[#272829] flex items-center justify-center">
                <span className="text-[#9aa0a6] text-xs">Desk {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Room */}
        <div className="absolute right-4 top-20 w-32 h-40 bg-[#16181a] rounded-xl border border-[#272829] flex items-center justify-center">
          <span className="text-[#9aa0a6] text-xs">Sala</span>
        </div>

        {/* Lobby */}
        <div className="absolute right-4 bottom-4 w-32 h-24 bg-[#16181a] rounded-xl border border-[#272829] flex items-center justify-center">
          <span className="text-[#9aa0a6] text-xs">Lobby</span>
        </div>

        {/* Agents */}
        {agents.map((agent, index) => {
          const pos = getAgentPosition(agent, index);
          const state = stateConfig[agent.state];
          const isSelected = selectedAgent?.id === agent.id;
          
          return (
            <div
              key={agent.id}
              className={`absolute cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex flex-col items-center">
                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full mb-1 ${state.bgColor} ${agent.state === 'executing' ? 'animate-pulse' : ''}`} />
                
                {/* Avatar */}
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${isSelected ? 'border-[#7c3aed]' : ''}`}
                  style={{ backgroundColor: agent.colorHex + '20', borderColor: isSelected ? '#7c3aed' : agent.colorHex }}
                >
                  {agent.avatar}
                </div>
                
                {/* Name */}
                <span className="text-xs mt-1 font-medium">{agent.name}</span>
                
                {/* State Badge */}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${state.color} bg-[#0f1113]`}>
                  {state.icon}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      {selectedAgent && (
        <div className="w-72 bg-[#0f1113] border-l border-[#272829] p-4 overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: selectedAgent.colorHex + '20' }}>
              {selectedAgent.avatar}
            </div>
            <div>
              <h3 className="font-bold">{selectedAgent.name}</h3>
              <p className="text-xs text-[#9aa0a6]">{selectedAgent.role}</p>
            </div>
          </div>

          {/* State */}
          <div className="mb-4">
            <label className="text-xs text-[#9aa0a6]">Estado</label>
            <div className={`flex items-center gap-2 mt-1`}>
              <span className={`w-2 h-2 rounded-full ${stateConfig[selectedAgent.state].bgColor}`} />
              <span className={`text-sm ${stateConfig[selectedAgent.state].color}`}>
                {stateConfig[selectedAgent.state].icon} {stateConfig[selectedAgent.state].label}
              </span>
            </div>
          </div>

          {/* Current Task */}
          {selectedAgent.currentTask && (
            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6]">Tarea Actual</label>
              <p className="text-sm mt-1">{selectedAgent.currentTask}</p>
              {selectedAgent.taskProgress !== undefined && (
                <div className="mt-2 h-1 bg-[#272829] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#7c3aed]" 
                    style={{ width: `${selectedAgent.taskProgress}%` }} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Channel */}
          {selectedAgent.channel && (
            <div className="mb-4">
              <label className="text-xs text-[#9aa0a6]">Canal</label>
              <p className="text-sm mt-1">{selectedAgent.channel}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-3 py-2 bg-[#272829] rounded-lg text-xs hover:bg-[#3f3f46]">
              ⏸️ Pausar
            </button>
            <button className="flex-1 px-3 py-2 bg-[#272829] rounded-lg text-xs hover:bg-[#3f3f46]">
              📋 Ver tarea
            </button>
          </div>
        </div>
      )}

      {/* KPIs Bar (when no agent selected) */}
      {!selectedAgent && (
        <div className="absolute bottom-4 left-4 right-4 flex gap-4 justify-center">
          <div className="px-4 py-2 bg-[#16181a] border border-[#272829] rounded-xl flex items-center gap-2">
            <span className="text-green-400">⚡</span>
            <span className="text-sm">{activeAgents} activos</span>
          </div>
          <div className="px-4 py-2 bg-[#16181a] border border-[#272829] rounded-xl flex items-center gap-2">
            <span className="text-yellow-400">📋</span>
            <span className="text-sm">{tasksInProgress} tareas</span>
          </div>
          <div className="px-4 py-2 bg-[#16181a] border border-[#272829] rounded-xl flex items-center gap-2">
            <span className="text-zinc-400">💤</span>
            <span className="text-sm">{idleAgents} idle</span>
          </div>
          {errorAgents > 0 && (
            <div className="px-4 py-2 bg-[#16181a] border border-red-500/30 rounded-xl flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-sm">{errorAgents} errores</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
