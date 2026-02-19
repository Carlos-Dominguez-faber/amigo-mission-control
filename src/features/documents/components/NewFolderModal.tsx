"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface NewFolderModalProps {
  mode: "create" | "rename";
  currentName?: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function NewFolderModal({ mode, currentName = "", onClose, onSubmit }: NewFolderModalProps) {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#16181a] rounded-2xl border border-[#272829] w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272829]">
          <h3 className="text-sm font-semibold text-white">
            {mode === "create" ? "New Folder" : "Rename"}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="folder-name" className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reports"
              autoFocus
              className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSaving}
            className="w-full py-2.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
                ? "Create Folder"
                : "Rename"}
          </button>
        </form>
      </div>
    </div>
  );
}
