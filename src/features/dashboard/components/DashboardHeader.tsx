"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AnimatedAvatar, { type AvatarState } from "@/shared/components/AnimatedAvatar";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  avatarState: AvatarState;
  isOnline: boolean;
}

export function DashboardHeader({ avatarState, isOnline }: DashboardHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0b0c0e]/80 backdrop-blur-md border-b border-[#272829]">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 h-14">
        {/* Left: avatar + title */}
        <div className="flex items-center gap-3">
          <AnimatedAvatar state={avatarState} size="sm" />
          <span className="text-lg font-semibold text-white">Mission Control</span>
        </div>

        {/* Right: online status + logout */}
        <div className="flex items-center gap-3">
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
