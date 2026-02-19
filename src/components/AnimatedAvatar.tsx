"use client";

import { useState, useEffect } from "react";

type AvatarState = "working" | "thinking" | "resting";

interface AnimatedAvatarProps {
  state: AvatarState;
  size?: "sm" | "md" | "lg";
}

const stateConfig = {
  working: {
    label: "Working",
    emoji: "⚡",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  thinking: {
    label: "Thinking",
    emoji: "🤔",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  resting: {
    label: "Resting",
    emoji: "💤",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30",
  },
};

function AvatarIcon({ state, size }: { state: AvatarState; size: string }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const animation = {
    working: "animate-pulse",
    thinking: "animate-bounce",
    resting: "animate-pulse opacity-50",
  };

  return (
    <div
      className={`${sizeClasses[size as keyof typeof sizeClasses]} rounded-full flex items-center justify-center ${animation[state]} bg-gradient-to-br from-orange-500 to-orange-600`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body/Armor */}
        <path
          d="M50 10 L75 25 L80 60 L70 90 L30 90 L20 60 L25 25 Z"
          fill="#ff6b00"
          stroke="#cc5500"
          strokeWidth="2"
        />
        {/* Teal pattern */}
        <path
          d="M35 40 L50 35 L65 40 L65 70 L50 75 L35 70 Z"
          fill="#14b8a6"
        />
        {/* Eyes */}
        <rect x="35" y="30" width="12" height="8" rx="2" fill="#06b6d4" className={state === "thinking" ? "animate-pulse" : ""} />
        <rect x="53" y="30" width="12" height="8" rx="2" fill="#06b6d4" className={state === "thinking" ? "animate-pulse" : ""} />
        {/* Smile */}
        <path
          d="M40 55 Q50 65 60 55"
          stroke="#fff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className={state === "resting" ? "opacity-50" : ""}
        />
        {/* Antenna */}
        <line x1="50" y1="10" x2="50" y2="2" stroke="#ff6b00" strokeWidth="3" />
        <circle cx="50" cy="2" r="3" fill={state === "working" ? "#ff6b00" : state === "thinking" ? "#fbbf24" : "#6b7280"} className="animate-pulse" />
      </svg>
    </div>
  );
}

export default function AnimatedAvatar({ state = "resting", size = "md" }: AnimatedAvatarProps) {
  const config = stateConfig[state];

  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${config.bgColor} border ${config.borderColor}`}
    >
      <AvatarIcon state={state} size={size} />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${config.color}`}>
          {config.emoji} {config.label}
        </span>
        <span className="text-xs text-zinc-500">Amigo</span>
      </div>
    </div>
  );
}

// Demo component with state controls
export function AvatarDemo() {
  const [state, setState] = useState<AvatarState>("resting");

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <AnimatedAvatar state={state} size="lg" />
      
      <div className="flex gap-2">
        <button
          onClick={() => setState("working")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            state === "working"
              ? "bg-orange-500 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          ⚡ Working
        </button>
        <button
          onClick={() => setState("thinking")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            state === "thinking"
              ? "bg-yellow-500 text-black"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          🤔 Thinking
        </button>
        <button
          onClick={() => setState("resting")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            state === "resting"
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          💤 Resting
        </button>
      </div>
    </div>
  );
}
