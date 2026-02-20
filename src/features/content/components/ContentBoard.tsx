"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useContent } from "@/features/content/hooks/useContent";
import type { ContentItem } from "@/features/content/types";
import type { ContentFilter } from "@/features/content/constants/content-constants";
import {
  STAGES_BY_TYPE,
  STAGE_CONFIG,
  UNIFIED_STAGES,
  UNIFIED_STAGE_MAP,
  UNIFIED_STAGE_CONFIG,
} from "@/features/content/constants/content-constants";
import { ContentColumn } from "./ContentColumn";
import { ContentCard } from "./ContentCard";
import { ContentStatsBar } from "./ContentStatsBar";
import { ContentFilterBar } from "./content-filter-bar";
import { ContentModal } from "./ContentModal";
import { ContentDetailModal } from "./content-detail-modal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "detail"; item: ContentItem }
  | { mode: "edit"; item: ContentItem };

export default function ContentBoard() {
  const { items, isLoaded, addContent, updateContent, deleteContent } = useContent();
  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });
  const [filter, setFilter] = useState<ContentFilter>("all");

  // Filter items by content type
  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => (item.content_type ?? "reel") === filter);
  }, [items, filter]);

  // Count by content type (for filter bar)
  const filterCounts = useMemo(() => {
    const counts: Record<ContentFilter, number> = { all: items.length, post: 0, reel: 0, carousel: 0 };
    for (const item of items) {
      const t = item.content_type ?? "reel";
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  // Compute visible columns based on filter
  const columns = useMemo(() => {
    if (filter === "all") {
      // Unified view: Idea → In Progress → Review → Published
      return UNIFIED_STAGES.map((us) => {
        const config = UNIFIED_STAGE_CONFIG[us];
        const columnItems = filteredItems.filter(
          (item) => UNIFIED_STAGE_MAP[item.stage] === us
        );
        return { key: us, label: config.label, color: config.color, items: columnItems };
      });
    }

    // Type-specific view: show stages for that type
    const stages = STAGES_BY_TYPE[filter];
    return stages.map((stage) => {
      const config = STAGE_CONFIG[stage];
      const columnItems = filteredItems.filter((item) => item.stage === stage);
      return { key: stage, label: config.label, color: config.color, items: columnItems };
    });
  }, [filter, filteredItems]);

  // Stats for the stats bar
  const stats = useMemo(() => {
    return columns.map((col) => ({
      key: col.key,
      label: col.label,
      color: col.color,
      count: col.items.length,
    }));
  }, [columns]);

  function handleCardClick(item: ContentItem) {
    setModalState({ mode: "detail", item });
  }

  async function handleAdd(data: Partial<ContentItem>) {
    await addContent(data);
  }

  async function handleEdit(data: Partial<ContentItem>) {
    if (modalState.mode !== "edit") return;
    await updateContent(modalState.item.id, data);
  }

  async function handleDeleteFromEdit() {
    if (modalState.mode !== "edit") return;
    await deleteContent(modalState.item.id);
  }

  async function handleDeleteFromDetail() {
    if (modalState.mode !== "detail") return;
    await deleteContent(modalState.item.id);
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading content...</p>
      </div>
    );
  }

  return (
    <section aria-label="Content pipeline">
      <ContentFilterBar activeFilter={filter} counts={filterCounts} onFilterChange={setFilter} />

      <ContentStatsBar stats={stats} />

      {/* Add button */}
      <button
        type="button"
        onClick={() => setModalState({ mode: "add" })}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        New Content
      </button>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-white">No content yet</p>
          <p className="text-xs text-[#9aa0a6]">
            Click &quot;New Content&quot; to start your content pipeline.
          </p>
        </div>
      )}

      {/* Horizontal scroll Kanban */}
      {filteredItems.length > 0 && (
        <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-4 min-w-max">
            {columns.map((col) => (
              <ContentColumn key={col.key} label={col.label} color={col.color} count={col.items.length}>
                {col.items.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onEdit={() => handleCardClick(item)}
                  />
                ))}
              </ContentColumn>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {modalState.mode === "add" && (
        <ContentModal
          mode="add"
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleAdd}
        />
      )}

      {/* Detail Modal (all content types) */}
      {modalState.mode === "detail" && (
        <ContentDetailModal
          item={modalState.item}
          onClose={() => setModalState({ mode: "closed" })}
          onEdit={() => setModalState({ mode: "edit", item: modalState.item })}
          onDelete={handleDeleteFromDetail}
        />
      )}

      {/* Edit Modal */}
      {modalState.mode === "edit" && (
        <ContentModal
          mode="edit"
          item={modalState.item}
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleEdit}
          onDelete={handleDeleteFromEdit}
        />
      )}
    </section>
  );
}
