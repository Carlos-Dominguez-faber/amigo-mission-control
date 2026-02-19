"use client";

import type { TeamMember } from "@/features/team/types";

interface TeamCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
}

export const LAYER_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  human:  { label: "Human",  badgeClass: "bg-blue-500/20 text-blue-400" },
  agent:  { label: "Agent",  badgeClass: "bg-purple-500/20 text-purple-400" },
  system: { label: "System", badgeClass: "bg-gray-500/20 text-gray-400" },
};

const DEFAULT_LAYER = { label: "", badgeClass: "bg-[#272829] text-[#9aa0a6]" };

export function TeamCard({ member, onEdit }: TeamCardProps) {
  const layer = LAYER_CONFIG[member.layer] ?? { ...DEFAULT_LAYER, label: member.layer };
  const visibleSkills = member.skills?.slice(0, 4) ?? [];
  const extraCount = (member.skills?.length ?? 0) - 4;

  return (
    <article
      role="listitem"
      onClick={() => onEdit(member)}
      className="bg-[#16181a] border border-[#272829] rounded-lg p-4 cursor-pointer hover:border-[#3a3b3c] transition-colors border-l-4"
      style={{ borderLeftColor: member.color_hex ?? "#7c3aed" }}
    >
      {/* Top row: avatar + layer badge */}
      <div className="flex items-start justify-between">
        <span className="text-3xl leading-none">{member.avatar}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${layer.badgeClass}`}>
          {layer.label}
        </span>
      </div>

      {/* Name + Role */}
      <p className="text-sm font-semibold text-white mt-2">{member.name}</p>
      <p className="text-xs text-[#9aa0a6] mt-0.5">{member.role}</p>

      {/* Description */}
      {member.description && (
        <p className="text-xs text-[#9aa0a6] mt-2 line-clamp-2 leading-relaxed">
          {member.description}
        </p>
      )}

      {/* Skills */}
      {visibleSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="bg-white/5 text-gray-300 text-xs px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-xs text-[#9aa0a6]">+{extraCount} more</span>
          )}
        </div>
      )}
    </article>
  );
}
