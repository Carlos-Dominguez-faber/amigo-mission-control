import { FileText, Image, File, FileCode } from "lucide-react";

interface FileTypeConfig {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export const FILE_TYPE_CONFIG: Record<string, FileTypeConfig> = {
  pdf: { label: "PDF", Icon: FileText, colorClass: "text-red-400" },
  image: { label: "Image", Icon: Image, colorClass: "text-blue-400" },
  text: { label: "Text", Icon: FileCode, colorClass: "text-green-400" },
  other: { label: "File", Icon: File, colorClass: "text-[#9aa0a6]" },
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
