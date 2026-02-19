"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useCalendar } from "@/features/calendar/hooks/useCalendar";
import type { CalendarEvent } from "@/features/calendar/types";
import { DayColumn } from "./DayColumn";
import { EventCard } from "./EventCard";
import { EventModal } from "./EventModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add"; dayOfWeek?: number }
  | { mode: "edit"; event: CalendarEvent };

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun

export default function CalendarBoard() {
  const { events, isLoaded, addEvent, updateEvent, deleteEvent } = useCalendar();
  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });

  const today = new Date().getDay(); // 0=Sun ... 6=Sat

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    for (const day of DAYS_ORDER) {
      map[day] = events
        .filter((e) => e.day_of_week === day || e.day_of_week === -1)
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [events]);

  async function handleAdd(data: Partial<CalendarEvent>) {
    await addEvent(data);
  }

  async function handleEdit(data: Partial<CalendarEvent>) {
    if (modalState.mode !== "edit") return;
    await updateEvent(modalState.event.id, data);
  }

  async function handleDelete() {
    if (modalState.mode !== "edit") return;
    await deleteEvent(modalState.event.id);
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading calendar...</p>
      </div>
    );
  }

  return (
    <section aria-label="Weekly calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-white">Weekly Schedule</h2>
        <button
          type="button"
          onClick={() => setModalState({ mode: "add" })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Event
        </button>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-white">No events yet</p>
          <p className="text-xs text-[#9aa0a6]">
            Click &quot;New Event&quot; to add your first schedule item.
          </p>
        </div>
      )}

      {/* Weekly grid (always show columns, even when empty) */}
      <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-3 min-w-max">
          {DAYS_ORDER.map((dayIndex) => (
            <DayColumn
              key={dayIndex}
              dayIndex={dayIndex}
              isToday={dayIndex === today}
              onAddClick={() => setModalState({ mode: "add", dayOfWeek: dayIndex })}
            >
              {(eventsByDay[dayIndex] ?? []).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => setModalState({ mode: "edit", event })}
                />
              ))}
            </DayColumn>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalState.mode === "add" && (
        <EventModal
          mode="add"
          defaultDayOfWeek={modalState.dayOfWeek}
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleAdd}
        />
      )}

      {modalState.mode === "edit" && (
        <EventModal
          mode="edit"
          event={modalState.event}
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
