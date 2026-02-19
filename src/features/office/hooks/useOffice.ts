"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { OfficeAgent } from "@/features/office/types";

interface UseOfficeReturn {
  agents: OfficeAgent[];
  isLoaded: boolean;
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

  return {
    agents,
    isLoaded,
  };
}
