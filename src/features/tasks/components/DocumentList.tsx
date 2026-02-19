"use client";

import type { TaskDocument } from "@/shared/types/database";
import { FileText, ImageIcon, File, Trash2, Eye } from "lucide-react";

interface DocumentListProps {
  documents: TaskDocument[];
  onPreview: (url: string, fileType: string, name: string) => void;
  onDelete: (doc: TaskDocument) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === "pdf" || fileType.includes("pdf")) {
    return <FileText className="w-4 h-4 text-[#9aa0a6] shrink-0" aria-hidden="true" />;
  }
  if (fileType.startsWith("image")) {
    return <ImageIcon className="w-4 h-4 text-[#9aa0a6] shrink-0" aria-hidden="true" />;
  }
  return <File className="w-4 h-4 text-[#9aa0a6] shrink-0" aria-hidden="true" />;
}

export function DocumentList({ documents, onPreview, onDelete }: DocumentListProps) {
  if (documents.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1" aria-label="Attached documents">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#272829]/50 transition-colors"
        >
          <FileIcon fileType={doc.file_type} />

          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate" title={doc.name}>
              {doc.name}
            </p>
            <p className="text-xs text-[#9aa0a6]">{formatFileSize(doc.size_bytes)}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label={`Preview ${doc.name}`}
              onClick={() => onPreview(doc.url, doc.file_type, doc.name)}
              className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label={`Delete ${doc.name}`}
              onClick={() => onDelete(doc)}
              className="p-1.5 rounded-md text-red-400/50 hover:text-red-400 hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
