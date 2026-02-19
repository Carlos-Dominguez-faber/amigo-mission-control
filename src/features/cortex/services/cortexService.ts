import { supabase } from "@/lib/supabase";
import type { CortexItem, CortexStatus, CortexCategory, SourceType } from "@/features/cortex/types";

const BUCKET = "cortex";

// ── CRUD ─────────────────────────────────────────────────

export async function fetchCortexItems(filters?: {
  status?: CortexStatus;
  category?: CortexCategory;
}): Promise<CortexItem[]> {
  let query = supabase
    .from("cortex_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.category) {
    query = query.eq("ai_category", filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as CortexItem[]) ?? [];
}

export async function createCortexItem(item: {
  title: string;
  source_type: SourceType;
  raw_content?: string;
  file_url?: string;
  file_path?: string;
  file_type?: string;
}): Promise<CortexItem> {
  const { data, error } = await supabase
    .from("cortex_items")
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data as CortexItem;
}

export async function updateCortexItem(
  id: string,
  updates: Partial<CortexItem>
): Promise<void> {
  const { error } = await supabase
    .from("cortex_items")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCortexItem(item: CortexItem): Promise<void> {
  // Remove file from storage if it exists
  if (item.file_path) {
    await supabase.storage.from(BUCKET).remove([item.file_path]);
  }

  const { error } = await supabase
    .from("cortex_items")
    .delete()
    .eq("id", item.id);
  if (error) throw error;
}

// ── Storage ──────────────────────────────────────────────

export async function uploadCortexFile(file: File): Promise<{
  url: string;
  path: string;
}> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    if (uploadError.message?.includes("Bucket not found")) {
      throw new Error("Storage bucket 'cortex' not found. Run the SQL migration first.");
    }
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl, path: storagePath };
}

// ── AI Pipeline ──────────────────────────────────────────

export async function triggerAnalysis(item: CortexItem): Promise<{
  summary: string;
  category: string;
}> {
  const res = await fetch("/api/cortex/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemId: item.id,
      sourceType: item.source_type,
      content: item.raw_content,
      fileUrl: item.file_url,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Analysis failed" }));
    throw new Error(err.error ?? "Analysis failed");
  }

  return res.json();
}

export async function triggerTranscription(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const res = await fetch("/api/cortex/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Transcription failed" }));
    throw new Error(err.error ?? "Transcription failed");
  }

  const { text } = await res.json();
  return text;
}

// ── Send to Agent ────────────────────────────────────────

export async function sendToAgent(item: CortexItem): Promise<void> {
  // Create task assigned to Amigo
  const { error: taskError } = await supabase.from("tasks").insert([
    {
      title: `Cortex: ${item.title}`,
      description: item.ai_summary ?? item.raw_content ?? "",
      status: "todo",
      assignee: "amigo",
      priority: "medium",
    },
  ]);

  if (taskError) throw taskError;

  // Mark item as sent
  const { error: updateError } = await supabase
    .from("cortex_items")
    .update({ is_sent_to_agent: true })
    .eq("id", item.id);

  if (updateError) throw updateError;
}
