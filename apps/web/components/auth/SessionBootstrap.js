"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function SessionBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const syncFromUser = useWorkspaceStore((state) => state.syncFromUser);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    syncFromUser(user);
  }, [user, syncFromUser]);

  return null;
}
