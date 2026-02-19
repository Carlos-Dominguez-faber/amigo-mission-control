"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, ExternalLink, AlertCircle } from "lucide-react";

interface DocumentPreviewModalProps {
  url: string;
  fileType: string;
  name: string;
  onClose: () => void;
}

function isImage(fileType: string): boolean {
  return fileType.startsWith("image");
}

function isPdf(fileType: string): boolean {
  return fileType === "pdf" || fileType.includes("pdf");
}

export function DocumentPreviewModal({ url, fileType, name, onClose }: DocumentPreviewModalProps) {
  const [loadError, setLoadError] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${name}`}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#16181a] rounded-2xl border border-[#272829] max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272829] gap-3">
          <p className="text-sm font-medium text-white truncate flex-1 min-w-0" title={name}>
            {name}
          </p>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in new tab"
              className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>

            <a
              href={url}
              download={name}
              aria-label="Download file"
              className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              aria-label="Close preview"
              onClick={onClose}
              className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loadError && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[40vh]">
              <AlertCircle className="w-8 h-8 text-red-400" aria-hidden="true" />
              <p className="text-red-400 text-sm">Failed to load preview.</p>
              <a
                href={url}
                download={name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16181a]"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download instead
              </a>
            </div>
          )}

          {!loadError && isPdf(fileType) && (
            <iframe
              src={url}
              title={name}
              className="w-full h-full min-h-[60vh] border-0"
              onError={() => setLoadError(true)}
            />
          )}

          {!loadError && isImage(fileType) && (
            <div className="flex items-center justify-center p-4 h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={name}
                className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                onError={() => setLoadError(true)}
              />
            </div>
          )}

          {!loadError && !isPdf(fileType) && !isImage(fileType) && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[40vh]">
              <p className="text-[#9aa0a6] text-sm">Preview is not available for this file type.</p>
              <a
                href={url}
                download={name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16181a]"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download {name}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
