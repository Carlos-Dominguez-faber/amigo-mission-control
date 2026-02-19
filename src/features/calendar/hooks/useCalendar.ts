"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { CalendarEvent } from "@/features/calendar/types";

interface UseCalendarReturn {
  events: CalendarEvent[];
  isLoaded: boolean;
  addEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
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

  return {
    events,
    isLoaded,
    addEvent,
  };
}
