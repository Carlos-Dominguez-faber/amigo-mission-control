"use client";

import { useState, useEffect } from "react";
import AnimatedAvatar from "@/components/AnimatedAvatar";

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

type AvatarState = "working" | "thinking" | "resting";

const statusLabels: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

const statusColors: Record<TaskStatus, string> = {
  "todo": "bg-zinc-900 border-orange-500/30",
  "in-progress": "bg-zinc-900 border-orange-500/50",
  "done": "bg-zinc-900 border-green-500/30",
};

const STORAGE_KEY = "amigo-mission-control-tasks";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("carlos");
  const [avatarState, setAvatarState] = useState<AvatarState>("resting");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <AnimatedAvatar state={avatarState} size="md" />
            <div className="flex gap-2">
              <button
                onClick={() => setAvatarState("working")}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  avatarState === "working" ? "bg-orange-500" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
                title="Working"
              >
                ⚡
              </button>
              <button
                onClick={() => setAvatarState("thinking")}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  avatarState === "thinking" ? "bg-yellow-500" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
                title="Thinking"
              >
                🤔
              </button>
              <button
                onClick={() => setAvatarState("resting")}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  avatarState === "resting" ? "bg-zinc-600" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
                title="Resting"
              >
                💤
              </button>
            </div>
          </div>
          <span className="text-xs text-zinc-500">📱 Local Storage</span>
        </div>

        {/* Create Task Form */}
        <form
          onSubmit={handleCreateTask}
          className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Nueva tarea..."
              className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-zinc-500"
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value as Assignee)}
              className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-orange-500 text-white"
            >
              <option value="carlos">👤 Carlos</option>
              <option value="amigo">🤖 Amigo</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>

        {/* Kanban Board - Mobile: vertical stack, Desktop: horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(["todo", "in-progress", "done"] as TaskStatus[]).map((status) => (
            <div
              key={status}
              className={`rounded-lg border-2 p-4 ${statusColors[status]}`}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {status === "todo" && "📋"}
                {status === "in-progress" && "⚡"}
                {status === "done" && "✅"}
                <span className="text-zinc-300">{statusLabels[status]}</span>
                <span className="ml-auto text-sm font-normal text-zinc-500">
                  {tasksByStatus(status).length}
                </span>
              </h2>

              <div className="space-y-3">
                {tasksByStatus(status).map((task) => (
                  <div
                    key={task.id}
                    className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 hover:border-orange-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-white pr-2">{task.title}</p>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value as TaskStatus)
                        }
                        className="text-xs px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-300"
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
                        className={`text-xs px-2 py-1.5 border rounded ${
                          task.assignee === "carlos"
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                        }`}
                      >
                        <option value="carlos">👤 Carlos</option>
                        <option value="amigo">🤖 Amigo</option>
                      </select>
                    </div>

                    <p className="text-xs text-zinc-600 mt-2">
                      {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                {tasksByStatus(status).length === 0 && (
                  <p className="text-zinc-600 text-sm text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
