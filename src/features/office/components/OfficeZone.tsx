"use client";

import { Monitor, Swords, Coffee } from "lucide-react";
import type { OfficeAgent } from "@/features/office/types";
import { ZONE_CONFIG } from "./office-constants";
import type { ZoneId } from "./office-constants";
import { AgentSprite } from "./AgentSprite";

interface OfficeZoneProps {
  zoneId: ZoneId;
  agents: OfficeAgent[];
  onAgentClick: (agent: OfficeAgent) => void;
}

const ZONE_ICONS: Record<ZoneId, React.ElementType> = {
  desk: Monitor,
  meeting: Swords,
  lobby: Coffee,
};

function WorkspaceFurniture() {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3 px-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          {/* Monitor */}
          <div className="w-8 h-5 bg-[#1a1c1e] border border-[#3a3b3c] rounded-sm">
            <div className="w-full h-0.5 bg-[#3a3b3c] mt-3" />
          </div>
          {/* Desk surface */}
          <div className="w-10 h-1.5 bg-[#272829] rounded-sm mt-0.5" />
        </div>
      ))}
    </div>
  );
}

function WarRoomFurniture() {
  return (
    <div className="flex justify-center mb-3">
      {/* Round table */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#1e1612] border-2 border-[#3a3530]" />
        {/* Chairs */}
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute w-3 h-3 rounded-full bg-[#272829] border border-[#3a3b3c]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translate(36px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LoungeFurniture() {
  return (
    <div className="flex items-center justify-center gap-4 mb-3">
      {/* Couch */}
      <div className="w-20 h-6 bg-[#1a1612] border border-[#3a3530] rounded-lg relative">
        <div className="absolute -left-1 top-0 w-2 h-6 bg-[#1a1612] border border-[#3a3530] rounded-l-lg" />
        <div className="absolute -right-1 top-0 w-2 h-6 bg-[#1a1612] border border-[#3a3530] rounded-r-lg" />
      </div>
      {/* Coffee table */}
      <div className="w-6 h-6 bg-[#272829] border border-[#3a3b3c] rounded-sm" />
    </div>
  );
}

const FURNITURE: Record<ZoneId, React.FC> = {
  desk: WorkspaceFurniture,
  meeting: WarRoomFurniture,
  lobby: LoungeFurniture,
};

export function OfficeZone({ zoneId, agents, onAgentClick }: OfficeZoneProps) {
  const config = ZONE_CONFIG[zoneId];
  const Icon = ZONE_ICONS[zoneId];
  const Furniture = FURNITURE[zoneId];

  return (
    <div
      className={`${config.bgClass} relative flex flex-col p-4 overflow-hidden min-h-[200px]`}
    >
      {/* Zone label */}
      <div className="flex items-center gap-1.5 mb-3">
        <Icon className="w-3 h-3 text-[#9aa0a6]" aria-hidden="true" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9aa0a6]">
          {config.label}
        </span>
        {agents.length > 0 && (
          <span className="text-[9px] text-[#64748b] ml-auto">{agents.length}</span>
        )}
      </div>

      {/* Furniture */}
      <Furniture />

      {/* Agents */}
      <div className="flex flex-wrap gap-8 justify-center items-end flex-1 pt-2">
        {agents.map((agent) => (
          <AgentSprite
            key={agent.id}
            agent={agent}
            onClick={() => onAgentClick(agent)}
          />
        ))}
      </div>
    </div>
  );
}
