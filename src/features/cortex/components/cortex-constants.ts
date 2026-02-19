import {
  MessageSquare,
  Link as LinkIcon,
  ImageIcon,
  Mic,
  File,
  type LucideIcon,
} from "lucide-react";

export interface CategoryConfig {
  value: string;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { value: "vibe-coding", label: "Vibe Coding", color: "#3b82f6" },
  { value: "openclaw", label: "OpenClaw", color: "#22c55e" },
  { value: "prompts", label: "Prompts", color: "#a855f7" },
  { value: "nanobanana", label: "NanoBanana", color: "#eab308" },
  { value: "resources", label: "Resources", color: "#06b6d4" },
  { value: "ideas", label: "Ideas", color: "#f97316" },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
);

export const SOURCE_TYPE_ICONS: Record<string, LucideIcon> = {
  text: MessageSquare,
  link: LinkIcon,
  image: ImageIcon,
  voice: Mic,
  file: File,
};

export const STATUS_CONFIG: Record<string, { label: string; dotClass: string }> = {
  unread: { label: "Unread", dotClass: "bg-blue-400" },
  read: { label: "Read", dotClass: "bg-[#9aa0a6]" },
  implemented: { label: "Implemented", dotClass: "bg-green-400" },
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
