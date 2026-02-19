"use client";

import { useState } from "react";
import { useOffice } from "@/features/office/hooks/useOffice";
import type { OfficeAgent } from "@/features/office/types";
import { OfficeView } from "./OfficeView";
import { AgentContextMenu } from "./AgentContextMenu";

export default function OfficeBoard() {
  const { agents, isLoaded, updateAgent } = useOffice();
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgent | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading office...</p>
      </div>
    );
  }

  return (
    <section aria-label="Virtual office">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-white">Virtual Office</h2>
        <div className="flex items-center gap-3 text-[9px] text-[#9aa0a6]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" /> Working
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Planning
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#eab308]" /> Reviewing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#64748b]" /> Idle
          </span>
        </div>
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-white">The office is empty</p>
          <p className="text-xs text-[#9aa0a6]">
            Seed agents in the office_agents table to see them here.
          </p>
        </div>
      )}

      {/* Office world */}
      {agents.length > 0 && (
        <OfficeView
          agents={agents}
          onAgentClick={(agent) => setSelectedAgent(agent)}
        />
      )}

      {/* Agent context menu */}
      {selectedAgent && (
        <AgentContextMenu
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdate={async (id, updates) => {
            await updateAgent(id, updates);
            setSelectedAgent(null);
          }}
        />
      )}
    </section>
  );
}
