"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Loader2, FileText, Image, File, FileCode, Trash2, ExternalLink } from "lucide-react";
import {
  uploadAndLinkDocument,
  fetchLinkedDocuments,
  unlinkAndDeleteDocument,
} from "@/features/documents/services/docService";
import type { Document } from "@/shared/types/database";

interface LinkedDocsSectionProps {
  linkedType: "task" | "content" | "calendar" | "memory";
  linkedId: string;
  label?: string;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = "image/*,.pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.csv";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: Image,
  text: FileCode,
  other: File,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: "text-red-400",
  image: "text-blue-400",
  text: "text-green-400",
  other: "text-[#9aa0a6]",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LinkedDocsSection({ linkedType, linkedId, label = "Attachments" }: LinkedDocsSectionProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(async () => {
    try {
      const data = await fetchLinkedDocuments(linkedType, linkedId);
      setDocs(data);
    } catch (err) {
      console.error("[LinkedDocsSection] Failed to load:", err);
    }
  }, [linkedType, linkedId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleFile(file: globalThis.File) {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("File exceeds 10 MB limit.");
      return;
    }
    setIsUploading(true);
    try {
      const doc = await uploadAndLinkDocument(file, linkedType, linkedId);
      setDocs((prev) => [doc, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(doc: Document) {
    try {
      await unlinkAndDeleteDocument(doc);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      console.error("[LinkedDocsSection] Delete failed:", err);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
        {label}
      </span>

      {/* Linked documents list */}
      {docs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {docs.map((doc) => {
            const Icon = TYPE_ICONS[doc.file_type] ?? TYPE_ICONS.other;
            const colorClass = TYPE_COLORS[doc.file_type] ?? TYPE_COLORS.other;
            return (
              <div
                key={doc.id}
                className="flex items-center gap-2 bg-[#0f1113] border border-[#272829] rounded-lg px-2.5 py-1.5"
              >
                <Icon className={`w-4 h-4 shrink-0 ${colorClass}`} />
                <span className="text-xs text-white truncate flex-1 min-w-0">
                  {doc.name}
                </span>
                <span className="text-[10px] text-[#64748b] shrink-0">
                  {formatSize(doc.size_bytes)}
                </span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-0.5 text-[#9aa0a6] hover:text-white transition-colors shrink-0"
                  aria-label="Open file"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="p-0.5 text-[#9aa0a6] hover:text-red-400 transition-colors shrink-0"
                  aria-label={`Remove ${doc.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Compact upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "border border-dashed rounded-lg px-3 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors",
          isDragging
            ? "border-[#7c3aed] bg-[#7c3aed]/10"
            : "border-[#272829] hover:border-[#7c3aed]/50 bg-[#0f1113]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          className="hidden"
          aria-label="Upload attachment"
        />

        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 text-[#7c3aed] animate-spin" />
            <span className="text-xs text-[#9aa0a6]">Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 text-[#9aa0a6]" />
            <span className="text-xs text-[#9aa0a6]">
              Drop file or <span className="text-[#7c3aed]">browse</span>
            </span>
          </>
        )}
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
