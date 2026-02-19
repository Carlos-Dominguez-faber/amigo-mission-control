"use client";

import { useState, useEffect } from "react";

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

const statusLabels: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

const statusColors: Record<TaskStatus, string> = {
  "todo": "bg-gray-100 border-gray-300",
  "in-progress": "bg-blue-50 border-blue-300",
  "done": "bg-green-50 border-green-300",
};

const STORAGE_KEY = "amigo-mission-control-tasks";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("carlos");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
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

  // Save to localStorage on change
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
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🤝 Amigo Mission Control - Tasks
          </h1>
          <span className="text-sm text-gray-500">📱 Local Storage</span>
        </div>

        {/* Create Task Form */}
        <form
          onSubmit={handleCreateTask}
          className="bg-white rounded-lg shadow p-4 mb-8 flex gap-3 items-center"
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value as Assignee)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="carlos">Carlos</option>
            <option value="amigo">Amigo</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar
          </button>
        </form>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["todo", "in-progress", "done"] as TaskStatus[]).map((status) => (
            <div
              key={status}
              className={`rounded-lg border-2 p-4 ${statusColors[status]}`}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {status === "todo" && "📋"}
                {status === "in-progress" && "⚡"}
                {status === "done" && "✅"}
                {statusLabels[status]}
                <span className="text-sm font-normal text-gray-500">
                  ({tasksByStatus(status).length})
                </span>
              </h2>

              <div className="space-y-3">
                {tasksByStatus(status).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Status Selector */}
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value as TaskStatus)
                        }
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>

                      {/* Assignee Selector */}
                      <select
                        value={task.assignee}
                        onChange={(e) =>
                          handleAssigneeChange(task.id, e.target.value as Assignee)
                        }
                        className={`text-xs px-2 py-1 border rounded ${
                          task.assignee === "carlos"
                            ? "bg-orange-50 border-orange-300 text-orange-700"
                            : "bg-purple-50 border-purple-300 text-purple-700"
                        }`}
                      >
                        <option value="carlos">👤 Carlos</option>
                        <option value="amigo">🤖 Amigo</option>
                      </select>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                {tasksByStatus(status).length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
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
