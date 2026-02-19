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
import { DocumentPreviewModal } from "@/features/tasks/components/DocumentPreviewModal";
import type { AvatarState } from "@/shared/components/AnimatedAvatar";
import { useTasks } from "@/features/tasks/hooks/useTasks";

function detectAvatarState(
  tasks: { assignee: string; status: string; updated_at: string }[]
): AvatarState {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const amigoActive = tasks.some(
    (t) =>
      t.assignee === "amigo" &&
      (t.status === "in-progress" || t.status === "todo") &&
      new Date(t.updated_at).getTime() > fiveMinutesAgo
  );
  if (amigoActive) return "working";
  if (tasks.some((t) => t.status !== "done")) return "thinking";
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

        {activeTab !== "tasks" && activeTab !== "content" && activeTab !== "calendar" && activeTab !== "memory" && activeTab !== "team" && activeTab !== "office" && (
          <div className="text-center py-20 text-[#9aa0a6]">
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm mt-1">This feature is under development.</p>
          </div>
        )}
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
