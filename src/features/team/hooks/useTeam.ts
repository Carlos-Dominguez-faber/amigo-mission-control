"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TeamMember } from "@/features/team/types";

interface UseTeamReturn {
  members: TeamMember[];
  isLoaded: boolean;
}

export function useTeam(): UseTeamReturn {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers((data as TeamMember[]) ?? []);
    } catch (err) {
      console.error("[useTeam] Failed to load team members:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return {
    members,
    isLoaded,
  };
}
