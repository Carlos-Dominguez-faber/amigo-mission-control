"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/features/calendar/types";
import { LinkedDocsSection } from "@/shared/components/LinkedDocsSection";

interface EventFormProps {
  defaultValues?: Partial<CalendarEvent>;
  onSubmit: (data: Partial<CalendarEvent>) => Promise<void>;
  submitLabel: string;
}

const DAY_OPTIONS = [
  { value: -1, label: "Every day" },
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const COLORS = [
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#22c55e", label: "Green" },
  { hex: "#a855f7", label: "Purple" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#eab308", label: "Yellow" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#f97316", label: "Orange" },
];

const labelClassName = "text-xs font-medium text-[#9aa0a6] uppercase tracking-wider";

const selectClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#7c3aed] transition-colors";

export function EventForm({ defaultValues, onSubmit, submitLabel }: EventFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [time, setTime] = useState(defaultValues?.time ?? "09:00");
  const [dayOfWeek, setDayOfWeek] = useState(defaultValues?.day_of_week ?? 1);
  const [color, setColor] = useState(defaultValues?.color ?? "#3b82f6");
  const [isRecurring, setIsRecurring] = useState(defaultValues?.is_recurring ?? false);
  const [intervalType, setIntervalType] = useState(defaultValues?.interval_type ?? "weekly");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        time,
        day_of_week: dayOfWeek,
        color,
        is_recurring: isRecurring,
        interval_type: isRecurring ? intervalType : "weekly",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-title" className={labelClassName}>Title</label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          autoFocus
          className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
      </div>

      {/* Time + Day row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="event-time" className={labelClassName}>Time</label>
          <input
            id="event-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#7c3aed] transition-colors [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="event-day" className={labelClassName}>Day</label>
          <select
            id="event-day"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className={selectClassName}
          >
            {DAY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Color pills */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Color</span>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              title={c.label}
              aria-label={c.label}
              aria-pressed={color === c.hex}
              className={[
                "w-7 h-7 rounded-full transition-all",
                color === c.hex
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#16181a] scale-110"
                  : "hover:scale-110",
              ].join(" ")}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Recurring toggle */}
      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded border-[#272829] bg-[#0f1113] text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-offset-0"
          />
          <span className="text-sm text-white">Recurring event</span>
        </label>

        {isRecurring && (
          <select
            value={intervalType}
            onChange={(e) => setIntervalType(e.target.value)}
            className={selectClassName}
            aria-label="Recurrence interval"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>

      {/* Attachments (edit mode only) */}
      {defaultValues?.id && (
        <LinkedDocsSection linkedType="calendar" linkedId={defaultValues.id} label="Resources" />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16181a]"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
