import { create } from "zustand";
import api from "@/lib/api";

export const useWorkspaceStore = create((set) => ({
  activeWorkspaceId: null,
  status: "idle",
  error: null,
  setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
  syncFromUser: (user) => set({ activeWorkspaceId: user?.activeWorkspaceId || null }),
  switchWorkspace: async (workspaceId) => {
    if (!workspaceId) {
      set({ error: "Workspace id is required", status: "error" });
      return { ok: false, error: "Workspace id is required" };
    }

    set({ status: "loading", error: null });
    try {
      const data = await api.post(`/workspaces/${workspaceId}/switch`);
      set({ activeWorkspaceId: data.workspace.id, status: "ready" });
      return { ok: true, workspace: data.workspace };
    } catch (error) {
      set({ status: "error", error: error.message });
      return { ok: false, error: error.message };
    }
  }
}));
