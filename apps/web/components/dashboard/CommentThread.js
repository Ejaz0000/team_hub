"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

export default function CommentThread({ workspaceId, announcementId, onActivity }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!workspaceId || !announcementId) {
      return;
    }

    let mounted = true;
    api
      .get(`/workspaces/${workspaceId}/announcements/${announcementId}/comments`)
      .then((data) => {
        if (mounted) {
          setComments(data.comments || []);
        }
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [workspaceId, announcementId]);

  const handleAdd = async () => {
    if (!body.trim()) {
      return;
    }

    const data = await api.post(
      `/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
      { body }
    );
    setComments((prev) => [...prev, data.comment]);
    setBody("");
    if (onActivity) {
      onActivity({
        title: "Comment added",
        meta: "Announcements",
        time: "just now"
      });
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400">No comments yet.</p>
        ) : (
          comments.slice(-3).map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-300">{comment.author?.name || "User"}</p>
              <p className="text-sm text-white">{comment.body}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-col gap-2">
        <textarea
          className="min-h-[80px] rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100"
          placeholder="Add a comment..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button variant="ghost" onClick={handleAdd}>
          Post comment
        </Button>
      </div>
    </div>
  );
}
