"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Pencil,
  Trash2,
  Loader2,
  ZoomIn,
  Bot,
  User,
  Image,
  Film,
  GalleryHorizontal,
  Youtube,
  Instagram,
  Music2,
  Linkedin,
  Twitter,
} from "lucide-react";
import type { ContentItem, ContentPlatform, ContentType } from "@/features/content/types";
import type { ContentMediaItem } from "@/features/content/types";
import { useContentMedia } from "@/features/content/hooks/use-content-media";
import { STAGE_CONFIG } from "@/features/content/constants/content-constants";

// --- Config ---

const PLATFORM_CONFIG: Record<
  ContentPlatform,
  { label: string; Icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
  youtube: { label: "YouTube", Icon: Youtube, badgeClass: "bg-red-500/20 text-red-400 border-red-500/30" },
  instagram: { label: "Instagram", Icon: Instagram, badgeClass: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  tiktok: { label: "TikTok", Icon: Music2, badgeClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  linkedin: { label: "LinkedIn", Icon: Linkedin, badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  twitter: { label: "Twitter", Icon: Twitter, badgeClass: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

const TYPE_CONFIG: Record<
  ContentType,
  { label: string; Icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
  post: { label: "Post", Icon: Image, badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  reel: { label: "Reel", Icon: Film, badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  carousel: { label: "Carousel", Icon: GalleryHorizontal, badgeClass: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
};

// --- Props ---

interface ContentDetailModalProps {
  item: ContentItem;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

// --- Copyable field ---

function CopyableField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="p-1 rounded text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
          aria-label={`Copy ${label}`}
          title="Copy"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <p
        className={`text-sm whitespace-pre-wrap break-words ${
          mono ? "text-[#7c3aed]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// --- Main component ---

export function ContentDetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
}: ContentDetailModalProps) {
  const { media, isLoading, loadMedia } = useContentMedia();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);

  const contentType = item.content_type ?? "reel";
  const hasMedia = contentType === "carousel";
  const typeConfig = TYPE_CONFIG[contentType];
  const platformConfig = PLATFORM_CONFIG[item.platform];
  const stageConfig = STAGE_CONFIG[item.stage];

  useEffect(() => {
    if (hasMedia) loadMedia(item.id);
  }, [item.id, hasMedia, loadMedia]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (zoomedUrl) {
        if (e.key === "Escape") setZoomedUrl(null);
        return;
      }
      if (e.key === "Escape") onClose();
      if (hasMedia && e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(0, i - 1));
      if (hasMedia && e.key === "ArrowRight")
        setCurrentIndex((i) => Math.min(media.length - 1, i + 1));
    },
    [onClose, media.length, hasMedia, zoomedUrl]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDownloadAll() {
    for (const m of media) {
      const a = document.createElement("a");
      a.href = m.url;
      a.download = `slide-${m.position + 1}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function handleDownloadOne(m: ContentMediaItem) {
    const a = document.createElement("a");
    a.href = m.url;
    a.download = `slide-${m.position + 1}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const currentMedia: ContentMediaItem | undefined = media[currentIndex];
  const isAmigo = item.assignee === "amigo";

  // --- Sidebar content (shared between layouts) ---
  function renderSidebar() {
    return (
      <div className="flex flex-col gap-4">
        {/* Caption */}
        {item.caption && <CopyableField label="Caption" value={item.caption} />}

        {/* Hashtags */}
        {item.hashtags && <CopyableField label="Hashtags" value={item.hashtags} mono />}

        {/* Script (reel only) */}
        {contentType === "reel" && item.script && (
          <CopyableField label="Script" value={item.script} />
        )}

        {/* Posting Notes */}
        {item.posting_notes && (
          <CopyableField label="Posting Notes" value={item.posting_notes} />
        )}

        {/* Description */}
        {item.description && (
          <CopyableField label="Description" value={item.description} />
        )}

        {/* Metadata row */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#272829]">
          {/* Stage */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9aa0a6]">Stage</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
              <span className={`w-2 h-2 rounded-full ${stageConfig.color}`} />
              {stageConfig.label}
            </span>
          </div>

          {/* Platform */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9aa0a6]">Platform</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
              <platformConfig.Icon className="w-3.5 h-3.5" />
              {platformConfig.label}
            </span>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9aa0a6]">Assignee</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
              {isAmigo ? (
                <Bot className="w-3.5 h-3.5 text-[#7c3aed]" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              {isAmigo ? "Amigo" : "Carlos"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#272829]">
          {/* Download All (carousel only) */}
          {hasMedia && media.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#272829] text-white text-sm font-medium hover:bg-[#3a3b3c] transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download All ({media.length})
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 disabled:opacity-40 transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isDeleting ? "Deleting..." : "Delete Content"}
          </button>
        </div>
      </div>
    );
  }

  // --- Image gallery ---
  function renderGallery() {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[300px] bg-[#0b0c0e]">
          <Loader2 className="w-5 h-5 text-[#7c3aed] animate-spin" />
        </div>
      );
    }

    if (media.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[300px] bg-[#0b0c0e]">
          <p className="text-sm text-[#9aa0a6]">No images uploaded yet</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[300px] bg-[#0b0c0e]">
        <div className="relative w-full flex-1 flex items-center justify-center">
          {/* Prev arrow */}
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Image */}
          {currentMedia && (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt_text || `Slide ${currentIndex + 1}`}
              className="max-h-[55vh] max-w-full object-contain rounded-lg cursor-zoom-in"
              onClick={() => setZoomedUrl(currentMedia.url)}
            />
          )}

          {/* Next arrow */}
          {currentIndex < media.length - 1 && (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Controls: counter + dots + image actions */}
        <div className="mt-3 flex flex-col items-center gap-2">
          <span className="text-xs text-[#9aa0a6] font-medium">
            {currentIndex + 1} / {media.length}
          </span>
          <div className="flex gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? "bg-[#7c3aed]" : "bg-[#3a3b3c] hover:bg-[#555]"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          {/* Per-image actions */}
          {currentMedia && (
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setZoomedUrl(currentMedia.url)}
                className="inline-flex items-center gap-1 text-xs text-[#9aa0a6] hover:text-white bg-[#272829] rounded-md px-2 py-1 transition-colors"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-3 h-3" />
                Zoom
              </button>
              <button
                type="button"
                onClick={() => handleDownloadOne(currentMedia)}
                className="inline-flex items-center gap-1 text-xs text-[#9aa0a6] hover:text-white bg-[#272829] rounded-md px-2 py-1 transition-colors"
                aria-label="Download image"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-detail-title"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-[#16181a] rounded-2xl border border-[#272829] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#272829]">
            {/* Type badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 border ${typeConfig.badgeClass}`}
            >
              <typeConfig.Icon className="w-3 h-3" aria-hidden="true" />
              {typeConfig.label}
            </span>

            {/* Platform badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 border ${platformConfig.badgeClass}`}
            >
              <platformConfig.Icon className="w-3 h-3" aria-hidden="true" />
              {platformConfig.label}
            </span>

            {/* Stage badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#272829] rounded-md px-2 py-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${stageConfig.color}`} />
              {stageConfig.label}
            </span>

            {/* Title */}
            <h2
              id="content-detail-title"
              className="flex-1 text-sm font-semibold text-white truncate ml-2"
            >
              {item.title}
            </h2>

            {/* Edit button */}
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
              aria-label="Edit"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          {hasMedia ? (
            // Two-column: gallery + sidebar
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {renderGallery()}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#272829] p-4 overflow-y-auto">
                {renderSidebar()}
              </div>
            </div>
          ) : (
            // Single column for post/reel
            <div className="flex-1 overflow-y-auto p-4">{renderSidebar()}</div>
          )}
        </div>
      </div>

      {/* Zoom overlay */}
      {zoomedUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomedUrl(null)}
        >
          <img
            src={zoomedUrl}
            alt="Zoomed"
            className="max-h-[95vh] max-w-[95vw] object-contain"
          />
          <button
            type="button"
            onClick={() => setZoomedUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Close zoom"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}
