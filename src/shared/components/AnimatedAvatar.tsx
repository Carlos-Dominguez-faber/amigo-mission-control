"use client";

import { useState } from "react";

export type AvatarState = "working" | "thinking" | "resting";

interface AnimatedAvatarProps {
  state: AvatarState;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const stateConfig = {
  working: {
    label: "Working",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  thinking: {
    label: "Thinking",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  resting: {
    label: "Resting",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30",
  },
};

export default function AnimatedAvatar({ state = "resting", size = "md", className = "" }: AnimatedAvatarProps) {
  const config = stateConfig[state];

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${config.bgColor} border ${config.borderColor} ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="15" width="80" height="70" rx="35" fill="#ff6b00" />
            <rect x="15" y="30" width="70" height="35" rx="8" fill="#1a1a2e" />
            <g className={state === "resting" ? "hidden" : ""}>
              <circle cx="32" cy="45" r="12" fill="#06b6d4" className={state !== "resting" ? "animate-pulse" : ""} />
              <circle cx="32" cy="45" r="8" fill="#22d3ee" />
              <circle cx="32" cy="45" r="4" fill="#67e8f9" />
              <circle cx="29" cy="42" r="2" fill="#fff" className="opacity-80" />
            </g>
            <g className={state === "resting" ? "" : "hidden"}>
              <path d="M20 45 Q32 50 44 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            </g>
            <g className={state === "resting" ? "hidden" : ""}>
              <circle cx="68" cy="45" r="12" fill="#06b6d4" className={state !== "resting" ? "animate-pulse" : ""} />
              <circle cx="68" cy="45" r="8" fill="#22d3ee" />
              <circle cx="68" cy="45" r="4" fill="#67e8f9" />
              <circle cx="65" cy="42" r="2" fill="#fff" className="opacity-80" />
            </g>
            <g className={state === "resting" ? "" : "hidden"}>
              <path d="M56 45 Q68 50 80 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            </g>
            <path d="M35 58 Q50 68 65 58" stroke={state === "resting" ? "#666" : "#fff"} strokeWidth="3" fill="none" strokeLinecap="round" className={state === "resting" ? "opacity-50" : ""} />
            <line x1="50" y1="15" x2="50" y2="5" stroke="#ff6b00" strokeWidth="3" />
            <circle cx="50" cy="4" r="3" fill={state === "working" ? "#ff6b00" : state === "thinking" ? "#fbbf24" : "#6b7280"} className={state === "thinking" ? "animate-pulse" : ""} />
            <circle cx="10" cy="45" r="6" fill="#14b8a6" />
            <circle cx="90" cy="45" r="6" fill="#14b8a6" />
          </svg>
        </div>
        {state === "thinking" && (
          <div className="absolute inset-0 animate-pulse opacity-30 bg-cyan-500 rounded-full" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        <span className="text-xs text-zinc-500">Amigo</span>
      </div>
    </div>
  );
}
