"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Task, TaskStatus, Assignee, Priority } from "@/features/tasks/types";
import {
  fetchTasks as fetchTasksService,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
} from "@/features/tasks/services/taskService";

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

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasksService();
      setTasks(data);
      setIsOnline(true);
    } catch {
      console.log("[useTasks] Supabase unavailable");
      setIsOnline(false);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Supabase Realtime: listen for changes from other clients (e.g. OpenClaw agent)
  useEffect(() => {
    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTasks]);

  // PWA: refetch when app returns to foreground (WebSocket may have died in background)
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") loadTasks();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadTasks]);

  // PWA: polling fallback every 30s in case Realtime drops silently
  useEffect(() => {
    const id = setInterval(loadTasks, 30_000);
    return () => clearInterval(id);
  }, [loadTasks]);

  // PWA: listen for manual refresh event from header button
  useEffect(() => {
    function handleRefresh() { loadTasks(); }
    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, [loadTasks]);

  async function addTask(
    title: string,
    assignee: Assignee,
    priority: Priority = "medium",
    description?: string
  ): Promise<Task> {
    const created = await createTaskService({
      title,
      description,
      assignee,
      priority,
    });
    setTasks((prev) => [created, ...prev]);
    return created;
  }

  async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    await updateTaskService(id, { status });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
      )
    );
  }

  async function updateTaskAssignee(id: string, assignee: Assignee): Promise<void> {
    await updateTaskService(id, { assignee });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, assignee, updated_at: new Date().toISOString() } : t
      )
    );
  }

  async function updateTaskPriority(id: string, priority: Priority): Promise<void> {
    await updateTaskService(id, { priority });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, priority, updated_at: new Date().toISOString() } : t
      )
    );
  }

  async function updateTaskNotes(id: string, notes: string): Promise<void> {
    await updateTaskService(id, { notes });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, notes, updated_at: new Date().toISOString() } : t
      )
    );
  }

  async function deleteTask(id: string): Promise<void> {
    await deleteTaskService(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
