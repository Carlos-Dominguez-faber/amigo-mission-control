"use client";

import { useEffect, useCallback, useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { ContentItem } from "@/features/content/types";
import { ContentForm } from "./ContentForm";

interface ContentModalProps {
  mode: "add" | "edit";
  item?: ContentItem;
  onClose: () => void;
  onSubmit: (data: Partial<ContentItem>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function ContentModal({ mode, item, onClose, onSubmit, onDelete }: ContentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleSubmit(data: Partial<ContentItem>) {
    await onSubmit(data);
    onClose();
  }

  async function handleDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#16181a] rounded-2xl border border-[#272829] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272829]">
          <h2 id="content-modal-title" className="text-sm font-semibold text-white">
            {mode === "add" ? "New Content" : "Edit Content"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <ContentForm
            defaultValues={item}
            onSubmit={handleSubmit}
            submitLabel={mode === "add" ? "Create" : "Save Changes"}
          />
        </div>

        {/* Footer: delete button (edit only) */}
        {mode === "edit" && onDelete && (
          <div className="p-4 border-t border-[#272829]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 hover:bg-red-400/20 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              {isDeleting ? "Deleting..." : "Delete Content"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
