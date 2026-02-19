"use client";

import {
  CheckSquare,
  Film,
  Calendar,
  Brain,
  Users,
  Building2,
  FolderOpen,
} from "lucide-react";

export type TabId = "tasks" | "content" | "calendar" | "memory" | "team" | "office" | "docs";

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

interface TabConfig {
  id: TabId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: "tasks", label: "Tasks", Icon: CheckSquare },
  { id: "content", label: "Content", Icon: Film },
  { id: "calendar", label: "Calendar", Icon: Calendar },
  { id: "memory", label: "Memory", Icon: Brain },
  { id: "team", label: "Team", Icon: Users },
  { id: "office", label: "Office", Icon: Building2 },
  { id: "docs", label: "Docs", Icon: FolderOpen },
];

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <nav aria-label="Main navigation" className="border-b border-[#272829]">
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${id}-panel`}
              id={`${id}-tab`}
              onClick={() => onTabChange(id)}
              className={[
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]",
                isActive
                  ? "bg-[#7c3aed] text-white"
                  : "text-[#9aa0a6] hover:bg-[#272829] hover:text-white",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
