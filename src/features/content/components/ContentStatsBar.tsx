"use client";

import type { ContentStage } from "@/features/content/types";
import { STAGE_CONFIG } from "./ContentColumn";

const STAGES: ContentStage[] = ["idea", "script", "thumbnail", "filming", "editing", "published"];

interface ContentStatsBarProps {
  counts: Record<ContentStage, number>;
}

export function ContentStatsBar({ counts }: ContentStatsBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
      {STAGES.map((stage) => {
        const { label, color } = STAGE_CONFIG[stage];
        return (
          <div
            key={stage}
            className="flex-shrink-0 bg-[#16181a] border border-[#272829] rounded-xl px-4 py-3 text-center min-w-[90px]"
          >
            <p className="text-2xl font-bold text-white">{counts[stage]}</p>
            <p className="text-xs text-[#9aa0a6] mt-0.5">{label}</p>
            <span className={`mt-1 block w-2 h-2 rounded-full mx-auto ${color}`} aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}
