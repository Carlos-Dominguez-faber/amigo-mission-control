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

  // Supabase Realtime: listen for agent state changes (e.g. from OpenClaw)
  useEffect(() => {
    const channel = supabase
      .channel("office-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "office_agents" },
        () => {
          loadAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAgents]);

  // PWA: refetch when app returns to foreground
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") loadAgents();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadAgents]);

  // PWA: polling fallback every 30s
  useEffect(() => {
    const id = setInterval(loadAgents, 30_000);
    return () => clearInterval(id);
  }, [loadAgents]);

  // PWA: listen for manual refresh event
  useEffect(() => {
    function handleRefresh() { loadAgents(); }
    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
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
