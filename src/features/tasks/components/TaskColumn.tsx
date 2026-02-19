"use client";

import type { TaskStatus } from "@/features/tasks/types";

interface TaskColumnProps {
  status: TaskStatus;
  count: number;
  children: React.ReactNode;
}

const config: Record<TaskStatus, { label: string; color: string }> = {
  "todo": { label: "To Do", color: "bg-[#9aa0a6]" },
  "in-progress": { label: "In Progress", color: "bg-[#6366f1]" },
  "done": { label: "Done", color: "bg-[#10b981]" },
};

export default function TaskColumn({ status, count, children }: TaskColumnProps) {
  const { label, color } = config[status];

  return (
    <div className="flex flex-col min-h-[200px]">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white tracking-wide">{label}</h2>
        <span
          className="ml-auto text-xs font-medium text-[#9aa0a6] bg-[#272829] rounded-full px-2 py-0.5 min-w-[22px] text-center"
          aria-label={`${count} tasks`}
        >
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col space-y-3" role="list" aria-label={`${label} tasks`}>
        {children}
      </div>
    </div>
  );
}
