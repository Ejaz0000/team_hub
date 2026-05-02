import { create } from "zustand";
import api from "@/lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  status: "idle",
  error: null,
  hasHydrated: false,
  hydrate: async () => {
    if (get().status === "loading") {
      return;
    }

    set({ status: "loading", error: null });
    try {
      const data = await api.post("/refresh");
      set({
        user: data.user,
        status: "authenticated",
        error: null,
        hasHydrated: true
      });
    } catch (error) {
      set({ user: null, status: "idle", error: null, hasHydrated: true });
    }
  },
  login: async (payload) => {
    set({ status: "loading", error: null });
    try {
      const data = await api.post("/login", payload);
      set({
        user: data.user,
        status: "authenticated",
        error: null,
        hasHydrated: true
      });
      return { ok: true };
    } catch (error) {
      set({ status: "idle", error: error.message });
      return { ok: false, error: error.message };
    }
  },
  register: async (payload) => {
    set({ status: "loading", error: null });
    try {
      const data = await api.post("/register", payload);
      set({
        user: data.user,
        status: "authenticated",
        error: null,
        hasHydrated: true
      });
      return { ok: true };
    } catch (error) {
      set({ status: "idle", error: error.message });
      return { ok: false, error: error.message };
    }
  },
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      // Ignore logout errors to clear local state.
    }

    set({ user: null, status: "idle", error: null, hasHydrated: true });
  },
  setUser: (user) => set({ user })
}));
