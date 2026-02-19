"use client";

import { useEffect, useCallback, useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { Memory } from "@/features/memory/types";
import { MemoryForm } from "./MemoryForm";

interface MemoryModalProps {
  mode: "add" | "edit";
  memory?: Memory;
  onClose: () => void;
  onSubmit: (data: Partial<Memory>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function MemoryModal({ mode, memory, onClose, onSubmit, onDelete }: MemoryModalProps) {
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

  async function handleSubmit(data: Partial<Memory>) {
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
      aria-labelledby="memory-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#16181a] rounded-2xl border border-[#272829] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272829]">
          <h2 id="memory-modal-title" className="text-sm font-semibold text-white">
            {mode === "add" ? "New Memory" : "Edit Memory"}
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
          <MemoryForm
            defaultValues={memory}
            onSubmit={handleSubmit}
            submitLabel={mode === "add" ? "Create" : "Save Changes"}
          />
        </div>

        {/* Footer: delete (edit only) */}
        {mode === "edit" && onDelete && (
          <div className="p-4 border-t border-[#272829]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 hover:bg-red-400/20 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              {isDeleting ? "Deleting..." : "Delete Memory"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
