import { supabase } from "@/lib/supabase";
import type { Task } from "@/features/tasks/types";

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Task[]) ?? [];
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const now = new Date().toISOString();

  const payload = {
    title: task.title ?? "",
    description: task.description,
    status: task.status ?? "todo",
    assignee: task.assignee ?? "carlos",
    priority: task.priority ?? "medium",
    notes: task.notes ?? "",
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
