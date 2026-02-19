"use client";

import { useState, useRef } from "react";
import {
  X,
  MessageSquare,
  Link as LinkIcon,
  ImageIcon,
  Mic,
  File,
  Upload,
  Loader2,
} from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { uploadCortexFile, triggerTranscription } from "@/features/cortex/services/cortexService";
import { MAX_FILE_SIZE_BYTES } from "./cortex-constants";
import type { SourceType } from "@/features/cortex/types";

interface CortexQuickAddProps {
  onAdd: (data: {
    title: string;
    source_type: SourceType;
    raw_content?: string;
    file_url?: string;
    file_path?: string;
    file_type?: string;
  }) => Promise<void>;
  onClose: () => void;
}

type Tab = "text" | "link" | "image" | "voice" | "file";

const TABS: { id: Tab; label: string; Icon: typeof MessageSquare }[] = [
  { id: "text", label: "Text", Icon: MessageSquare },
  { id: "link", label: "Link", Icon: LinkIcon },
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "voice", label: "Voice", Icon: Mic },
  { id: "file", label: "File", Icon: File },
];

export function CortexQuickAdd({ onAdd, onClose }: CortexQuickAddProps) {
  const [activeTab, setActiveTab] = useState<Tab>("text");
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleTextSubmit() {
    if (!textContent.trim()) return;
    const t = title.trim() || textContent.trim().slice(0, 60);
    await onAdd({ title: t, source_type: "text", raw_content: textContent.trim() });
  }

  async function handleLinkSubmit() {
    if (!linkUrl.trim()) return;
    const t = title.trim() || linkUrl.trim();
    await onAdd({ title: t, source_type: "link", raw_content: linkUrl.trim() });
  }

  async function handleFileUpload(file: globalThis.File, sourceType: SourceType) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds 10 MB limit.");
      return;
    }
    const { url, path } = await uploadCortexFile(file);
    const t = title.trim() || file.name;
    await onAdd({
      title: t,
      source_type: sourceType,
      file_url: url,
      file_path: path,
      file_type: file.type,
    });
  }

  async function handleVoiceRecorded(blob: Blob) {
    setIsSubmitting(true);
    setError(null);
    try {
      // Upload audio file
      const audioFile = new globalThis.File([blob], "recording.webm", { type: "audio/webm" });
      const { url, path } = await uploadCortexFile(audioFile);

      // Transcribe
      const transcription = await triggerTranscription(blob);
      const t = title.trim() || transcription.slice(0, 60) || "Voice note";

      await onAdd({
        title: t,
        source_type: "voice",
        raw_content: transcription,
        file_url: url,
        file_path: path,
        file_type: "audio/webm",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process recording.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      switch (activeTab) {
        case "text":
          await handleTextSubmit();
          break;
        case "link":
          await handleLinkSubmit();
          break;
        default:
          return; // image/file/voice handled by their own flows
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, sourceType: SourceType) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsSubmitting(true);
    setError(null);
    try {
      await handleFileUpload(file, sourceType);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    !isSubmitting &&
    ((activeTab === "text" && textContent.trim().length > 0) ||
      (activeTab === "link" && linkUrl.trim().length > 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-[#16181a] border border-[#272829] rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#272829]">
          <h2 className="text-sm font-semibold text-white">Capture to Cortex</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#9aa0a6] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#272829]">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setError(null);
              }}
              className={[
                "flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors",
                activeTab === id
                  ? "text-[#7c3aed] border-b-2 border-[#7c3aed]"
                  : "text-[#9aa0a6] hover:text-white",
              ].join(" ")}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          {/* Optional title (shared) */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional, auto-generated if empty)"
            className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
          />

          {/* Tab content */}
          {activeTab === "text" && (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Write your note, prompt, or idea..."
              rows={4}
              autoFocus
              className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 resize-y placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          )}

          {activeTab === "link" && (
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              autoFocus
              className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          )}

          {activeTab === "image" && (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-[#272829] hover:border-[#7c3aed]/50 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#0f1113]"
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
                className="hidden"
              />
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 text-[#7c3aed] animate-spin" />
                  <p className="text-xs text-[#9aa0a6]">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-[#9aa0a6]" />
                  <p className="text-xs text-[#9aa0a6]">
                    Click to upload image or <span className="text-[#7c3aed]">browse</span>
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === "voice" && (
            <VoiceRecorder onRecorded={handleVoiceRecorded} disabled={isSubmitting} />
          )}

          {activeTab === "file" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#272829] hover:border-[#7c3aed]/50 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#0f1113]"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileChange(e, "file")}
                className="hidden"
              />
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 text-[#7c3aed] animate-spin" />
                  <p className="text-xs text-[#9aa0a6]">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-[#9aa0a6]" />
                  <p className="text-xs text-[#9aa0a6]">
                    Click to upload file or <span className="text-[#7c3aed]">browse</span>
                  </p>
                  <p className="text-[10px] text-[#64748b]">Max 10 MB</p>
                </>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Footer (only for text/link) */}
        {(activeTab === "text" || activeTab === "link") && (
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-2.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Capture"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
