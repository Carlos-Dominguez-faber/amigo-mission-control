"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TeamMember } from "@/features/team/types";

interface UseTeamReturn {
  members: TeamMember[];
  isLoaded: boolean;
  addMember: (member: Partial<TeamMember>) => Promise<TeamMember>;
  updateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
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

  async function addMember(member: Partial<TeamMember>): Promise<TeamMember> {
    const payload = {
      name: member.name ?? "",
      role: member.role ?? "",
      description: member.description ?? null,
      skills: member.skills ?? [],
      color: member.color ?? "blue",
      color_hex: member.color_hex ?? "#3b82f6",
      layer: member.layer ?? "human",
      avatar: member.avatar ?? "\u{1F464}",
    };

    const { data, error } = await supabase
      .from("team_members")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    const created = data as TeamMember;
    setMembers((prev) => [created, ...prev]);
    return created;
  }

  async function updateMember(id: string, updates: Partial<TeamMember>): Promise<void> {
    const { error } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }

  async function deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return {
    members,
    isLoaded,
    addMember,
    updateMember,
    deleteMember,
  };
}
