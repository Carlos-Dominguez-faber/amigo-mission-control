"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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

interface AmigoOfficeState {
  agent_state: string;
  last_activity: string | null;
}

function detectAvatarState(
  tasks: { assignee: string; status: string; updated_at: string }[],
  officeState: AmigoOfficeState | null
): AvatarState {
  // Signal 1: Office agent status (most reliable — agent updates this directly)
  if (officeState) {
    const isActive = officeState.agent_state === "executing" || officeState.agent_state === "planning" || officeState.agent_state === "reviewing";
    if (isActive) {
      // Check if last_activity is recent (within 10 minutes)
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      const lastActivity = officeState.last_activity ? new Date(officeState.last_activity).getTime() : 0;
      if (lastActivity > tenMinutesAgo) {
        return officeState.agent_state === "executing" ? "working" : "thinking";
      }
    }
  }

  // Signal 2: Task status (fallback)
  const amigoTasks = tasks.filter((t) => t.assignee.toLowerCase() === "amigo");

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const amigoWorking = amigoTasks.some(
    (t) =>
      t.status === "in-progress" ||
      (t.status === "todo" && new Date(t.updated_at).getTime() > fiveMinutesAgo)
  );
  if (amigoWorking) return "working";

  const amigoPending = amigoTasks.some((t) => t.status !== "done");
  if (amigoPending) return "thinking";

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

  // Lightweight office agent query for avatar (separate from OfficeBoard's useOffice)
  const [amigoOffice, setAmigoOffice] = useState<AmigoOfficeState | null>(null);

  const loadAmigoOffice = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("office_agents")
        .select("agent_state, last_activity")
        .ilike("name", "%amigo%")
        .limit(1)
        .single();

      if (data) setAmigoOffice(data as AmigoOfficeState);
    } catch {
      // Non-critical
    }
  }, []);

  // Initial load + Realtime for office_agents
  useEffect(() => {
    loadAmigoOffice();

    const channel = supabase
      .channel("avatar-office-rt")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "office_agents" },
        () => { loadAmigoOffice(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadAmigoOffice]);

  // Poll office status every 15s (more frequent for avatar responsiveness)
  useEffect(() => {
    const id = setInterval(loadAmigoOffice, 15_000);
    return () => clearInterval(id);
  }, [loadAmigoOffice]);

  // PWA: refetch office on visibility change + manual refresh
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") loadAmigoOffice();
    }
    function handleRefresh() { loadAmigoOffice(); }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("app:refresh", handleRefresh);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("app:refresh", handleRefresh);
    };
  }, [loadAmigoOffice]);

  const avatarState = useMemo(
    () => detectAvatarState(tasks, amigoOffice),
    [tasks, amigoOffice]
  );

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
