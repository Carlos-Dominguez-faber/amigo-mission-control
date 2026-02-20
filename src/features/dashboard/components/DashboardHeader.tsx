"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnimatedAvatar, { type AvatarState } from "@/shared/components/AnimatedAvatar";
import { LogOut, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  avatarState: AvatarState;
  isOnline: boolean;
}

export function DashboardHeader({ avatarState, isOnline }: DashboardHeaderProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function handleRefresh() {
    setRefreshing(true);
    window.dispatchEvent(new CustomEvent("app:refresh"));
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0b0c0e]/80 backdrop-blur-md border-b border-[#272829] overflow-visible">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Left: avatar + title */}
        <div className="flex items-center gap-3">
          <AnimatedAvatar state={avatarState} size="sm" />
          <span className="text-lg font-semibold text-white">Mission Control</span>
        </div>

        {/* Right: refresh + online status + logout */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Refresh data"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>

          <div className="flex items-center gap-1.5" aria-label={isOnline ? "Online" : "Offline"}>
            <span
              className={[
                "w-2 h-2 rounded-full",
                isOnline ? "bg-green-400" : "bg-yellow-400",
              ].join(" ")}
              role="status"
              aria-hidden="true"
            />
            <span className="text-xs text-[#9aa0a6] hidden sm:inline">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <button
            type="button"
            aria-label="Sign out"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
