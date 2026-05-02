"use client";

import { useState } from "react";
import api from "@/lib/api";

const reactions = ["👍", "🔥", "✅", "🎉", "👀"];

export default function ReactionBar({ workspaceId, announcementId }) {
  const [counts, setCounts] = useState({});

  const handleReaction = async (type) => {
    await api.post(
      `/workspaces/${workspaceId}/announcements/${announcementId}/reactions`,
      { type }
    );

    setCounts((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {reactions.map((emoji) => (
        <button
          key={emoji}
          className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-200"
          onClick={() => handleReaction(emoji)}
        >
          {emoji} {counts[emoji] ? counts[emoji] : ""}
        </button>
      ))}
    </div>
  );
}
