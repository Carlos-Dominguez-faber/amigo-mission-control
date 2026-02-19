import { useState, useEffect, useCallback } from "react";
import { supabase, getAccessToken } from "@/lib/supabase";

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  stage: "idea" | "script" | "thumbnail" | "filming" | "editing" | "published";
  platform: "youtube" | "instagram" | "tiktok" | "linkedin" | "twitter";
  script?: string;
  assignee: string;
  created_at: string;
}

export function useContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      const token = getAccessToken();
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setItems(data);
        console.log("📡 Loaded content:", data.length);
      }
    } catch (err) {
      console.error("Content load error:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  const addContent = async (item: Partial<ContentItem>) => {
    const newItem = {
      id: crypto.randomUUID(),
      title: item.title || "New Content",
      description: item.description || "",
      stage: item.stage || "idea",
      platform: item.platform || "instagram",
      assignee: item.assignee || "carlos",
      created_at: new Date().toISOString(),
    };
    
    const { error } = await supabase.from("content_items").insert([newItem]);
    if (!error) {
      setItems([newItem, ...items]);
    }
    return newItem;
  };

  const updateContentStage = async (id: string, stage: string) => {
    const { error } = await supabase.from("content_items").update({ stage }).eq("id", id);
    if (!error) {
      setItems(items.map(i => i.id === id ? { ...i, stage: stage as any } : i));
    }
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return { items, isLoaded, addContent, updateContentStage, deleteContent };
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  day_of_week: number;
  color: string;
  is_recurring: boolean;
  interval_type: string;
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("time");

      if (error) throw error;
      if (data) {
        setEvents(data);
        console.log("📡 Loaded calendar:", data.length);
      }
    } catch (err) {
      console.error("Calendar load error:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const addEvent = async (event: Partial<CalendarEvent>) => {
    const newEvent = {
      id: crypto.randomUUID(),
      title: event.title || "New Event",
      time: event.time || "09:00",
      day_of_week: event.day_of_week ?? -1,
      color: event.color || "#7c3aed",
      is_recurring: event.is_recurring ?? false,
      interval_type: event.interval_type || "daily",
    };
    
    const { error } = await supabase.from("calendar_events").insert([newEvent]);
    if (!error) {
      setEvents([...events, newEvent]);
    }
    return newEvent;
  };

  return { events, isLoaded, addEvent };
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  memory_type: string;
  timestamp: string;
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadMemories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      if (data) {
        setMemories(data);
        console.log("📡 Loaded memories:", data.length);
      }
    } catch (err) {
      console.error("Memory load error:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { loadMemories(); }, [loadMemories]);

  const addMemory = async (memory: Partial<Memory>) => {
    const newMemory = {
      id: crypto.randomUUID(),
      title: memory.title || "New Memory",
      content: memory.content || "",
      memory_type: memory.memory_type || "daily",
      timestamp: new Date().toISOString(),
    };
    
    const { error } = await supabase.from("memories").insert([newMemory]);
    if (!error) {
      setMemories([newMemory, ...memories]);
    }
    return newMemory;
  };

  return { memories, isLoaded, addMemory };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  color: string;
  layer: string;
  avatar: string;
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("layer");

      if (error) throw error;
      if (data) {
        setMembers(data);
        console.log("📡 Loaded team:", data.length);
      }
    } catch (err) {
      console.error("Team load error:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  return { members, isLoaded };
}

export interface OfficeAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  agent_state: string;
  current_task: string;
  task_progress: number;
  zone: string;
  channel: string;
  last_activity: string;
}

export function useOffice() {
  const [agents, setAgents] = useState<OfficeAgent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadAgents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("office_agents")
        .select("*");

      if (error) throw error;
      if (data) {
        setAgents(data);
        console.log("📡 Loaded office:", data.length);
      }
    } catch (err) {
      console.error("Office load error:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  return { agents, isLoaded };
}
