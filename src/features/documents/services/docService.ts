import { supabase } from "@/lib/supabase";
import type { Document, DocFolder } from "@/features/documents/types";

const BUCKET = "documents";

// ── Folders ──────────────────────────────────────────────

export async function fetchFolders(parentId: string | null): Promise<DocFolder[]> {
  let query = supabase
    .from("doc_folders")
    .select("*")
    .order("name", { ascending: true });

  if (parentId === null) {
    query = query.is("parent_id", null);
  } else {
    query = query.eq("parent_id", parentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DocFolder[]) ?? [];
}

export async function createFolder(
  name: string,
  parentId: string | null
): Promise<DocFolder> {
  const { data, error } = await supabase
    .from("doc_folders")
    .insert([{ name, parent_id: parentId }])
    .select()
    .single();

  if (error) throw error;
  return data as DocFolder;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("doc_folders")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase
    .from("doc_folders")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Documents ────────────────────────────────────────────

export async function fetchDocuments(folderId: string | null): Promise<Document[]> {
  let query = supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (folderId === null) {
    query = query.is("folder_id", null);
  } else {
    query = query.eq("folder_id", folderId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Document[]) ?? [];
}

export async function uploadDocument(
  file: File,
  folderId: string | null,
  uploadedBy: string = "user"
): Promise<Document> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${folderId ?? "root"}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    if (uploadError.message?.includes("Bucket not found")) {
      throw new Error("Storage bucket 'documents' not found. Run the SQL migration first.");
    }
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const fileType = getFileType(file.type);

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        name: file.name,
        file_type: fileType,
        storage_path: storagePath,
        url: urlData.publicUrl,
        size_bytes: file.size,
        folder_id: folderId,
        uploaded_by: uploadedBy,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(doc: Document): Promise<void> {
  await supabase.storage.from(BUCKET).remove([doc.storage_path]);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", doc.id);

  if (error) throw error;
}

export async function renameDocument(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

// ── Breadcrumb helper ────────────────────────────────────

export async function fetchFolderAncestors(
  folderId: string
): Promise<DocFolder[]> {
  const ancestors: DocFolder[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const result = await supabase
      .from("doc_folders")
      .select("*")
      .eq("id", currentId)
      .single();

    if (result.error || !result.data) break;
    const folder = result.data as DocFolder;
    ancestors.unshift(folder);
    currentId = folder.parent_id;
  }

  return ancestors;
}

// ── Util ─────────────────────────────────────────────────

function getFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/")) return "text";
  return "other";
}
