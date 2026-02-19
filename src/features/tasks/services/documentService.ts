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
  const { data, error } = await supabase
    .from("task_documents")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as TaskDocument[]) ?? [];
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
