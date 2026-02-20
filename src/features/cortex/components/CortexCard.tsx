"use client";

import { Loader2 } from "lucide-react";
import type { CortexItem } from "@/features/cortex/types";
import { SOURCE_TYPE_ICONS, CATEGORY_MAP, STATUS_CONFIG } from "./cortex-constants";

interface CortexCardProps {
  item: CortexItem;
  onClick: () => void;
}

export function CortexCard({ item, onClick }: CortexCardProps) {
  const Icon = SOURCE_TYPE_ICONS[item.source_type] ?? SOURCE_TYPE_ICONS.text;
  const category = item.ai_category ? CATEGORY_MAP[item.ai_category] : null;
  const statusCfg = STATUS_CONFIG[item.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-[#16181a] border border-[#272829] rounded-lg p-4 hover:border-[#3a3b3c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: category?.color ?? "#272829",
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#9aa0a6] shrink-0 mt-0.5" aria-hidden="true" />
        <h3 className="text-sm font-medium text-white truncate flex-1 min-w-0">
          {item.title}
        </h3>
        <span
          className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${statusCfg.dotClass}`}
          title={statusCfg.label}
        />
      </div>

      {/* AI Summary or processing state */}
      {item.ai_status === "processing" ? (
        <div className="flex items-center gap-2 mt-1">
          <Loader2 className="w-3 h-3 text-[#7c3aed] animate-spin" />
          <span className="text-xs text-[#9aa0a6]">Analyzing...</span>
        </div>
      ) : item.ai_status === "failed" ? (
        <p className="text-xs text-red-400 mt-1">Analysis failed</p>
      ) : item.ai_summary ? (
        <p className="text-xs text-[#9aa0a6] line-clamp-2 mt-1">{item.ai_summary}</p>
      ) : null}

      {/* Footer: category badge + sent indicator */}
      <div className="flex items-center gap-2 mt-3">
        {category && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            {category.label}
          </span>
        )}
        {item.is_sent_to_agent && (
          <span className="text-[10px] text-[#7c3aed] font-medium">Sent to Agent</span>
        )}
      </div>
    </button>
  );
}
