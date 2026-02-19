"use client";

import type { CalendarEvent } from "@/features/calendar/types";
import { Repeat } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  return (
    <article
      role="listitem"
      onClick={() => onEdit(event)}
      className="bg-[#16181a] border border-[#272829] rounded-lg p-2.5 cursor-pointer hover:border-[#3a3b3c] transition-colors border-l-4"
      style={{ borderLeftColor: event.color }}
    >
      <p className="text-xs font-semibold text-[#9aa0a6]">{event.time}</p>
      <p className="text-sm text-white leading-snug mt-0.5 line-clamp-2">{event.title}</p>

      {event.is_recurring && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#7c3aed]">
          <Repeat className="w-3 h-3" aria-hidden="true" />
          <span className="capitalize">{event.interval_type}</span>
        </div>
      )}
    </article>
  );
}
