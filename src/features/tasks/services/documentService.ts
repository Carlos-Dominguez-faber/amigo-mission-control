import { supabase } from "@/lib/supabase";
import type { TaskDocument } from "@/shared/types/database";

const BUCKET = "task-documents";

export async function uploadDocument(
  taskId: string,
  file: File
): Promise<TaskDocument> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${taskId}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    if (uploadError.message?.includes("Bucket not found")) {
      throw new Error("Storage bucket 'task-documents' not found. Run the SQL migration first.");
    }
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const fileType = getFileType(file.type);

  const { data, error } = await supabase
    .from("task_documents")
    .insert([
      {
        task_id: taskId,
        name: file.name,
        file_type: fileType,
        storage_path: storagePath,
        url: urlData.publicUrl,
        size_bytes: file.size,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save document record: ${error.message}`);
  }
  return data as TaskDocument;
}

export async function fetchDocumentsByTask(
  taskId: string
): Promise<TaskDocument[]> {
  // Fetch from task_documents (user uploads via task UI)
  const { data: taskDocs, error: taskErr } = await supabase
    .from("task_documents")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (taskErr) throw taskErr;

  // Also fetch from documents table (agent uploads linked to this task)
  const { data: linkedDocs, error: linkedErr } = await supabase
    .from("documents")
    .select("*")
    .eq("linked_type", "task")
    .eq("linked_id", taskId)
    .order("uploaded_at", { ascending: false });

  if (linkedErr) throw linkedErr;

  // Normalize linked docs to TaskDocument shape
  interface LinkedDocRow {
    id: string;
    name: string;
    file_type: string;
    storage_path: string;
    url: string;
    size_bytes: number;
    uploaded_at: string;
  }
  const normalizedLinked: TaskDocument[] = ((linkedDocs ?? []) as LinkedDocRow[]).map((doc) => ({
    id: doc.id,
    task_id: taskId,
    name: doc.name,
    file_type: doc.file_type,
    storage_path: doc.storage_path,
    url: doc.url,
    size_bytes: doc.size_bytes,
    created_at: doc.uploaded_at,
  }));

  return [...((taskDocs as TaskDocument[]) ?? []), ...normalizedLinked];
}

export async function fetchDocumentCountsByTaskIds(
  taskIds: string[]
): Promise<Record<string, number>> {
  if (taskIds.length === 0) return {};

  const { data: taskDocs } = await supabase
    .from("task_documents")
    .select("task_id")
    .in("task_id", taskIds);

  const { data: linkedDocs } = await supabase
    .from("documents")
    .select("linked_id")
    .eq("linked_type", "task")
    .in("linked_id", taskIds);

  const counts: Record<string, number> = {};
  for (const doc of (taskDocs ?? []) as { task_id: string }[]) {
    counts[doc.task_id] = (counts[doc.task_id] ?? 0) + 1;
  }
  for (const doc of (linkedDocs ?? []) as { linked_id: string | null }[]) {
    if (doc.linked_id) {
      counts[doc.linked_id] = (counts[doc.linked_id] ?? 0) + 1;
    }
  }
  return counts;
}

export async function deleteDocument(doc: TaskDocument): Promise<void> {
  await supabase.storage.from(BUCKET).remove([doc.storage_path]);

  const { error } = await supabase
    .from("task_documents")
    .delete()
    .eq("id", doc.id);

  if (error) throw error;
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/")) return "text";
  return "other";
}
