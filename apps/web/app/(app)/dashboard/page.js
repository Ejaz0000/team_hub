"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import GoalsPanel from "@/components/dashboard/GoalsPanel";
import AnnouncementsPanel from "@/components/dashboard/AnnouncementsPanel";
import ActionItemsPanel from "@/components/dashboard/ActionItemsPanel";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const [role, setRole] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!activeWorkspaceId || !user) {
      return;
    }

    let mounted = true;
    api
      .get(`/workspaces/${activeWorkspaceId}/members`)
      .then((data) => {
        if (!mounted) {
          return;
        }
        const current = (data.members || []).find((member) => member.userId === user.id);
        setRole(current?.role || "MEMBER");
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [activeWorkspaceId, user]);

  const pushActivity = (entry) => {
    setActivity((prev) => {
      const next = [{ id: `${Date.now()}-${Math.random()}`, ...entry }, ...prev];
      return next.slice(0, 8);
    });
  };

  if (!activeWorkspaceId) {
    return (
      <div className="surface-card rounded-3xl p-8">
        <h2 className="text-xl font-semibold text-white">Pick a workspace</h2>
        <p className="mt-2 text-sm text-slate-400">
          Use the workspace switcher in the sidebar to set the active workspace id.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <GoalsPanel workspaceId={activeWorkspaceId} onActivity={pushActivity} />
        <ActionItemsPanel workspaceId={activeWorkspaceId} onActivity={pushActivity} />
      </div>
      <div className="space-y-6">
        <AnnouncementsPanel
          workspaceId={activeWorkspaceId}
          isAdmin={role === "ADMIN"}
          onActivity={pushActivity}
        />
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}
