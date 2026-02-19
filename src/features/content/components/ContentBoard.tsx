"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useContent } from "@/features/content/hooks/useContent";
import type { ContentItem, ContentStage } from "@/features/content/types";
import { ContentColumn } from "./ContentColumn";
import { ContentCard } from "./ContentCard";
import { ContentStatsBar } from "./ContentStatsBar";
import { ContentModal } from "./ContentModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; item: ContentItem };

const STAGES: ContentStage[] = ["idea", "script", "thumbnail", "filming", "editing", "published"];

export default function ContentBoard() {
  const { items, isLoaded, addContent, updateContent, deleteContent } = useContent();
  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });

  const itemsByStage = useMemo(() => {
    const map: Record<ContentStage, ContentItem[]> = {
      idea: [], script: [], thumbnail: [], filming: [], editing: [], published: [],
    };
    for (const item of items) {
      map[item.stage].push(item);
    }
    return map;
  }, [items]);

  const counts = useMemo(() => {
    const c: Record<ContentStage, number> = {
      idea: 0, script: 0, thumbnail: 0, filming: 0, editing: 0, published: 0,
    };
    for (const stage of STAGES) {
      c[stage] = itemsByStage[stage].length;
    }
    return c;
  }, [itemsByStage]);

  async function handleAdd(data: Partial<ContentItem>) {
    await addContent(data);
  }

  async function handleEdit(data: Partial<ContentItem>) {
    if (modalState.mode !== "edit") return;
    await updateContent(modalState.item.id, data);
  }

  async function handleDelete() {
    if (modalState.mode !== "edit") return;
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
      <ContentStatsBar counts={counts} />

      {/* Add button */}
      <button
        type="button"
        onClick={() => setModalState({ mode: "add" })}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        New Idea
      </button>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-white">No content yet</p>
          <p className="text-xs text-[#9aa0a6]">
            Click &quot;New Idea&quot; to start your content pipeline.
          </p>
        </div>
      )}

      {/* Horizontal scroll Kanban */}
      {items.length > 0 && (
        <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => (
              <ContentColumn key={stage} stage={stage} count={counts[stage]}>
                {itemsByStage[stage].map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onEdit={() => setModalState({ mode: "edit", item })}
                  />
                ))}
              </ContentColumn>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalState.mode === "add" && (
        <ContentModal
          mode="add"
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleAdd}
        />
      )}

      {modalState.mode === "edit" && (
        <ContentModal
          mode="edit"
          item={modalState.item}
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
