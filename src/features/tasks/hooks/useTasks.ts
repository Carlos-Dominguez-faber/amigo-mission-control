"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Task, TaskStatus, Assignee, Priority } from "@/features/tasks/types";

const STORAGE_KEY = "amigo-mission-control-tasks";

interface UseTasksReturn {
  tasks: Task[];
  isLoaded: boolean;
  isOnline: boolean;
  addTask: (
    title: string,
    assignee: Assignee,
    priority: Priority,
    description?: string
  ) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskAssignee: (id: string, assignee: Assignee) => Promise<void>;
  updateTaskPriority: (id: string, priority: Priority) => Promise<void>;
  updateTaskNotes: (id: string, notes: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

function readFromStorage(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Task[];
  } catch {
    return [];
  }
}

function writeToStorage(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useTasks(): UseTasksReturn {
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
        const fetched = data as Task[];
        setTasks(fetched);
        writeToStorage(fetched);
        setIsOnline(true);
      } else {
        const local = readFromStorage();
        setTasks(local);
      }
    } catch {
      console.log("[useTasks] Supabase unavailable — using localStorage fallback");
      setTasks(readFromStorage());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function persistTasks(next: Task[]): Promise<void> {
    setTasks(next);
    writeToStorage(next);

    if (!isOnline) return;

    try {
      await supabase
        .from("tasks")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (next.length > 0) {
        await supabase.from("tasks").insert(
          next.map((t) => ({
            title: t.title,
            description: t.description,
            status: t.status,
            assignee: t.assignee,
            priority: t.priority,
            notes: t.notes,
            created_at: t.created_at,
            updated_at: t.updated_at,
          }))
        );
      }
    } catch (err) {
      console.error("[useTasks] Failed to sync to Supabase:", err);
    }
  }

  async function addTask(
    title: string,
    assignee: Assignee,
    priority: Priority = "medium",
    description?: string
  ): Promise<Task> {
    const now = new Date().toISOString();

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: "todo",
      assignee,
      priority,
      notes: "",
      created_at: now,
      updated_at: now,
    };

    await persistTasks([...tasks, newTask]);
    return newTask;
  }

  async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
    );
    await persistTasks(next);
  }

  async function updateTaskAssignee(id: string, assignee: Assignee): Promise<void> {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, assignee, updated_at: new Date().toISOString() } : t
    );
    await persistTasks(next);
  }

  async function updateTaskPriority(id: string, priority: Priority): Promise<void> {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, priority, updated_at: new Date().toISOString() } : t
    );
    await persistTasks(next);
  }

  async function updateTaskNotes(id: string, notes: string): Promise<void> {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, notes, updated_at: new Date().toISOString() } : t
    );
    await persistTasks(next);
  }

  async function deleteTask(id: string): Promise<void> {
    const next = tasks.filter((t) => t.id !== id);
    await persistTasks(next);
  }

  return {
    tasks,
    isLoaded,
    isOnline,
    addTask,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    updateTaskNotes,
    deleteTask,
    reload: loadTasks,
  };
}
