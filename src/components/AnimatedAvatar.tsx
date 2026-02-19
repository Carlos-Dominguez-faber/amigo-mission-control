"use client";

import { useState, useEffect } from "react";

export type AvatarState = "working" | "thinking" | "resting";

interface AnimatedAvatarProps {
  state: AvatarState;
  size?: "sm" | "md" | "lg";
  className?: string;
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

export default function AnimatedAvatar({ state = "resting", size = "md", className = "" }: AnimatedAvatarProps) {
  const config = stateConfig[state];
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32",
  };

  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${config.bgColor} border ${config.borderColor} ${className}`}
    >
      {/* Face Container */}
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600`}>
        {/* Helmet/Head shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Robot face SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head/helmet background */}
            <rect x="10" y="15" width="80" height="70" rx="35" fill="#ff6b00" />
            
            {/* Visor (dark area) */}
            <rect x="15" y="30" width="70" height="35" rx="8" fill="#1a1a2e" />
            
            {/* Left Eye - cyan glow */}
            <g className={state === "resting" ? "hidden" : ""}>
              {/* Eye glow effect */}
              <circle cx="32" cy="45" r="12" fill="#06b6d4" className={`
                ${state === "thinking" ? "animate-pulse" : ""}
                ${state === "working" ? "animate-pulse" : ""}
              `} />
              {/* Eye pixel pattern */}
              <circle cx="32" cy="45" r="8" fill="#22d3ee" />
              <circle cx="32" cy="45" r="4" fill="#67e8f9" />
              {/* Eye highlight */}
              <circle cx="29" cy="42" r="2" fill="#fff" className="opacity-80" />
            </g>
            
            {/* Left Eye Closed - for resting */}
            <g className={state === "resting" ? "" : "hidden"}>
              <path d="M20 45 Q32 50 44 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            </g>
            
            {/* Right Eye - cyan glow */}
            <g className={state === "resting" ? "hidden" : ""}>
              <circle cx="68" cy="45" r="12" fill="#06b6d4" className={`
                ${state === "thinking" ? "animate-pulse" : ""}
                ${state === "working" ? "animate-pulse" : ""}
              `} />
              <circle cx="68" cy="45" r="8" fill="#22d3ee" />
              <circle cx="68" cy="45" r="4" fill="#67e8f9" />
              <circle cx="65" cy="42" r="2" fill="#fff" className="opacity-80" />
            </g>
            
            {/* Right Eye Closed - for resting */}
            <g className={state === "resting" ? "" : "hidden"}>
              <path d="M56 45 Q68 50 80 45" stroke="#06b6d4" strokeWidth="2" fill="none" />
            </g>
            
            {/* Smile */}
            <path 
              d="M35 58 Q50 68 65 58" 
              stroke={state === "resting" ? "#666" : "#fff"} 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              className={state === "resting" ? "opacity-50" : ""}
            />
            
            {/* Antenna */}
            <line x1="50" y1="15" x2="50" y2="5" stroke="#ff6b00" strokeWidth="3" />
            <circle 
              cx="50" 
              cy="4" 
              r="3" 
              fill={state === "working" ? "#ff6b00" : state === "thinking" ? "#fbbf24" : "#6b7280"} 
              className={state === "thinking" ? "animate-pulse" : ""}
            />
            
            {/* Ear housings */}
            <circle cx="10" cy="45" r="6" fill="#14b8a6" />
            <circle cx="90" cy="45" r="6" fill="#14b8a6" />
          </svg>
        </div>
        
        {/* Animations overlay */}
        {state === "thinking" && (
          <div className="absolute inset-0 animate-pulse opacity-30 bg-cyan-500 rounded-full" />
        )}
      </div>
      
      {/* Status Label */}
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
    <div className="flex flex-col items-center gap-6 p-8 bg-zinc-950 min-h-screen">
      <h2 className="text-xl font-bold text-white mb-4">Avatar States</h2>
      
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
      
      <p className="text-zinc-500 text-sm mt-4 text-center">
        Auto-detects from tasks:<br/>
        • Working = tasks in progress<br/>
        • Thinking = pending tasks exist<br/>
        • Resting = no active tasks
      </p>
    </div>
  );
}
