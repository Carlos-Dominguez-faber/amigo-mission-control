"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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

const STORAGE_KEY = "amigo-mission-control-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Try to load from Supabase first
  const loadTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTasks(data);
        setIsOnline(true);
      } else {
        // Try localStorage if empty
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        }
      }
    } catch (err) {
      console.log("Using localStorage fallback");
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse tasks", e);
        }
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Save to both Supabase and localStorage
  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));

    if (isOnline) {
      try {
        // Clear and re-insert all tasks
        await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (newTasks.length > 0) {
          await supabase.from("tasks").insert(
            newTasks.map(t => ({
              title: t.title,
              description: t.description,
              status: t.status,
              assignee: t.assignee,
              priority: t.priority || "medium",
              notes: t.notes,
              created_at: t.created_at || Date.now(),
              updated_at: Date.now(),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to sync to Supabase", err);
      }
    }
  };

  const addTask = async (title: string, assignee: Assignee, priority: "low" | "medium" | "high" = "medium", description?: string) => {
    const now = Date.now();
    const newTask: Task = {
      id: `task-${now}`,
      title,
      description,
      status: "todo",
      assignee,
      priority,
      notes: "",
      created_at: now,
      updated_at: now,
    };
    await saveTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, status, updated_at: Date.now() } : t
    );
    await saveTasks(newTasks);
  };

  const updateTaskAssignee = async (id: string, assignee: Assignee) => {
    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, assignee, updated_at: Date.now() } : t
    );
    await saveTasks(newTasks);
  };

  const updateTaskPriority = async (id: string, priority: "low" | "medium" | "high") => {
    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, priority, updated_at: Date.now() } : t
    );
    await saveTasks(newTasks);
  };

  const updateTaskNotes = async (id: string, notes: string) => {
    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, notes, updated_at: Date.now() } : t
    );
    await saveTasks(newTasks);
  };

  const deleteTask = async (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    await saveTasks(newTasks);
  };

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
    loadTasks,
  };
}
