export type ZoneId = "desk" | "meeting" | "lobby";
export type AgentState = "executing" | "planning" | "idle" | "reviewing";

export interface ZoneConfig {
  label: string;
  bgClass: string;
}

export interface StateConfig {
  label: string;
  hex: string;
  pulse: boolean;
}

export const ZONE_CONFIG: Record<ZoneId, ZoneConfig> = {
  desk:    { label: "Workspace", bgClass: "bg-[#0d0f11]" },
  meeting: { label: "War Room",  bgClass: "bg-[#110d0d]" },
  lobby:   { label: "Lounge",    bgClass: "bg-[#0d1110]" },
};

export const STATE_CONFIG: Record<AgentState, StateConfig> = {
  executing: { label: "Working",   hex: "#10b981", pulse: true },
  planning:  { label: "Planning",  hex: "#3b82f6", pulse: false },
  idle:      { label: "Idle",      hex: "#64748b", pulse: false },
  reviewing: { label: "Reviewing", hex: "#eab308", pulse: false },
};

export const ZONE_ORDER: ZoneId[] = ["desk", "meeting", "lobby"];
