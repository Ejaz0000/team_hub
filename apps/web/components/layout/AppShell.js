"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function AppShell({ children }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && status !== "loading" && !user) {
      router.replace("/login");
    }
  }, [status, user, router, hasHydrated]);

  if (status === "loading" || !hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Checking session...
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
