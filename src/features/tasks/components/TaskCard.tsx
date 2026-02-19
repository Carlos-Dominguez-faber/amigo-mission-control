"use client";

import type { Task, TaskStatus, Priority, Assignee } from "@/features/tasks/types";
import { User, Bot, Paperclip, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  documentCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: Priority) => void;
  onAssigneeChange: (assignee: Assignee) => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

const priorityConfig: Record<Priority, { label: string; className: string; dotColor: string }> = {
  high: {
    label: "High",
    className: "text-red-400 bg-red-400/10 border border-red-400/20",
    dotColor: "bg-red-400",
  },
  medium: {
    label: "Med",
    className: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
    dotColor: "bg-yellow-400",
  },
  low: {
    label: "Low",
    className: "text-[#9aa0a6] bg-[#9aa0a6]/10 border border-[#9aa0a6]/20",
    dotColor: "bg-[#9aa0a6]",
  },
};

const selectClassName =
  "bg-[#0f1113] border border-[#272829] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#7c3aed] cursor-pointer";

export default function TaskCard({
  task,
  documentCount,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDelete,
  children,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const isAmigo = task.assignee === "amigo";

  function handleDeleteClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onDelete();
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    onStatusChange(e.target.value as TaskStatus);
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    onPriorityChange(e.target.value as Priority);
  }

  function handleAssigneeToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onAssigneeChange(isAmigo ? "carlos" : "amigo");
  }

  return (
    <article
      className="bg-[#16181a] border border-[#272829] rounded-xl p-4 cursor-pointer hover:border-[#3a3b3c] transition-colors"
      role="listitem"
      aria-expanded={isExpanded}
    >
      {/* Clickable header area */}
      <div onClick={onToggleExpand} className="select-none">
        {/* Top row: priority badge + assignee icon + expand chevron */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2 py-0.5 ${priority.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priority.dotColor}`} aria-hidden="true" />
            {priority.label}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Assignee icon */}
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center bg-[#272829]"
              title={task.assignee === "amigo" ? "Amigo" : "Carlos"}
              aria-label={`Assigned to ${task.assignee}`}
            >
              {isAmigo ? (
                <Bot className="w-3.5 h-3.5 text-[#7c3aed]" aria-hidden="true" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#9aa0a6]" aria-hidden="true" />
              )}
            </span>

            {/* Expand / collapse chevron */}
            <span className="text-[#9aa0a6]" aria-hidden="true">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </div>
        </div>

        {/* Title */}
        <p
          className={`text-sm font-medium text-white leading-snug ${
            isExpanded ? "" : "line-clamp-2"
          }`}
        >
          {task.title}
        </p>

        {/* Description preview — only when collapsed and description exists */}
        {!isExpanded && task.description && (
          <p className="mt-1 text-xs text-[#9aa0a6] line-clamp-1">{task.description}</p>
        )}

        {/* Document badge */}
        {documentCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#9aa0a6] bg-[#272829] rounded-md px-2 py-0.5">
            <Paperclip className="w-3 h-3" aria-hidden="true" />
            <span>
              {documentCount} {documentCount === 1 ? "doc" : "docs"}
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3">
          {/* Children slot (TaskCardExpanded) */}
          {children}

          {/* Action bar */}
          <div
            className="mt-4 pt-3 border-t border-[#272829] flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Status dropdown */}
            <label className="sr-only" htmlFor={`status-${task.id}`}>
              Status
            </label>
            <select
              id={`status-${task.id}`}
              value={task.status}
              onChange={handleStatusChange}
              className={selectClassName}
              aria-label="Change status"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* Priority dropdown */}
            <label className="sr-only" htmlFor={`priority-${task.id}`}>
              Priority
            </label>
            <select
              id={`priority-${task.id}`}
              value={task.priority}
              onChange={handlePriorityChange}
              className={selectClassName}
              aria-label="Change priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Assignee toggle */}
            <button
              type="button"
              onClick={handleAssigneeToggle}
              className="inline-flex items-center gap-1.5 text-xs text-[#9aa0a6] bg-[#0f1113] border border-[#272829] rounded-lg px-2 py-1.5 hover:border-[#7c3aed] hover:text-white transition-colors"
              aria-label={`Toggle assignee (currently ${task.assignee})`}
            >
              {isAmigo ? (
                <Bot className="w-3.5 h-3.5 text-[#7c3aed]" aria-hidden="true" />
              ) : (
                <User className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {task.assignee === "amigo" ? "Amigo" : "Carlos"}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-2 py-1.5 hover:bg-red-400/20 transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
