"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useMemories } from "@/features/memory/hooks/useMemories";
import type { Memory } from "@/features/memory/types";
import { MemoryCard, MEMORY_TYPE_CONFIG } from "./MemoryCard";
import { MemoryModal } from "./MemoryModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; memory: Memory };

const FILTER_OPTIONS = [
  { value: null, label: "All" },
  ...Object.entries(MEMORY_TYPE_CONFIG).map(([value, { label }]) => ({ value, label })),
];

export default function MemoryBoard() {
  const { memories, isLoaded, addMemory, updateMemory, deleteMemory } = useMemories();
  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeFilter ? memories.filter((m) => m.memory_type === activeFilter) : memories),
    [memories, activeFilter]
  );

  async function handleAdd(data: Partial<Memory>) {
    await addMemory(data);
  }

  async function handleEdit(data: Partial<Memory>) {
    if (modalState.mode !== "edit") return;
    await updateMemory(modalState.memory.id, data);
  }

  async function handleDelete() {
    if (modalState.mode !== "edit") return;
    await deleteMemory(modalState.memory.id);
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading memories...</p>
      </div>
    );
  }

  return (
    <section aria-label="Memory log">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Memory Log</h2>
        <button
          type="button"
          onClick={() => setModalState({ mode: "add" })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Memory
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          const activeClass =
            opt.value === null
              ? "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30"
              : MEMORY_TYPE_CONFIG[opt.value]
                ? `${MEMORY_TYPE_CONFIG[opt.value].badgeClass} border-current/30`
                : "";
          return (
            <button
              key={opt.value ?? "all"}
              type="button"
              onClick={() => setActiveFilter(opt.value)}
              className={[
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                isActive
                  ? activeClass
                  : "bg-[#16181a] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-white">
            {activeFilter ? "No memories of this type" : "No memories yet"}
          </p>
          <p className="text-xs text-[#9aa0a6]">
            {activeFilter
              ? "Try a different filter or create a new memory."
              : "Click \"New Memory\" to add your first entry."}
          </p>
        </div>
      )}

      {/* Memory list */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3" role="list" aria-label="Memories">
          {filtered.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={() => setModalState({ mode: "edit", memory })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modalState.mode === "add" && (
        <MemoryModal
          mode="add"
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleAdd}
        />
      )}

      {modalState.mode === "edit" && (
        <MemoryModal
          mode="edit"
          memory={modalState.memory}
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
