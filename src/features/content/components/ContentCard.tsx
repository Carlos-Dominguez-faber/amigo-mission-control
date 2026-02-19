"use client";

import type { ContentItem, ContentPlatform } from "@/features/content/types";
import { Youtube, Instagram, Music2, Linkedin, Twitter, User, Bot, FileText } from "lucide-react";

interface ContentCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
}

const PLATFORM_CONFIG: Record<ContentPlatform, {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
}> = {
  youtube:   { label: "YouTube",   Icon: Youtube,   badgeClass: "bg-red-500/20 text-red-400 border-red-500/30" },
  instagram: { label: "Instagram", Icon: Instagram, badgeClass: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  tiktok:    { label: "TikTok",    Icon: Music2,    badgeClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  linkedin:  { label: "LinkedIn",  Icon: Linkedin,  badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  twitter:   { label: "Twitter",   Icon: Twitter,   badgeClass: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

export function ContentCard({ item, onEdit }: ContentCardProps) {
  const platform = PLATFORM_CONFIG[item.platform];
  const isAmigo = item.assignee === "amigo";

  return (
    <article
      role="listitem"
      onClick={() => onEdit(item)}
      className="bg-[#16181a] border border-[#272829] rounded-xl p-3 cursor-pointer hover:border-[#3a3b3c] transition-colors"
    >
      {/* Top row: platform badge + assignee icon */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2 py-0.5 border ${platform.badgeClass}`}
        >
          <platform.Icon className="w-3 h-3" aria-hidden="true" />
          {platform.label}
        </span>

        <span
          className="w-6 h-6 rounded-full flex items-center justify-center bg-[#272829]"
          title={isAmigo ? "Amigo" : "Carlos"}
          aria-label={`Assigned to ${item.assignee}`}
        >
          {isAmigo ? (
            <Bot className="w-3.5 h-3.5 text-[#7c3aed]" aria-hidden="true" />
          ) : (
            <User className="w-3.5 h-3.5 text-[#9aa0a6]" aria-hidden="true" />
          )}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-white leading-snug line-clamp-2">
        {item.title}
      </p>

      {/* Description preview */}
      {item.description && (
        <p className="mt-1 text-xs text-[#9aa0a6] line-clamp-1">{item.description}</p>
      )}

      {/* Script indicator */}
      {item.script && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#9aa0a6] bg-[#272829] rounded-md px-2 py-0.5">
          <FileText className="w-3 h-3" aria-hidden="true" />
          <span>Script</span>
        </div>
      )}
    </article>
  );
}
