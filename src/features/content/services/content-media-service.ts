import { supabase } from "@/lib/supabase";
import type { ContentMediaItem } from "@/features/content/types";

const BUCKET = "content-media";

export async function fetchContentMedia(
  contentId: string
): Promise<ContentMediaItem[]> {
  const { data, error } = await supabase
    .from("content_media")
    .select("*")
    .eq("content_id", contentId)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data as ContentMediaItem[]) ?? [];
}

export async function uploadContentMedia(
  file: File,
  contentId: string,
  position: number
): Promise<ContentMediaItem> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${contentId}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("content_media")
    .insert([
      {
        content_id: contentId,
        url: urlData.publicUrl,
        storage_path: storagePath,
        position,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as ContentMediaItem;
}

export async function deleteContentMedia(
  item: ContentMediaItem
): Promise<void> {
  await supabase.storage.from(BUCKET).remove([item.storage_path]);

  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("id", item.id);

  if (error) throw error;
}

export async function reorderContentMedia(
  contentId: string,
  orderedIds: string[]
): Promise<void> {
  // Batch update positions
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("content_media")
      .update({ position: i })
      .eq("id", orderedIds[i])
      .eq("content_id", contentId);

    if (error) throw error;
  }
}
