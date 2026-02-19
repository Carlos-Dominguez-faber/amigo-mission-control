"use client";

import { useState, useEffect, useCallback } from "react";
import type { CortexItem, CortexStatus, CortexCategory } from "@/features/cortex/types";
import {
  fetchCortexItems,
  createCortexItem,
  updateCortexItem,
  deleteCortexItem,
  triggerAnalysis,
  sendToAgent as sendToAgentService,
} from "@/features/cortex/services/cortexService";

interface UseCortexReturn {
  items: CortexItem[];
  isLoaded: boolean;
  statusFilter: CortexStatus | null;
  categoryFilter: CortexCategory | null;
  setStatusFilter: (f: CortexStatus | null) => void;
  setCategoryFilter: (f: CortexCategory | null) => void;
  addItem: (data: Parameters<typeof createCortexItem>[0]) => Promise<CortexItem>;
  updateItem: (id: string, updates: Partial<CortexItem>) => Promise<void>;
  removeItem: (item: CortexItem) => Promise<void>;
  sendToAgent: (item: CortexItem) => Promise<void>;
  refreshItems: () => Promise<void>;
}

export function useCortex(): UseCortexReturn {
  const [items, setItems] = useState<CortexItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CortexStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CortexCategory | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const filters: { status?: CortexStatus; category?: CortexCategory } = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      const data = await fetchCortexItems(filters);
      setItems(data);
    } catch (err) {
      console.error("[useCortex] Failed to load:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function addItem(data: Parameters<typeof createCortexItem>[0]): Promise<CortexItem> {
    const item = await createCortexItem(data);
    setItems((prev) => [item, ...prev]);

    // Trigger AI analysis asynchronously (don't block UI)
    triggerAnalysis(item)
      .then(({ summary, category }) => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  ai_summary: summary,
                  ai_category: category as CortexCategory,
                  ai_status: "done" as const,
                  processed_at: new Date().toISOString(),
                }
              : i
          )
        );
      })
      .catch(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, ai_status: "failed" as const } : i
          )
        );
      });

    return item;
  }

  async function updateItem(id: string, updates: Partial<CortexItem>): Promise<void> {
    await updateCortexItem(id, updates);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }

  async function removeItem(item: CortexItem): Promise<void> {
    await deleteCortexItem(item);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function sendToAgent(item: CortexItem): Promise<void> {
    await sendToAgentService(item);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_sent_to_agent: true } : i))
    );
  }

  return {
    items,
    isLoaded,
    statusFilter,
    categoryFilter,
    setStatusFilter,
    setCategoryFilter,
    addItem,
    updateItem,
    removeItem,
    sendToAgent,
    refreshItems: loadItems,
  };
}
