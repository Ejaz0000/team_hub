"use client";

import { useState } from "react";
import api from "@/lib/api";

const reactions = ["👍", "🔥", "✅", "🎉", "👀"];

export default function ReactionBar({ workspaceId, announcementId }) {
  const [counts, setCounts] = useState({});
  const [error, setError] = useState(null);

  const handleReaction = async (type) => {
    setCounts((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));
    setError(null);

    try {
      await api.post(
        `/workspaces/${workspaceId}/announcements/${announcementId}/reactions`,
        { type }
      );
    } catch (err) {
      setCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 1) - 1)
      }));
      setError(err.message || "Reaction failed");
    }
  };

  return (
    <div>
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
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
