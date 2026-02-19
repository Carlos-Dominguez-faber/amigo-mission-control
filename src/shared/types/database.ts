export type TaskStatus = "todo" | "in-progress" | "done";
export type Assignee = "carlos" | "amigo";
export type Priority = "low" | "medium" | "high";
export type ContentStage = "idea" | "script" | "thumbnail" | "filming" | "editing" | "published";
export type ContentPlatform = "youtube" | "instagram" | "tiktok" | "linkedin" | "twitter";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
  priority: Priority;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LinkedType = "task" | "content" | "calendar" | "memory";

export interface DocFolder {
  id: string;
  name: string;
  parent_id: string | null;
  color: string;
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  file_type: string;
  storage_path: string;
  url: string;
  size_bytes: number;
  folder_id: string | null;
  linked_type: LinkedType | null;
  linked_id: string | null;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  stage: ContentStage;
  platform: ContentPlatform;
  assignee: string;
  script?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  day_of_week: number;
  color: string;
  is_recurring: boolean;
  interval_type: string;
  created_at?: string;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  memory_type: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description?: string;
  skills: string[];
  color: string;
  color_hex?: string;
  layer: string;
  avatar: string;
  created_at?: string;
}

export interface OfficeAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  color_hex?: string;
  agent_state: string;
  current_task?: string;
  task_progress?: number;
  zone: string;
  channel?: string;
  last_activity?: string;
  updated_at?: string;
}

export interface TaskDocument {
  id: string;
  task_id: string;
  name: string;
  file_type: string;
  storage_path: string;
  url: string;
  size_bytes: number;
  created_at: string;
}

// Cortex
export type SourceType = "text" | "link" | "image" | "voice" | "file";
export type CortexStatus = "unread" | "read" | "implemented";
export type CortexAiStatus = "idle" | "processing" | "done" | "failed";
export type CortexCategory =
  | "vibe-coding"
  | "openclaw"
  | "prompts"
  | "nanobanana"
  | "resources"
  | "ideas";

export interface CortexItem {
  id: string;
  title: string;
  source_type: SourceType;
  raw_content: string | null;
  file_url: string | null;
  file_path: string | null;
  file_type: string | null;
  ai_summary: string | null;
  ai_category: CortexCategory | null;
  ai_status: CortexAiStatus;
  status: CortexStatus;
  is_sent_to_agent: boolean;
  created_at: string;
  processed_at: string | null;
}
