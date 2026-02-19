"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { NavigationTabs, type TabId } from "@/features/dashboard/components/NavigationTabs";
import TaskBoard from "@/features/tasks/components/TaskBoard";
import ContentBoard from "@/features/content/components/ContentBoard";
import CalendarBoard from "@/features/calendar/components/CalendarBoard";
import MemoryBoard from "@/features/memory/components/MemoryBoard";
import TeamBoard from "@/features/team/components/TeamBoard";
import OfficeBoard from "@/features/office/components/OfficeBoard";
import DocsBoard from "@/features/documents/components/DocsBoard";
import CortexBoard from "@/features/cortex/components/CortexBoard";
import { DocumentPreviewModal } from "@/shared/components/DocumentPreviewModal";
import type { AvatarState } from "@/shared/components/AnimatedAvatar";
import { useTasks } from "@/features/tasks/hooks/useTasks";

function detectAvatarState(
  tasks: { assignee: string; status: string; updated_at: string }[]
): AvatarState {
  const amigoTasks = tasks.filter((t) => t.assignee === "amigo");

  // Working: Amigo has in-progress or recently updated todo tasks
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const amigoWorking = amigoTasks.some(
    (t) =>
      t.status === "in-progress" ||
      (t.status === "todo" && new Date(t.updated_at).getTime() > fiveMinutesAgo)
  );
  if (amigoWorking) return "working";

  // Thinking: Amigo has pending tasks (todo, not recently updated)
  const amigoPending = amigoTasks.some((t) => t.status !== "done");
  if (amigoPending) return "thinking";

  // Resting: Amigo has no pending tasks
  return "resting";
}

interface DocPreview {
  url: string;
  fileType: string;
  name: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const [previewDoc, setPreviewDoc] = useState<DocPreview | null>(null);
  const { tasks, isOnline } = useTasks();

  const avatarState = useMemo(() => detectAvatarState(tasks), [tasks]);

  return (
    <div className="min-h-screen bg-[#0b0c0e]">
      <DashboardHeader avatarState={avatarState} isOnline={isOnline} />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "tasks" && (
          <TaskBoard
            onDocumentPreview={(url: string, fileType: string, name: string) =>
              setPreviewDoc({ url, fileType, name })
            }
          />
        )}

        {activeTab === "content" && <ContentBoard />}

        {activeTab === "calendar" && <CalendarBoard />}

        {activeTab === "memory" && <MemoryBoard />}

        {activeTab === "team" && <TeamBoard />}

        {activeTab === "office" && <OfficeBoard />}

        {activeTab === "docs" && <DocsBoard />}

        {activeTab === "cortex" && <CortexBoard />}
      </main>

      {previewDoc && (
        <DocumentPreviewModal
          url={previewDoc.url}
          fileType={previewDoc.fileType}
          name={previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
