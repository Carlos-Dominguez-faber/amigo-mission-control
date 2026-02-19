"use client";

import { useState, useEffect, useRef } from "react";
import type { Task } from "@/features/tasks/types";
import { useTaskDocuments } from "@/features/tasks/hooks/useTaskDocuments";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentList } from "./DocumentList";
import { AlertCircle } from "lucide-react";

interface TaskCardExpandedProps {
  task: Task;
  onNotesChange: (notes: string) => void;
  onDocumentPreview: (url: string, fileType: string, name: string) => void;
}

export default function TaskCardExpanded({
  task,
  onNotesChange,
  onDocumentPreview,
}: TaskCardExpandedProps) {
  const { documents, isLoading, loadDocuments, upload, remove } = useTaskDocuments();
  const [notesValue, setNotesValue] = useState(task.notes ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  // Load documents on first mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadDocuments(task.id);
    }
  }, [task.id, loadDocuments]);

  // Sync notes when task changes (e.g. external update)
  useEffect(() => {
    setNotesValue(task.notes ?? "");
  }, [task.notes]);

  function handleNotesBlur() {
    onNotesChange(notesValue);
  }

  async function handleUpload(file: File) {
    setIsUploading(true);
    setUploadError(null);
    try {
      await upload(task.id, file);
    } catch (err: unknown) {
      console.error("[TaskCardExpanded] Upload failed:", err);
      const message = err instanceof Error ? err.message : "Upload failed. Check your connection.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
      {/* Full description */}
      {task.description && (
        <p className="text-sm text-[#c0c4ca] mb-1 leading-relaxed">{task.description}</p>
      )}

      {/* Notes section */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`notes-${task.id}`}
          className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider"
        >
          Notes
        </label>
        <textarea
          id={`notes-${task.id}`}
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add notes..."
          className="bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg p-3 w-full min-h-[80px] resize-y placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
          aria-label="Task notes"
        />
      </div>

      {/* Documents section */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
          Documents
        </p>

        {isLoading ? (
          <p className="text-xs text-[#9aa0a6] py-1">Loading documents...</p>
        ) : (
          <DocumentList
            documents={documents}
            onPreview={onDocumentPreview}
            onDelete={remove}
          />
        )}

        {uploadError && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-400/10 border border-red-400/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
            <p className="text-xs text-red-400 flex-1">{uploadError}</p>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-xs text-red-400/60 hover:text-red-400"
            >
              Dismiss
            </button>
          </div>
        )}

        <DocumentUpload onUpload={handleUpload} isUploading={isUploading} />
      </div>
    </div>
  );
}
