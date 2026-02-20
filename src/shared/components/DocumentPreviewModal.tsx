"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

interface DocumentPreviewModalProps {
  url: string;
  fileType: string;
  name: string;
  onClose: () => void;
}

function isImage(fileType: string): boolean {
  return fileType === "image" || fileType.startsWith("image");
}

function isPdf(fileType: string): boolean {
  return fileType === "pdf" || fileType.includes("pdf");
}

function isText(fileType: string, name: string): boolean {
  if (fileType === "text" || fileType.startsWith("text/")) return true;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return [
    "md", "txt", "csv", "json", "yml", "yaml", "xml", "log",
    "sh", "py", "js", "ts", "tsx", "jsx", "css", "html", "sql",
  ].includes(ext);
}

function TextPreview({ url }: { url: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.text();
      })
      .then(setContent)
      .catch(() => setError(true));
  }, [url]);

  if (error) return null; // fallback handled by parent
  if (content === null) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-[#7c3aed] animate-spin" />
      </div>
    );
  }

  return (
    <pre className="p-6 text-sm text-[#e0e0e0] font-mono whitespace-pre-wrap break-words leading-relaxed overflow-auto max-h-[70vh]">
      {content}
    </pre>
  );
}

export function DocumentPreviewModal({ url, fileType, name, onClose }: DocumentPreviewModalProps) {
  const [loadError, setLoadError] = useState(false);
  const canPreviewText = isText(fileType, name);

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

  const showPdf = !loadError && isPdf(fileType);
  const showImage = !loadError && !showPdf && isImage(fileType);
  const showText = !loadError && !showPdf && !showImage && canPreviewText;
  const showFallback = !loadError && !showPdf && !showImage && !showText;

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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download instead
              </a>
            </div>
          )}

          {showPdf && (
            <iframe
              src={url}
              title={name}
              className="w-full h-full min-h-[60vh] border-0"
              onError={() => setLoadError(true)}
            />
          )}

          {showImage && (
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

          {showText && <TextPreview url={url} />}

          {showFallback && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[40vh]">
              <p className="text-[#9aa0a6] text-sm">Preview is not available for this file type.</p>
              <a
                href={url}
                download={name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
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
