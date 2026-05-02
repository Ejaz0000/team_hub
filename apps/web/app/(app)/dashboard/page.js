"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import GoalsPanel from "@/components/dashboard/GoalsPanel";
import AnnouncementsPanel from "@/components/dashboard/AnnouncementsPanel";
import ActionItemsPanel from "@/components/dashboard/ActionItemsPanel";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import OnlineUsersPanel from "@/components/dashboard/OnlineUsersPanel";
import useRealtime from "@/hooks/useRealtime";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const [role, setRole] = useState(null);
  const [activity, setActivity] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notificationKey, setNotificationKey] = useState(0);

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

  const handleRealtimeEvent = useCallback(
    (eventName) => {
      if (eventName === "notification.created") {
        setNotificationKey((prev) => prev + 1);
        pushActivity({
          title: "New notification received",
          meta: "Notifications",
          time: "just now"
        });
        return;
      }

      setRefreshKey((prev) => prev + 1);

      const labels = {
        "announcement.created": "Announcement posted",
        "comment.created": "New comment",
        "reaction.added": "New reaction",
        "goal.created": "Goal created",
        "goal.updated": "Goal updated",
        "actionItem.created": "Action item created",
        "actionItem.updated": "Action item updated",
        "status.updated": "Status updated"
      };

      pushActivity({
        title: labels[eventName] || "Realtime update",
        meta: "Realtime",
        time: "just now"
      });
    },
    [pushActivity]
  );

  const { onlineUsers } = useRealtime(activeWorkspaceId, {
    onEvent: handleRealtimeEvent
  });

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
        <AnalyticsPanel workspaceId={activeWorkspaceId} refreshKey={refreshKey} />
        <GoalsPanel
          workspaceId={activeWorkspaceId}
          onActivity={pushActivity}
          refreshKey={refreshKey}
        />
        <ActionItemsPanel
          workspaceId={activeWorkspaceId}
          onActivity={pushActivity}
          refreshKey={refreshKey}
        />
      </div>
      <div className="space-y-6">
        <AnnouncementsPanel
          workspaceId={activeWorkspaceId}
          isAdmin={role === "ADMIN"}
          onActivity={pushActivity}
          refreshKey={refreshKey}
        />
        <OnlineUsersPanel onlineUsers={onlineUsers} />
        <NotificationsPanel refreshKey={notificationKey} />
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}
