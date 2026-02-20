"use client";

import { useState, useCallback } from "react";
import type { ContentMediaItem } from "@/features/content/types";
import {
  fetchContentMedia,
  uploadContentMedia,
  deleteContentMedia,
  reorderContentMedia,
} from "@/features/content/services/content-media-service";

interface UseContentMediaReturn {
  media: ContentMediaItem[];
  isLoading: boolean;
  loadMedia: (contentId: string) => Promise<void>;
  addMedia: (contentId: string, file: File) => Promise<ContentMediaItem>;
  removeMedia: (item: ContentMediaItem) => Promise<void>;
  reorder: (contentId: string, orderedIds: string[]) => Promise<void>;
}

export function useContentMedia(): UseContentMediaReturn {
  const [media, setMedia] = useState<ContentMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMedia = useCallback(async (contentId: string) => {
    setIsLoading(true);
    try {
      const items = await fetchContentMedia(contentId);
      setMedia(items);
    } catch (err) {
      console.error("[useContentMedia] Failed to load:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMedia = useCallback(
    async (contentId: string, file: File) => {
      const nextPosition = media.length;
      const item = await uploadContentMedia(file, contentId, nextPosition);
      setMedia((prev) => [...prev, item]);
      return item;
    },
    [media.length]
  );

  const removeMedia = useCallback(async (item: ContentMediaItem) => {
    await deleteContentMedia(item);
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
  }, []);

  const reorder = useCallback(
    async (contentId: string, orderedIds: string[]) => {
      await reorderContentMedia(contentId, orderedIds);
      // Re-sort local state
      setMedia((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        return orderedIds
          .map((id, i) => {
            const m = byId.get(id);
            return m ? { ...m, position: i } : null;
          })
          .filter((m): m is ContentMediaItem => m !== null);
      });
    },
    []
  );

  return { media, isLoading, loadMedia, addMedia, removeMedia, reorder };
}
