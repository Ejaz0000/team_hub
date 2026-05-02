"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Button from "@/components/ui/Button";

export default function WorkspaceSwitcher() {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const switchWorkspace = useWorkspaceStore((state) => state.switchWorkspace);
  const status = useWorkspaceStore((state) => state.status);
  const error = useWorkspaceStore((state) => state.error);
  const [value, setValue] = useState("");

  const handleSwitch = async () => {
    await switchWorkspace(value);
    setValue("");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Active workspace
        </p>
        <p className="mt-2 break-all text-sm text-white">
          {activeWorkspaceId || "None selected"}
        </p>
      </div>
      <input
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Paste workspace id"
      />
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      <Button
        variant="ghost"
        className="w-full"
        onClick={handleSwitch}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Switching..." : "Switch workspace"}
      </Button>
    </div>
  );
}
