"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Memory } from "@/features/memory/types";

interface UseMemoriesReturn {
  memories: Memory[];
  isLoaded: boolean;
  addMemory: (memory: Partial<Memory>) => Promise<Memory>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
}

export function useMemories(): UseMemoriesReturn {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadMemories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setMemories((data as Memory[]) ?? []);
    } catch (err) {
      console.error("[useMemories] Failed to load memories:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  async function addMemory(memory: Partial<Memory>): Promise<Memory> {
    const payload = {
      title: memory.title ?? "",
      content: memory.content ?? "",
      memory_type: memory.memory_type ?? "general",
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("memories")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    const created = data as Memory;
    setMemories((prev) => [created, ...prev]);
    return created;
  }

  async function updateMemory(id: string, updates: Partial<Memory>): Promise<void> {
    const { error } = await supabase
      .from("memories")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }

  async function deleteMemory(id: string): Promise<void> {
    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  return {
    memories,
    isLoaded,
    addMemory,
    updateMemory,
    deleteMemory,
  };
}
