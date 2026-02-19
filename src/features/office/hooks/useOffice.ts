"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { OfficeAgent } from "@/features/office/types";

interface UseOfficeReturn {
  agents: OfficeAgent[];
  isLoaded: boolean;
  updateAgent: (id: string, updates: Partial<OfficeAgent>) => Promise<void>;
}

export function useOffice(): UseOfficeReturn {
  const [agents, setAgents] = useState<OfficeAgent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadAgents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("office_agents")
        .select("*");

      if (error) throw error;
      setAgents((data as OfficeAgent[]) ?? []);
    } catch (err) {
      console.error("[useOffice] Failed to load office agents:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  async function updateAgent(id: string, updates: Partial<OfficeAgent>): Promise<void> {
    const payload = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from("office_agents")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...payload } : a)));
  }

  return {
    agents,
    isLoaded,
    updateAgent,
  };
}
