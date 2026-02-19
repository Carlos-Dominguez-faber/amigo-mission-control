"use client";

import type { CortexStatus, CortexCategory } from "@/features/cortex/types";
import { CATEGORIES, STATUS_CONFIG } from "./cortex-constants";

interface CortexFiltersProps {
  statusFilter: CortexStatus | null;
  categoryFilter: CortexCategory | null;
  onStatusChange: (f: CortexStatus | null) => void;
  onCategoryChange: (f: CortexCategory | null) => void;
}

const STATUS_OPTIONS: { value: CortexStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "implemented", label: "Done" },
];

export function CortexFilters({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}: CortexFiltersProps) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.value;
          const cfg = opt.value ? STATUS_CONFIG[opt.value] : null;
          return (
            <button
              key={opt.value ?? "all"}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={[
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                isActive
                  ? "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30"
                  : "bg-[#16181a] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
              ].join(" ")}
            >
              {cfg && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dotClass}`}
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={[
            "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
            categoryFilter === null
              ? "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30"
              : "bg-[#16181a] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
          ].join(" ")}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value as CortexCategory)}
              className={[
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                isActive
                  ? "border-current/30"
                  : "bg-[#16181a] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
              ].join(" ")}
              style={
                isActive
                  ? { backgroundColor: `${cat.color}20`, color: cat.color }
                  : undefined
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
