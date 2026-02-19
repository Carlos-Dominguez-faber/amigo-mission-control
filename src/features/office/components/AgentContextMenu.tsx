"use client";

import { useEffect, useCallback, useState } from "react";
import { X } from "lucide-react";
import type { OfficeAgent } from "@/features/office/types";
import { ZONE_CONFIG, STATE_CONFIG, ZONE_ORDER } from "./office-constants";
import type { ZoneId, AgentState } from "./office-constants";

interface AgentContextMenuProps {
  agent: OfficeAgent;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<OfficeAgent>) => Promise<void>;
}

const STATE_ORDER: AgentState[] = ["executing", "planning", "reviewing", "idle"];

export function AgentContextMenu({ agent, onClose, onUpdate }: AgentContextMenuProps) {
  const [zone, setZone] = useState<ZoneId>(agent.zone as ZoneId);
  const [agentState, setAgentState] = useState<AgentState>(agent.agent_state as AgentState);
  const [currentTask, setCurrentTask] = useState(agent.current_task ?? "");
  const [taskProgress, setTaskProgress] = useState(agent.task_progress ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate(agent.id, {
        zone,
        agent_state: agentState,
        current_task: currentTask.trim() || undefined,
        task_progress: currentTask.trim() ? taskProgress : undefined,
        last_activity: new Date().toISOString(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  const colorHex = agent.color_hex ?? "#7c3aed";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#16181a] rounded-2xl border border-[#272829] w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#272829]">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center border-2 pixel-art"
            style={{ borderColor: colorHex, backgroundColor: `${colorHex}15` }}
          >
            <span className="text-xl">{agent.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
            <p className="text-xs text-[#9aa0a6]">{agent.role}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* Zone selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
              Move to
            </span>
            <div className="flex gap-2">
              {ZONE_ORDER.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZone(z)}
                  className={[
                    "flex-1 text-xs font-medium px-2 py-2 rounded-lg border transition-colors",
                    zone === z
                      ? "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30"
                      : "bg-[#0f1113] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
                  ].join(" ")}
                >
                  {ZONE_CONFIG[z].label}
                </button>
              ))}
            </div>
          </div>

          {/* State selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
              Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STATE_ORDER.map((s) => {
                const cfg = STATE_CONFIG[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAgentState(s)}
                    className={[
                      "text-xs font-medium px-2 py-2 rounded-lg border transition-colors flex items-center gap-1.5",
                      agentState === s
                        ? "border-current/30"
                        : "bg-[#0f1113] text-[#9aa0a6] border-[#272829] hover:border-[#3a3b3c]",
                    ].join(" ")}
                    style={agentState === s ? { color: cfg.hex, backgroundColor: `${cfg.hex}20` } : undefined}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${cfg.pulse && agentState === s ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: cfg.hex }}
                    />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current task */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agent-task" className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
              Current Task
            </label>
            <input
              id="agent-task"
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are they working on..."
              className="w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          {/* Progress */}
          {currentTask.trim() && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                Progress: {taskProgress}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={taskProgress}
                onChange={(e) => setTaskProgress(Number(e.target.value))}
                className="w-full accent-[#7c3aed]"
              />
            </div>
          )}

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : "Update Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
