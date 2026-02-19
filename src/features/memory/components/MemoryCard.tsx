"use client";

import type { Memory } from "@/features/memory/types";

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
}

export const MEMORY_TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  daily:    { label: "Daily",    badgeClass: "bg-blue-500/20 text-blue-400" },
  decision: { label: "Decision", badgeClass: "bg-purple-500/20 text-purple-400" },
  learning: { label: "Learning", badgeClass: "bg-green-500/20 text-green-400" },
  context:  { label: "Context",  badgeClass: "bg-yellow-500/20 text-yellow-400" },
  error:    { label: "Error",    badgeClass: "bg-red-500/20 text-red-400" },
  idea:     { label: "Idea",     badgeClass: "bg-cyan-500/20 text-cyan-400" },
};

const DEFAULT_BADGE = { label: "", badgeClass: "bg-[#272829] text-[#9aa0a6]" };

function formatRelativeDate(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function MemoryCard({ memory, onEdit }: MemoryCardProps) {
  const config = MEMORY_TYPE_CONFIG[memory.memory_type] ?? {
    ...DEFAULT_BADGE,
    label: memory.memory_type,
  };

  return (
    <article
      role="listitem"
      onClick={() => onEdit(memory)}
      className="bg-[#16181a] border border-[#272829] rounded-lg p-4 cursor-pointer hover:border-[#3a3b3c] transition-colors"
    >
      {/* Header: badge + date */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeClass}`}>
          {config.label}
        </span>
        <span className="text-xs text-[#9aa0a6]">{formatRelativeDate(memory.timestamp)}</span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-white leading-snug">{memory.title}</p>

      {/* Content preview */}
      {memory.content && (
        <p className="text-sm text-[#9aa0a6] mt-1.5 line-clamp-3 leading-relaxed">
          {memory.content}
        </p>
      )}
    </article>
  );
}
