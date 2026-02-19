"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function DocumentUpload({ onUpload, isUploading = false }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleClick() {
    inputRef.current?.click();
  }

  async function handleFileSelected(file: File) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File "${file.name}" exceeds the 10 MB limit. Please choose a smaller file.`);
      return;
    }
    await onUpload(file);
  }

  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileSelected(file);
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await handleFileSelected(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload document"
      onClick={!isUploading ? handleClick : undefined}
      onKeyDown={(e) => {
        if (!isUploading && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={!isUploading ? handleDrop : undefined}
      className={[
        "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
        isUploading
          ? "border-[#272829] cursor-not-allowed opacity-60"
          : isDragging
          ? "border-[#7c3aed] cursor-pointer"
          : "border-[#272829] hover:border-[#7c3aed]/50 cursor-pointer",
      ].join(" ")}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 text-[#7c3aed] animate-spin" aria-hidden="true" />
          <span className="text-xs text-[#9aa0a6]">Uploading…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-5 h-5 text-[#9aa0a6]" aria-hidden="true" />
          <span className="text-xs text-[#9aa0a6]">
            Click to upload <span className="text-[#7c3aed]">or drag & drop</span>
          </span>
          <span className="text-xs text-[#9aa0a6]/60">PDF, images, TXT, MD — max 10 MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.txt,.md"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleInputChange}
        disabled={isUploading}
      />
    </div>
  );
}
