"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { MAX_FILE_SIZE_BYTES } from "./docs-constants";

interface DocUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const ACCEPT = "image/*,.pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.csv";

export function DocUploadZone({ onUpload, isUploading }: DocUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds 10 MB limit.");
      return;
    }
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
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
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={[
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
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
        aria-label="Upload file"
      />

      {isUploading ? (
        <>
          <Loader2 className="w-6 h-6 text-[#7c3aed] animate-spin" />
          <p className="text-xs text-[#9aa0a6]">Uploading...</p>
        </>
      ) : (
        <>
          <Upload className="w-6 h-6 text-[#9aa0a6]" />
          <p className="text-xs text-[#9aa0a6]">
            Drop a file here or <span className="text-[#7c3aed]">click to browse</span>
          </p>
          <p className="text-[10px] text-[#64748b]">Max 10 MB</p>
        </>
      )}

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
