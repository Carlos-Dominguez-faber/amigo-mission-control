"use client";

import { useState } from "react";
import type { Memory } from "@/features/memory/types";

interface MemoryFormProps {
  defaultValues?: Partial<Memory>;
  onSubmit: (data: Partial<Memory>) => Promise<void>;
  submitLabel: string;
}

const MEMORY_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "decision", label: "Decision" },
  { value: "learning", label: "Learning" },
  { value: "context", label: "Context" },
  { value: "error", label: "Error" },
  { value: "idea", label: "Idea" },
];

const labelClassName = "text-xs font-medium text-[#9aa0a6] uppercase tracking-wider";

const inputClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors";

const selectClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#7c3aed] transition-colors";

export function MemoryForm({ defaultValues, onSubmit, submitLabel }: MemoryFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [memoryType, setMemoryType] = useState(defaultValues?.memory_type ?? "daily");
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        memory_type: memoryType,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="memory-title" className={labelClassName}>Title</label>
        <input
          id="memory-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memory title..."
          autoFocus
          className={inputClassName}
        />
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="memory-type" className={labelClassName}>Type</label>
        <select
          id="memory-type"
          value={memoryType}
          onChange={(e) => setMemoryType(e.target.value)}
          className={selectClassName}
        >
          {MEMORY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="memory-content" className={labelClassName}>Content</label>
        <textarea
          id="memory-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your memory..."
          rows={6}
          className={`${inputClassName} resize-none`}
        />
      </div>

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
