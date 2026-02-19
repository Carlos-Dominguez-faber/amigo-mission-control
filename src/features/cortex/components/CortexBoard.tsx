"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCortex } from "@/features/cortex/hooks/useCortex";
import type { CortexItem } from "@/features/cortex/types";
import { CortexCard } from "./CortexCard";
import { CortexFilters } from "./CortexFilters";
import { CortexEmptyState } from "./CortexEmptyState";
import { CortexQuickAdd } from "./CortexQuickAdd";
import { CortexDetailModal } from "./CortexDetailModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "quickAdd" }
  | { mode: "detail"; item: CortexItem };

export default function CortexBoard() {
  const {
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
  } = useCortex();

  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading Cortex...</p>
      </div>
    );
  }

  return (
    <section aria-label="Cortex knowledge inbox">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Cortex</h2>
        <button
          type="button"
          onClick={() => setModalState({ mode: "quickAdd" })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Capture
        </button>
      </div>

      {/* Filters */}
      <CortexFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Empty state */}
      {items.length === 0 && (
        <CortexEmptyState
          hasFilters={statusFilter !== null || categoryFilter !== null}
          onCapture={() => setModalState({ mode: "quickAdd" })}
        />
      )}

      {/* Card grid */}
      {items.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          role="list"
          aria-label="Cortex items"
        >
          {items.map((item) => (
            <CortexCard
              key={item.id}
              item={item}
              onClick={() => setModalState({ mode: "detail", item })}
            />
          ))}
        </div>
      )}

      {/* Quick Add Modal */}
      {modalState.mode === "quickAdd" && (
        <CortexQuickAdd
          onAdd={async (data) => {
            await addItem(data);
          }}
          onClose={() => setModalState({ mode: "closed" })}
        />
      )}

      {/* Detail Modal */}
      {modalState.mode === "detail" && (
        <CortexDetailModal
          item={modalState.item}
          onClose={() => setModalState({ mode: "closed" })}
          onUpdateStatus={async (status) => {
            await updateItem(modalState.item.id, { status });
            setModalState({
              mode: "detail",
              item: { ...modalState.item, status },
            });
          }}
          onSendToAgent={async () => {
            await sendToAgent(modalState.item);
            setModalState({
              mode: "detail",
              item: { ...modalState.item, is_sent_to_agent: true },
            });
          }}
          onDelete={async () => {
            await removeItem(modalState.item);
          }}
        />
      )}
    </section>
  );
}
