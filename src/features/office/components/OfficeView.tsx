"use client";

import { useMemo } from "react";
import type { OfficeAgent } from "@/features/office/types";
import type { ZoneId } from "./office-constants";
import { OfficeZone } from "./OfficeZone";

interface OfficeViewProps {
  agents: OfficeAgent[];
  onAgentClick: (agent: OfficeAgent) => void;
}

const FLOOR_TILE_STYLE: React.CSSProperties = {
  backgroundImage: [
    "linear-gradient(45deg, #13151700 25%, transparent 25%)",
    "linear-gradient(-45deg, #13151700 25%, transparent 25%)",
    "linear-gradient(45deg, transparent 75%, #13151700 75%)",
    "linear-gradient(-45deg, transparent 75%, #13151700 75%)",
  ].join(", "),
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
};

export function OfficeView({ agents, onAgentClick }: OfficeViewProps) {
  const agentsByZone = useMemo(() => {
    const grouped: Record<ZoneId, OfficeAgent[]> = { desk: [], meeting: [], lobby: [] };
    for (const agent of agents) {
      const zone = (agent.zone as ZoneId) in grouped ? (agent.zone as ZoneId) : "desk";
      grouped[zone].push(agent);
    }
    return grouped;
  }, [agents]);

  return (
    <div
      className="max-w-5xl mx-auto rounded-xl border-2 border-[#272829] overflow-hidden pixel-art bg-[#0b0c0e]"
      style={FLOOR_TILE_STYLE}
    >
      {/* Desktop: 2-column grid layout */}
      <div
        className="hidden md:grid min-h-[560px]"
        style={{
          gridTemplateAreas: `"workspace warroom" "workspace lounge"`,
          gridTemplateColumns: "1.8fr 1fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        <div className="border-r-2 border-[#272829]" style={{ gridArea: "workspace" }}>
          <OfficeZone zoneId="desk" agents={agentsByZone.desk} onAgentClick={onAgentClick} />
        </div>
        <div className="border-b-2 border-[#272829]" style={{ gridArea: "warroom" }}>
          <OfficeZone zoneId="meeting" agents={agentsByZone.meeting} onAgentClick={onAgentClick} />
        </div>
        <div style={{ gridArea: "lounge" }}>
          <OfficeZone zoneId="lobby" agents={agentsByZone.lobby} onAgentClick={onAgentClick} />
        </div>
      </div>

      {/* Mobile: stacked zones */}
      <div className="md:hidden flex flex-col divide-y-2 divide-[#272829]">
        <OfficeZone zoneId="desk" agents={agentsByZone.desk} onAgentClick={onAgentClick} />
        <OfficeZone zoneId="meeting" agents={agentsByZone.meeting} onAgentClick={onAgentClick} />
        <OfficeZone zoneId="lobby" agents={agentsByZone.lobby} onAgentClick={onAgentClick} />
      </div>
    </div>
  );
}
