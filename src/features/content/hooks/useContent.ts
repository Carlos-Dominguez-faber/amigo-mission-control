"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ContentItem, ContentStage } from "@/features/content/types";

interface UseContentReturn {
  items: ContentItem[];
  isLoaded: boolean;
  addContent: (item: Partial<ContentItem>) => Promise<ContentItem>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  updateContentStage: (id: string, stage: ContentStage) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
}

export function useContent(): UseContentReturn {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as ContentItem[]) ?? []);
    } catch (err) {
      console.error("[useContent] Failed to load content items:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function addContent(item: Partial<ContentItem>): Promise<ContentItem> {
    const now = new Date().toISOString();

    const payload = {
      title: item.title ?? "",
      description: item.description,
      stage: item.stage ?? "idea",
      platform: item.platform ?? "youtube",
      assignee: item.assignee ?? "carlos",
      script: item.script,
      image_url: item.image_url,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("content_items")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    const created = data as ContentItem;
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function updateContent(id: string, updates: Partial<ContentItem>): Promise<void> {
    const payload = { ...updates, updated_at: new Date().toISOString() };

    const { error } = await supabase
      .from("content_items")
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...payload } : item
      )
    );
  }

  async function updateContentStage(id: string, stage: ContentStage): Promise<void> {
    const { error } = await supabase
      .from("content_items")
      .update({ stage, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stage, updated_at: new Date().toISOString() } : item
      )
    );
  }

  async function deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return {
    items,
    isLoaded,
    addContent,
    updateContent,
    updateContentStage,
    deleteContent,
  };
}
