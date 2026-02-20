"use client";

import type { ContentItem, ContentPlatform } from "@/features/content/types";
import { CONTENT_TYPE_CONFIG } from "@/features/content/constants/content-constants";
import { Youtube, Instagram, Music2, Linkedin, Twitter, User, Bot, FileText, Image, Film, GalleryHorizontal } from "lucide-react";

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

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  post: Image,
  reel: Film,
  carousel: GalleryHorizontal,
};

export function ContentCard({ item, onEdit }: ContentCardProps) {
  const platform = PLATFORM_CONFIG[item.platform];
  const isAmigo = item.assignee === "amigo";
  const contentType = item.content_type ?? "reel";
  const typeConfig = CONTENT_TYPE_CONFIG[contentType];
  const TypeIcon = TYPE_ICON[contentType] ?? Film;

  // Show caption for post/carousel, description for reel
  const preview = contentType === "reel" ? item.description : (item.caption || item.description);

  return (
    <article
      role="listitem"
      onClick={() => onEdit(item)}
      className="bg-[#16181a] border border-[#272829] rounded-xl p-3 cursor-pointer hover:border-[#3a3b3c] transition-colors"
    >
      {/* Top row: type badge + platform badge + assignee icon */}
      <div className="flex items-center gap-2 mb-2">
        {/* Content type badge */}
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 border ${typeConfig.badgeClass}`}
        >
          <TypeIcon className="w-3 h-3" aria-hidden="true" />
          {typeConfig.label}
        </span>

        {/* Platform badge */}
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 border ${platform.badgeClass}`}
        >
          <platform.Icon className="w-3 h-3" aria-hidden="true" />
          {platform.label}
        </span>

        {/* Assignee icon (pushed right) */}
        <span
          className="ml-auto w-6 h-6 rounded-full flex items-center justify-center bg-[#272829]"
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

      {/* Preview text */}
      {preview && (
        <p className="mt-1 text-xs text-[#9aa0a6] line-clamp-1">{preview}</p>
      )}

      {/* Script indicator (reels only) */}
      {contentType === "reel" && item.script && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#9aa0a6] bg-[#272829] rounded-md px-2 py-0.5">
          <FileText className="w-3 h-3" aria-hidden="true" />
          <span>Script</span>
        </div>
      )}
    </article>
  );
}
