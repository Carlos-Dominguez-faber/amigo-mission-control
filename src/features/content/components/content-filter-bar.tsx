"use client";

import type { ContentFilter } from "@/features/content/constants/content-constants";
import { CONTENT_FILTERS } from "@/features/content/constants/content-constants";

interface ContentFilterBarProps {
  activeFilter: ContentFilter;
  counts: Record<ContentFilter, number>;
  onFilterChange: (filter: ContentFilter) => void;
}

export function ContentFilterBar({ activeFilter, counts, onFilterChange }: ContentFilterBarProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {CONTENT_FILTERS.map(({ value, label }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#7c3aed] text-white"
                : "bg-[#16181a] text-[#9aa0a6] border border-[#272829] hover:text-white hover:border-[#3a3b3c]"
            }`}
          >
            {label}
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                isActive ? "bg-white/20" : "bg-[#272829]"
              }`}
            >
              {counts[value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
