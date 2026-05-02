"use client";

import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Button from "@/components/ui/Button";
import AvatarUpload from "@/components/dashboard/AvatarUpload";

export default function TopBar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Workspace</p>
        <p className="text-sm text-white">{activeWorkspaceId || "None"}</p>
      </div>
      <div className="flex items-center gap-3">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "User"}
            className="h-8 w-8 rounded-full border border-slate-700 object-cover"
          />
        ) : null}
        <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
          {user?.email || "Anonymous"}
        </div>
        <AvatarUpload />
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
