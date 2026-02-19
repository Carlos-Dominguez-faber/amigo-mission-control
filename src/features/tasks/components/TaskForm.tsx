"use client";

import { useState } from "react";
import type { Assignee, Priority } from "@/features/tasks/types";
import { Plus, User, Bot } from "lucide-react";

interface TaskFormProps {
  onSubmit: (
    title: string,
    assignee: Assignee,
    priority: Priority,
    description?: string
  ) => Promise<unknown>;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Med" },
  { value: "high", label: "High" },
];

const priorityActiveClass: Record<Priority, string> = {
  low: "bg-[#9aa0a6]/20 text-[#9aa0a6] border-[#9aa0a6]/40",
  medium: "bg-yellow-400/20 text-yellow-400 border-yellow-400/40",
  high: "bg-red-400/20 text-red-400 border-red-400/40",
};

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<Assignee>("carlos");
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = title.trim() === "" || isSubmitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDisabled) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        title.trim(),
        assignee,
        priority,
        description.trim() || undefined
      );
      // Reset form after successful submit
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignee("carlos");
      setShowDetails(false);
    } catch (err) {
      console.error("[TaskForm] Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleAssignee() {
    setAssignee((prev) => (prev === "carlos" ? "amigo" : "carlos"));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#16181a]/50 border border-[#272829] rounded-xl p-4"
      aria-label="Add new task"
    >
      {/* Row 1: title + priority pills + assignee + submit */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          required
          className="flex-1 min-w-0 bg-[#16181a] border border-[#272829] rounded-lg text-white text-sm px-3 py-2 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
          aria-label="Task title"
          disabled={isSubmitting}
        />

        {/* Priority pills */}
        <div className="flex items-center gap-1" role="group" aria-label="Priority">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPriority(option.value)}
              disabled={isSubmitting}
              aria-pressed={priority === option.value}
              className={[
                "text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors",
                priority === option.value
                  ? priorityActiveClass[option.value]
                  : "bg-[#272829] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Assignee toggle */}
        <button
          type="button"
          onClick={toggleAssignee}
          disabled={isSubmitting}
          className={[
            "p-2 rounded-lg border transition-colors",
            assignee === "amigo"
              ? "bg-[#7c3aed]/20 border-[#7c3aed]/40 text-[#7c3aed]"
              : "bg-[#272829] border-[#272829] text-[#9aa0a6] hover:border-[#3a3b3c]",
          ].join(" ")}
          aria-label={`Assignee: ${assignee === "amigo" ? "Amigo" : "Carlos"}`}
          title={`Assignee: ${assignee === "amigo" ? "Amigo" : "Carlos"}`}
        >
          {assignee === "amigo" ? (
            <Bot className="w-4 h-4" aria-hidden="true" />
          ) : (
            <User className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={isDisabled}
          className="p-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
          aria-label="Add task"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Add details toggle */}
      <button
        type="button"
        onClick={() => setShowDetails((prev) => !prev)}
        disabled={isSubmitting}
        className="mt-2 text-xs text-[#9aa0a6] hover:text-white transition-colors focus-visible:outline-none focus-visible:underline"
      >
        {showDetails ? "Hide details" : "Add details"}
      </button>

      {/* Row 2: description textarea (optional) */}
      {showDetails && (
        <div className="mt-3">
          <label htmlFor="task-form-description" className="sr-only">
            Description
          </label>
          <textarea
            id="task-form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={3}
            disabled={isSubmitting}
            className="w-full bg-[#16181a] border border-[#272829] rounded-lg text-white text-sm px-3 py-2 resize-y placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
          />
        </div>
      )}
    </form>
  );
}
