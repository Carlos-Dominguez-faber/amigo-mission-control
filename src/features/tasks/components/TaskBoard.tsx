"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { Task, TaskStatus } from "@/features/tasks/types";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import TaskCardExpanded from "./TaskCardExpanded";
import TaskForm from "./TaskForm";

interface TaskBoardProps {
  onDocumentPreview: (url: string, fileType: string, name: string) => void;
}

const COLUMNS: { status: TaskStatus; key: string }[] = [
  { status: "todo", key: "todo" },
  { status: "in-progress", key: "in-progress" },
  { status: "done", key: "done" },
];

export default function TaskBoard({ onDocumentPreview }: TaskBoardProps) {
  const {
    tasks,
    isLoaded,
    isOnline,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskAssignee,
    updateTaskNotes,
    deleteTask,
  } = useTasks();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Memoize tasks grouped by status
  const tasksByStatus = useMemo(() => {
    const todo: Task[] = [];
    const inProgress: Task[] = [];
    const done: Task[] = [];

    for (const task of tasks) {
      if (task.status === "todo") todo.push(task);
      else if (task.status === "in-progress") inProgress.push(task);
      else done.push(task);
    }

    return { todo, "in-progress": inProgress, done };
  }, [tasks]);

  function handleToggleExpand(taskId: string) {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading tasks...</p>
      </div>
    );
  }

  return (
    <section aria-label="Task board" className="relative">
      {/* Online / offline indicator */}
      <div
        className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-[#9aa0a6]"
        aria-live="polite"
        aria-label={isOnline ? "Connected" : "Offline — using local data"}
      >
        <span
          className={`w-2 h-2 rounded-full ${isOnline ? "bg-[#10b981]" : "bg-yellow-400"}`}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
      </div>

      {/* New task form */}
      <TaskForm onSubmit={addTask} />

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-white">No tasks yet</p>
          <p className="text-xs text-[#9aa0a6]">
            Add your first task above to get started.
          </p>
        </div>
      )}

      {/* Three-column Kanban grid */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {COLUMNS.map(({ status }) => {
            const columnTasks = tasksByStatus[status];

            return (
              <TaskColumn key={status} status={status} count={columnTasks.length}>
                {columnTasks.map((task) => {
                  const isExpanded = expandedTaskId === task.id;

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      documentCount={0}
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleExpand(task.id)}
                      onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
                      onPriorityChange={(newPriority) =>
                        updateTaskPriority(task.id, newPriority)
                      }
                      onAssigneeChange={(newAssignee) =>
                        updateTaskAssignee(task.id, newAssignee)
                      }
                      onDelete={() => deleteTask(task.id)}
                    >
                      {isExpanded && (
                        <TaskCardExpanded
                          task={task}
                          onNotesChange={(notes) => updateTaskNotes(task.id, notes)}
                          onDocumentPreview={onDocumentPreview}
                        />
                      )}
                    </TaskCard>
                  );
                })}
              </TaskColumn>
            );
          })}
        </div>
      )}
    </section>
  );
}
