"use client";

import { useState, useEffect, useMemo } from "react";
import type { ContentItem, ContentStage, ContentPlatform, ContentType } from "@/features/content/types";
import { STAGES_BY_TYPE, STAGE_CONFIG } from "@/features/content/constants/content-constants";
import { useContentMedia } from "@/features/content/hooks/use-content-media";
import { CarouselMediaUpload } from "./carousel-media-upload";
import { User, Bot } from "lucide-react";
import { LinkedDocsSection } from "@/shared/components/LinkedDocsSection";

interface ContentFormProps {
  defaultValues?: Partial<ContentItem>;
  onSubmit: (data: Partial<ContentItem>) => Promise<void>;
  submitLabel: string;
}

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

const inputClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 resize-y placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors";

export function ContentForm({ defaultValues, onSubmit, submitLabel }: ContentFormProps) {
  const [contentType, setContentType] = useState<ContentType>(defaultValues?.content_type ?? "reel");
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [platform, setPlatform] = useState<ContentPlatform>(defaultValues?.platform ?? "instagram");
  const [stage, setStage] = useState<ContentStage>(defaultValues?.stage ?? "idea");
  const [assignee, setAssignee] = useState(defaultValues?.assignee ?? "carlos");
  const [script, setScript] = useState(defaultValues?.script ?? "");
  const [caption, setCaption] = useState(defaultValues?.caption ?? "");
  const [hashtags, setHashtags] = useState(defaultValues?.hashtags ?? "");
  const [postingNotes, setPostingNotes] = useState(defaultValues?.posting_notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { media, isLoading: mediaLoading, loadMedia, addMedia, removeMedia, reorder } = useContentMedia();

  // Load media when editing a carousel
  useEffect(() => {
    if (defaultValues?.id && defaultValues?.content_type === "carousel") {
      loadMedia(defaultValues.id);
    }
  }, [defaultValues?.id, defaultValues?.content_type, loadMedia]);

  // Available stages for the selected content type
  const availableStages = useMemo(() => {
    return STAGES_BY_TYPE[contentType].map((s) => ({
      value: s,
      label: STAGE_CONFIG[s].label,
    }));
  }, [contentType]);

  // Reset stage when content type changes (only if current stage is invalid for new type)
  useEffect(() => {
    const validStages = STAGES_BY_TYPE[contentType];
    if (!validStages.includes(stage)) {
      setStage("idea");
    }
  }, [contentType, stage]);

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
        content_type: contentType,
        platform,
        stage,
        assignee,
        script: contentType === "reel" ? (script.trim() || undefined) : undefined,
        caption: contentType !== "reel" ? (caption.trim() || undefined) : undefined,
        hashtags: hashtags.trim() || undefined,
        posting_notes: postingNotes.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMediaUpload(files: File[]) {
    if (!defaultValues?.id) return;
    for (const file of files) {
      await addMedia(defaultValues.id, file);
    }
  }

  async function handleMediaReorder(orderedIds: string[]) {
    if (!defaultValues?.id) return;
    await reorder(defaultValues.id, orderedIds);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Content Type selector */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Type</span>
        <div className="flex gap-2">
          {(["post", "reel", "carousel"] as ContentType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setContentType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                contentType === t
                  ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                  : "bg-[#0f1113] text-[#9aa0a6] border-[#272829] hover:text-white hover:border-[#3a3b3c]"
              }`}
            >
              {t === "post" ? "Post" : t === "reel" ? "Reel" : "Carousel"}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-title" className={labelClassName}>Title</label>
        <input
          id="content-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Content title..."
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
          className={inputClassName}
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
            {availableStages.map((s) => (
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

      {/* Script (Reel only) */}
      {contentType === "reel" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-script" className={labelClassName}>Script</label>
          <textarea
            id="content-script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write the script here..."
            rows={5}
            className={inputClassName}
          />
        </div>
      )}

      {/* Caption (Post + Carousel) */}
      {contentType !== "reel" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-caption" className={labelClassName}>Caption</label>
          <textarea
            id="content-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write the caption..."
            rows={3}
            className={inputClassName}
          />
        </div>
      )}

      {/* Hashtags (all types) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-hashtags" className={labelClassName}>Hashtags</label>
        <input
          id="content-hashtags"
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#hashtag1 #hashtag2 #hashtag3"
          className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
      </div>

      {/* Posting Notes (all types) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content-posting-notes" className={labelClassName}>Posting Notes</label>
        <textarea
          id="content-posting-notes"
          value={postingNotes}
          onChange={(e) => setPostingNotes(e.target.value)}
          placeholder="Best time to post, tags, reminders..."
          rows={2}
          className={inputClassName}
        />
      </div>

      {/* Carousel Media Upload (edit mode only, carousel only) */}
      {contentType === "carousel" && defaultValues?.id && (
        <CarouselMediaUpload
          media={media}
          isLoading={mediaLoading}
          onUpload={handleMediaUpload}
          onRemove={removeMedia}
          onReorder={handleMediaReorder}
        />
      )}

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
