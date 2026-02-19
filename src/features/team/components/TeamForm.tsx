"use client";

import { useState } from "react";
import type { TeamMember } from "@/features/team/types";

interface TeamFormProps {
  defaultValues?: Partial<TeamMember>;
  onSubmit: (data: Partial<TeamMember>) => Promise<void>;
  submitLabel: string;
}

const COLORS = [
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#22c55e", label: "Green" },
  { hex: "#a855f7", label: "Purple" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#eab308", label: "Yellow" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#f97316", label: "Orange" },
];

const PRESET_AVATARS = ["\u{1F464}", "\u{1F916}", "\u2699\uFE0F", "\u{1F9E0}", "\u{1F9BE}", "\u{1F6E0}\uFE0F", "\u{1F4E1}", "\u{1F527}", "\u{1F310}", "\u{1F680}"];

const LAYER_OPTIONS = [
  { value: "human", label: "Human" },
  { value: "agent", label: "Agent" },
  { value: "system", label: "System" },
];

const labelClassName = "text-xs font-medium text-[#9aa0a6] uppercase tracking-wider";

const inputClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 placeholder:text-[#9aa0a6]/50 focus:outline-none focus:border-[#7c3aed] transition-colors";

const selectClassName =
  "w-full bg-[#0f1113] border border-[#272829] text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#7c3aed] transition-colors";

export function TeamForm({ defaultValues, onSubmit, submitLabel }: TeamFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [role, setRole] = useState(defaultValues?.role ?? "");
  const [layer, setLayer] = useState(defaultValues?.layer ?? "human");
  const [avatar, setAvatar] = useState(defaultValues?.avatar ?? "\u{1F464}");
  const [colorHex, setColorHex] = useState(defaultValues?.color_hex ?? "#3b82f6");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [skillsRaw, setSkillsRaw] = useState((defaultValues?.skills ?? []).join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && role.trim().length > 0 && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const colorLabel = COLORS.find((c) => c.hex === colorHex)?.label.toLowerCase() ?? "custom";

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        role: role.trim(),
        description: description.trim() || undefined,
        avatar,
        skills,
        color: colorLabel,
        color_hex: colorHex,
        layer,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-name" className={labelClassName}>Name</label>
        <input
          id="member-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member name..."
          autoFocus
          className={inputClassName}
        />
      </div>

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-role" className={labelClassName}>Role</label>
        <input
          id="member-role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. AI Assistant, Developer..."
          className={inputClassName}
        />
      </div>

      {/* Layer */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-layer" className={labelClassName}>Layer</label>
        <select
          id="member-layer"
          value={layer}
          onChange={(e) => setLayer(e.target.value)}
          className={selectClassName}
        >
          {LAYER_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Avatar */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Avatar</span>
        <div className="flex gap-2 flex-wrap">
          {PRESET_AVATARS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className={[
                "w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all",
                avatar === emoji
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#16181a] bg-[#272829]"
                  : "bg-[#0f1113] hover:bg-[#272829]",
              ].join(" ")}
            >
              {emoji}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="Or type a custom emoji..."
          className={`${inputClassName} mt-1`}
        />
      </div>

      {/* Color pills */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Color</span>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColorHex(c.hex)}
              title={c.label}
              aria-label={c.label}
              aria-pressed={colorHex === c.hex}
              className={[
                "w-7 h-7 rounded-full transition-all",
                colorHex === c.hex
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#16181a] scale-110"
                  : "hover:scale-110",
              ].join(" ")}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-description" className={labelClassName}>Description</label>
        <textarea
          id="member-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
          rows={3}
          className={`${inputClassName} resize-none`}
        />
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-skills" className={labelClassName}>Skills</label>
        <input
          id="member-skills"
          type="text"
          value={skillsRaw}
          onChange={(e) => setSkillsRaw(e.target.value)}
          placeholder="e.g. TypeScript, React, SQL"
          className={inputClassName}
        />
        <p className="text-xs text-[#9aa0a6]/60">Comma-separated</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16181a]"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
