"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useTeam } from "@/features/team/hooks/useTeam";
import type { TeamMember } from "@/features/team/types";
import { TeamCard, LAYER_CONFIG } from "./TeamCard";
import { TeamModal } from "./TeamModal";

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; member: TeamMember };

const FILTER_OPTIONS = [
  { value: null, label: "All" },
  ...Object.entries(LAYER_CONFIG).map(([value, { label }]) => ({ value, label })),
];

export default function TeamBoard() {
  const { members, isLoaded, addMember, updateMember, deleteMember } = useTeam();
  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeFilter ? members.filter((m) => m.layer === activeFilter) : members),
    [members, activeFilter]
  );

  async function handleAdd(data: Partial<TeamMember>) {
    await addMember(data);
  }

  async function handleEdit(data: Partial<TeamMember>) {
    if (modalState.mode !== "edit") return;
    await updateMember(modalState.member.id, data);
  }

  async function handleDelete() {
    if (modalState.mode !== "edit") return;
    await deleteMember(modalState.member.id);
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading team...</p>
      </div>
    );
  }

  return (
    <section aria-label="Team directory">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Team</h2>
        <button
          type="button"
          onClick={() => setModalState({ mode: "add" })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Member
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          const activeClass =
            opt.value === null
              ? "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30"
              : LAYER_CONFIG[opt.value]
                ? `${LAYER_CONFIG[opt.value].badgeClass} border-current/30`
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
            {activeFilter ? "No members in this layer" : "No team members yet"}
          </p>
          <p className="text-xs text-[#9aa0a6]">
            {activeFilter
              ? "Try a different filter or add a new member."
              : "Click \"Add Member\" to create your first team member."}
          </p>
        </div>
      )}

      {/* Team grid */}
      {filtered.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Team members"
        >
          {filtered.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
              onEdit={() => setModalState({ mode: "edit", member })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modalState.mode === "add" && (
        <TeamModal
          mode="add"
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleAdd}
        />
      )}

      {modalState.mode === "edit" && (
        <TeamModal
          mode="edit"
          member={modalState.member}
          onClose={() => setModalState({ mode: "closed" })}
          onSubmit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
