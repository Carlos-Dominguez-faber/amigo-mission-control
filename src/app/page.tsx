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
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("carlos");
  const [avatarState, setAvatarState] = useState<AvatarState>("resting");
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<"tasks" | "docs" | "content">("tasks");

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
      status: "todo",
      assignee: newTaskAssignee,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [...prev, task]);
    setNewTaskTitle("");
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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0f1113] flex items-center justify-between px-4 z-50 border-b border-[#272829]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center text-sm">🤝</div>
          <span className="font-semibold">Mission Control</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("tasks")}
            className={`px-3 py-1.5 rounded-lg text-xs ${view === "tasks" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
          >
            📋
          </button>
          <button
            onClick={() => setView("docs")}
            className={`px-3 py-1.5 rounded-lg text-xs ${view === "docs" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
          >
            📁
          </button>
          <button
            onClick={() => setView("content")}
            className={`px-3 py-1.5 rounded-lg text-xs ${view === "content" ? "bg-[#7c3aed]" : "bg-[#272829]"}`}
          >
            🎬
          </button>
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
      </div>

      {/* Main Content */}
      <div className="pt-14 md:pt-0 md:pl-16">
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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Nueva tarea..."
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-[#16181a] border border-[#272829] rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-white placeholder-[#9aa0a6] text-sm"
                />
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
                          className={`rounded-2xl border p-3 ${statusColors[status]} hover:border-[#7c3aed]/50 transition-colors`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-sm pr-2 line-clamp-2">{task.title}</p>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-[#9aa0a6] hover:text-red-500 transition-colors text-xs flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
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
