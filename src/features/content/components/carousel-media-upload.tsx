"use client";

import { useRef, useState } from "react";
import { Upload, X, ChevronUp, ChevronDown } from "lucide-react";
import type { ContentMediaItem } from "@/features/content/types";

interface CarouselMediaUploadProps {
  media: ContentMediaItem[];
  isLoading: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (item: ContentMediaItem) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export function CarouselMediaUpload({
  media,
  isLoading,
  onUpload,
  onRemove,
  onReorder,
}: CarouselMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await onUpload(Array.from(files));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= media.length) return;

    const ids = media.map((m) => m.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    onReorder(ids);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
        Carousel Images ({media.length})
      </span>

      {/* Thumbnail grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item, i) => (
            <div
              key={item.id}
              className="relative group bg-[#0f1113] border border-[#272829] rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={item.url}
                alt={item.alt_text || `Slide ${i + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Position number */}
              <span className="absolute top-1 left-1 w-5 h-5 bg-black/70 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {i + 1}
              </span>

              {/* Action buttons (visible on hover) */}
              <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(i, -1); }}
                    className="w-5 h-5 bg-black/70 text-white rounded flex items-center justify-center hover:bg-black/90"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                )}
                {i < media.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(i, 1); }}
                    className="w-5 h-5 bg-black/70 text-white rounded flex items-center justify-center hover:bg-black/90"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(item); }}
                  className="w-5 h-5 bg-red-500/80 text-white rounded flex items-center justify-center hover:bg-red-500"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / upload button */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[#272829] rounded-lg cursor-pointer hover:border-[#7c3aed] transition-colors"
      >
        <Upload className="w-5 h-5 text-[#9aa0a6]" />
        <p className="text-xs text-[#9aa0a6]">
          {uploading || isLoading ? "Uploading..." : "Drop images or click to upload"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
}
