"use client";

import { useState } from "react";
import { X, Send, Trash2, Loader2 } from "lucide-react";
import type { CortexItem, CortexStatus } from "@/features/cortex/types";
import { SOURCE_TYPE_ICONS, CATEGORY_MAP, STATUS_CONFIG } from "./cortex-constants";

interface CortexDetailModalProps {
  item: CortexItem;
  onClose: () => void;
  onUpdateStatus: (status: CortexStatus) => Promise<void>;
  onSendToAgent: () => Promise<void>;
  onDelete: () => Promise<void>;
}

const STATUS_OPTIONS: CortexStatus[] = ["unread", "read", "implemented"];

export function CortexDetailModal({
  item,
  onClose,
  onUpdateStatus,
  onSendToAgent,
  onDelete,
}: CortexDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const Icon = SOURCE_TYPE_ICONS[item.source_type] ?? SOURCE_TYPE_ICONS.text;
  const category = item.ai_category ? CATEGORY_MAP[item.ai_category] : null;
  const statusCfg = STATUS_CONFIG[item.status];

  async function handleStatusChange(status: CortexStatus) {
    if (status === item.status) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(status);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSend() {
    setIsSending(true);
    try {
      await onSendToAgent();
    } finally {
      setIsSending(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-[#16181a] border border-[#272829] rounded-xl shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 px-4 py-3 border-b border-[#272829]">
          <Icon className="w-5 h-5 text-[#9aa0a6] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{item.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`}
              />
              <span className="text-xs text-[#9aa0a6]">{statusCfg.label}</span>
              {category && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.label}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#9aa0a6] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Raw content */}
          {item.raw_content && (
            <div>
              <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                Content
              </span>
              <p className="mt-1 text-sm text-white whitespace-pre-wrap bg-[#0f1113] border border-[#272829] rounded-lg p-3">
                {item.raw_content}
              </p>
            </div>
          )}

          {/* Image preview */}
          {item.source_type === "image" && item.file_url && (
            <div>
              <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                Image
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.file_url}
                alt={item.title}
                className="mt-1 rounded-lg max-h-64 object-contain bg-[#0f1113] border border-[#272829]"
              />
            </div>
          )}

          {/* AI Summary */}
          {item.ai_summary && (
            <div>
              <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                AI Analysis
              </span>
              <div className="mt-1 text-sm text-white bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-lg p-3">
                {item.ai_summary}
              </div>
            </div>
          )}

          {/* File link */}
          {item.file_url && item.source_type !== "image" && (
            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#7c3aed] hover:underline"
            >
              Open file
            </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-[#272829] flex flex-col gap-3">
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9aa0a6] shrink-0">Status:</span>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const isActive = item.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(s)}
                    className={[
                      "text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                      isActive
                        ? "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30"
                        : "bg-[#0f1113] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
                    ].join(" ")}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || item.is_sent_to_agent}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {item.is_sent_to_agent ? "Sent" : "Send to Agent"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 rounded-lg border border-[#272829] text-red-400 text-sm hover:bg-red-400/10 hover:border-red-400/30 disabled:opacity-40 transition-colors"
              aria-label="Delete"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
