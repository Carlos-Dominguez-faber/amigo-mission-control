"use client";

import { Zap } from "lucide-react";

interface CortexEmptyStateProps {
  hasFilters: boolean;
  onCapture: () => void;
}

export function CortexEmptyState({ hasFilters, onCapture }: CortexEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
        <Zap className="w-6 h-6 text-[#7c3aed]" />
      </div>
      <p className="text-sm font-medium text-white">
        {hasFilters ? "No items match your filters" : "Your Cortex is empty"}
      </p>
      <p className="text-xs text-[#9aa0a6] max-w-xs">
        {hasFilters
          ? "Try different filters or capture something new."
          : "Capture prompts, links, images, voice notes, and files. AI will analyze and organize everything."}
      </p>
      {!hasFilters && (
        <button
          type="button"
          onClick={onCapture}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
        >
          <Zap className="w-4 h-4" />
          Capture First Item
        </button>
      )}
    </div>
  );
}
