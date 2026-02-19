"use client";

import { useState } from "react";
import type { ContentItem, ContentStage, ContentPlatform } from "@/features/content/types";
import { User, Bot } from "lucide-react";
import { LinkedDocsSection } from "@/shared/components/LinkedDocsSection";

interface ContentFormProps {
  defaultValues?: Partial<ContentItem>;
  onSubmit: (data: Partial<ContentItem>) => Promise<void>;
  submitLabel: string;
}

const STAGES: { value: ContentStage; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "script", label: "Script" },
  { value: "thumbnail", label: "Thumbnail" },
  { value: "filming", label: "Filming" },
  { value: "editing", label: "Editing" },
  { value: "published", label: "Published" },
];

const PLATFORMS: { value: ContentPlatform; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter" },
];

const selectClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#7c3aed] transition-colors";

const labelClassName = "text-xs font-medium text-[#9aa0a6] uppercase tracking-wider";

export function ContentForm({ defaultValues, onSubmit, submitLabel }: ContentFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [platform, setPlatform] = useState<ContentPlatform>(defaultValues?.platform ?? "youtube");
  const [stage, setStage] = useState<ContentStage>(defaultValues?.stage ?? "idea");
  const [assignee, setAssignee] = useState(defaultValues?.assignee ?? "carlos");
  const [script, setScript] = useState(defaultValues?.script ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !isSubmitting;
  const isAmigo = assignee === "amigo";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        platform,
        stage,
        assignee,
        script: script.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-title" className={labelClassName}>Title</label>
        <input
          id="content-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Video title..."
          autoFocus
          className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-description" className={labelClassName}>Description</label>
        <textarea
          id="content-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
          rows={2}
          className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 resize-y placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
      </div>

      {/* Platform + Stage row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-platform" className={labelClassName}>Platform</label>
          <select
            id="content-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
            className={selectClassName}
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-stage" className={labelClassName}>Stage</label>
          <select
            id="content-stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as ContentStage)}
            className={selectClassName}
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignee toggle */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Assignee</span>
        <button
          type="button"
          onClick={() => setAssignee(isAmigo ? "carlos" : "amigo")}
          className="inline-flex items-center gap-2 w-fit text-sm text-[#9aa0a6] bg-[#0f1113] border border-[#272829] rounded-lg px-3 py-2 hover:border-[#7c3aed] hover:text-white transition-colors"
          aria-label={`Toggle assignee (currently ${assignee})`}
        >
          {isAmigo ? (
            <Bot className="w-4 h-4 text-[#7c3aed]" aria-hidden="true" />
          ) : (
            <User className="w-4 h-4" aria-hidden="true" />
          )}
          {isAmigo ? "Amigo" : "Carlos"}
        </button>
      </div>

      {/* Script */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-script" className={labelClassName}>Script</label>
        <textarea
          id="content-script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Write the script here..."
          rows={5}
          className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 resize-y placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
      </div>

      {/* Attachments (edit mode only) */}
      {defaultValues?.id && (
        <LinkedDocsSection linkedType="content" linkedId={defaultValues.id} />
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
