"use client";

import type { ContentStage } from "@/features/content/types";

interface ContentColumnProps {
  stage: ContentStage;
  count: number;
  children: React.ReactNode;
}

export const STAGE_CONFIG: Record<ContentStage, { label: string; color: string }> = {
  idea:      { label: "Idea",      color: "bg-yellow-400" },
  script:    { label: "Script",    color: "bg-blue-400" },
  thumbnail: { label: "Thumbnail", color: "bg-purple-400" },
  filming:   { label: "Filming",   color: "bg-pink-400" },
  editing:   { label: "Editing",   color: "bg-orange-400" },
  published: { label: "Published", color: "bg-green-400" },
};

export function ContentColumn({ stage, count, children }: ContentColumnProps) {
  const { label, color } = STAGE_CONFIG[stage];

  return (
    <div className="flex flex-col w-72 min-h-[200px]">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white tracking-wide">{label}</h2>
        <span
          className="ml-auto text-xs font-medium text-[#9aa0a6] bg-[#272829] rounded-full px-2 py-0.5 min-w-[22px] text-center"
          aria-label={`${count} items`}
        >
          {count}
        </span>
      </div>

      <div className="flex flex-col space-y-3" role="list" aria-label={`${label} content`}>
        {children}
      </div>
    </div>
  );
}
