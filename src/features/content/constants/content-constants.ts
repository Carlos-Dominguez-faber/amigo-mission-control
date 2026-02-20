import type { ContentType, ContentStage } from "@/features/content/types";

// --- Stages per content type ---

export const STAGES_BY_TYPE: Record<ContentType, ContentStage[]> = {
  post: ["idea", "design", "copy", "review", "published"],
  reel: ["idea", "script", "filming", "editing", "review", "published"],
  carousel: ["idea", "research", "design", "copy", "review", "published"],
};

// --- Unified stages for "All" filter ---

export type UnifiedStage = "idea" | "in_progress" | "review" | "published";

export const UNIFIED_STAGES: UnifiedStage[] = ["idea", "in_progress", "review", "published"];

export const UNIFIED_STAGE_MAP: Record<ContentStage, UnifiedStage> = {
  idea: "idea",
  script: "in_progress",
  filming: "in_progress",
  editing: "in_progress",
  design: "in_progress",
  copy: "in_progress",
  research: "in_progress",
  review: "review",
  published: "published",
};

export const UNIFIED_STAGE_CONFIG: Record<UnifiedStage, { label: string; color: string }> = {
  idea: { label: "Idea", color: "bg-yellow-400" },
  in_progress: { label: "In Progress", color: "bg-blue-400" },
  review: { label: "Review", color: "bg-orange-400" },
  published: { label: "Published", color: "bg-green-400" },
};

// --- Stage config (colors/labels for individual stages) ---

export const STAGE_CONFIG: Record<ContentStage, { label: string; color: string }> = {
  idea: { label: "Idea", color: "bg-yellow-400" },
  script: { label: "Script", color: "bg-blue-400" },
  filming: { label: "Filming", color: "bg-pink-400" },
  editing: { label: "Editing", color: "bg-orange-400" },
  design: { label: "Design", color: "bg-purple-400" },
  copy: { label: "Copy", color: "bg-teal-400" },
  research: { label: "Research", color: "bg-indigo-400" },
  review: { label: "Review", color: "bg-amber-400" },
  published: { label: "Published", color: "bg-green-400" },
};

// --- Content type config ---

export const CONTENT_TYPE_CONFIG: Record<ContentType, {
  label: string;
  badgeClass: string;
}> = {
  post: { label: "Post", badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  reel: { label: "Reel", badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  carousel: { label: "Carousel", badgeClass: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
};

// --- Filter types ---

export type ContentFilter = "all" | ContentType;

export const CONTENT_FILTERS: { value: ContentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "post", label: "Posts" },
  { value: "reel", label: "Reels" },
  { value: "carousel", label: "Carousels" },
];
