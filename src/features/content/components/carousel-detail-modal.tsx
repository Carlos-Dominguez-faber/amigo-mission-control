"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Copy, Check, Download } from "lucide-react";
import type { ContentItem } from "@/features/content/types";
import type { ContentMediaItem } from "@/features/content/types";
import { useContentMedia } from "@/features/content/hooks/use-content-media";

interface CarouselDetailModalProps {
  item: ContentItem;
  onClose: () => void;
}

export function CarouselDetailModal({ item, onClose }: CarouselDetailModalProps) {
  const { media, isLoading, loadMedia } = useContentMedia();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadMedia(item.id);
  }, [item.id, loadMedia]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setCurrentIndex((i) => Math.min(media.length - 1, i + 1));
    },
    [onClose, media.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  async function copyToClipboard(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API not available
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

  const currentMedia: ContentMediaItem | undefined = media[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="carousel-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#16181a] rounded-2xl border border-[#272829] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272829]">
          <h2 id="carousel-modal-title" className="text-sm font-semibold text-white truncate">
            {item.title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body: image + sidebar */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Image area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[300px] bg-[#0b0c0e]">
            {isLoading && (
              <p className="text-sm text-[#9aa0a6]">Loading images...</p>
            )}

            {!isLoading && media.length === 0 && (
              <p className="text-sm text-[#9aa0a6]">No images uploaded yet</p>
            )}

            {!isLoading && currentMedia && (
              <>
                <div className="relative w-full flex-1 flex items-center justify-center">
                  {/* Prev arrow */}
                  {currentIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => i - 1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Image */}
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt_text || `Slide ${currentIndex + 1}`}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg"
                  />

                  {/* Next arrow */}
                  {currentIndex < media.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Counter + dots */}
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
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#272829] p-4 overflow-y-auto flex flex-col gap-4">
            {/* Caption */}
            {item.caption && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">Caption</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.caption!, "caption")}
                    className="p-1 rounded text-[#9aa0a6] hover:text-white transition-colors"
                    aria-label="Copy caption"
                  >
                    {copiedField === "caption" ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-white whitespace-pre-wrap">{item.caption}</p>
              </div>
            )}

            {/* Hashtags */}
            {item.hashtags && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">Hashtags</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.hashtags!, "hashtags")}
                    className="p-1 rounded text-[#9aa0a6] hover:text-white transition-colors"
                    aria-label="Copy hashtags"
                  >
                    {copiedField === "hashtags" ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-[#7c3aed] break-words">{item.hashtags}</p>
              </div>
            )}

            {/* Posting Notes */}
            {item.posting_notes && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">Posting Notes</span>
                <p className="text-sm text-white whitespace-pre-wrap">{item.posting_notes}</p>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">Description</span>
                <p className="text-sm text-[#9aa0a6] whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {/* Download All */}
            {media.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#272829] text-white text-sm font-medium hover:bg-[#3a3b3c] transition-colors"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download All ({media.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
