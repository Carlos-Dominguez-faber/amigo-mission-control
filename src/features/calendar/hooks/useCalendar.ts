"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { CalendarEvent } from "@/features/calendar/types";

interface UseCalendarReturn {
  events: CalendarEvent[];
  isLoaded: boolean;
  addEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useCalendar(): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents((data as CalendarEvent[]) ?? []);
    } catch (err) {
      console.error("[useCalendar] Failed to load calendar events:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function addEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const payload = {
      title: event.title ?? "",
      time: event.time ?? "00:00",
      day_of_week: event.day_of_week ?? 0,
      color: event.color ?? "#3b82f6",
      is_recurring: event.is_recurring ?? false,
      interval_type: event.interval_type ?? "weekly",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("calendar_events")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    const created = data as CalendarEvent;
    setEvents((prev) => [created, ...prev]);
    return created;
  }

  async function updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    const { error } = await supabase
      .from("calendar_events")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }

  async function deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) throw error;

    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return {
    events,
    isLoaded,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
