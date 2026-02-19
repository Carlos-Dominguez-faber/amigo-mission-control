"use client";

import type { OfficeAgent } from "@/features/office/types";
import { STATE_CONFIG } from "./office-constants";
import type { AgentState } from "./office-constants";
import { SpeechBubble } from "./SpeechBubble";

interface AgentSpriteProps {
  agent: OfficeAgent;
  onClick: () => void;
}

export function AgentSprite({ agent, onClick }: AgentSpriteProps) {
  const state = STATE_CONFIG[agent.agent_state as AgentState] ?? STATE_CONFIG.idle;
  const isIdle = agent.agent_state === "idle";
  const isExecuting = agent.agent_state === "executing";
  const colorHex = agent.color_hex ?? "#7c3aed";

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer group"
      style={{ width: 76 }}
      onClick={onClick}
    >
      {/* Speech bubble */}
      {agent.current_task && !isIdle && (
        <SpeechBubble text={agent.current_task} />
      )}

      {/* Status dot */}
      <div className="absolute -top-1 right-1 z-10">
        {!isIdle && (
          <div
            className={`w-2.5 h-2.5 rounded-full border border-[#0b0c0e] ${isExecuting ? "animate-pulse" : ""}`}
            style={{ backgroundColor: state.hex }}
          />
        )}
        {isIdle && (
          <span className="text-[10px] text-[#64748b] animate-bounce inline-block">Zz</span>
        )}
      </div>

      {/* Avatar container — pixel-art frame */}
      <div
        className={[
          "relative w-12 h-12 rounded-sm flex items-center justify-center border-2 transition-all pixel-art",
          isIdle ? "opacity-50" : "opacity-100",
          "group-hover:scale-110",
        ].join(" ")}
        style={{
          borderColor: colorHex,
          backgroundColor: `${colorHex}15`,
          boxShadow: !isIdle ? `0 0 12px ${state.hex}40` : "none",
        }}
      >
        <span className="text-2xl leading-none select-none">{agent.avatar}</span>
      </div>

      {/* Name */}
      <p
        className={[
          "text-[10px] font-medium text-center mt-1 w-full truncate",
          isIdle ? "text-[#64748b]" : "text-white",
        ].join(" ")}
      >
        {agent.name}
      </p>

      {/* Role */}
      <p className="text-[8px] text-[#9aa0a6] text-center w-full truncate">
        {agent.role}
      </p>

      {/* Progress bar */}
      {agent.task_progress != null && !isIdle && (
        <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${agent.task_progress}%`,
              backgroundColor: colorHex,
            }}
          />
        </div>
      )}
    </div>
  );
}
