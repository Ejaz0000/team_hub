"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SectionHeader from "@/components/ui/SectionHeader";
import CommentThread from "@/components/dashboard/CommentThread";
import ReactionBar from "@/components/dashboard/ReactionBar";

export default function AnnouncementsPanel({ workspaceId, isAdmin, onActivity }) {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", isPinned: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let mounted = true;
    api
      .get(`/workspaces/${workspaceId}/announcements`)
      .then((data) => {
        if (mounted) {
          setAnnouncements(data.announcements || []);
        }
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      return;
    }

    setLoading(true);
    try {
      const data = await api.post(`/workspaces/${workspaceId}/announcements`, {
        title: form.title,
        content: form.content,
        isPinned: form.isPinned
      });
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setForm({ title: "", content: "", isPinned: false });
      if (onActivity) {
        onActivity({
          title: `Announcement posted: ${data.announcement.title}`,
          meta: "Announcements",
          time: "just now"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (announcement) => {
    const path = announcement.isPinned ? "unpin" : "pin";
    const data = await api.post(
      `/workspaces/${workspaceId}/announcements/${announcement.id}/${path}`
    );

    setAnnouncements((prev) =>
      prev.map((item) => (item.id === announcement.id ? { ...item, ...data.announcement } : item))
    );
  };

  return (
    <Card id="announcements" className="space-y-5">
      <SectionHeader
        title="Announcements"
        subtitle="Broadcast updates, reactions, and comments in one feed."
      />
      {isAdmin ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">New announcement</p>
          <div className="mt-3 space-y-3">
            <Input
              label="Title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Launch day notes"
            />
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Content
              <textarea
                className="min-h-[120px] rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-100"
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="Share rich text content, mentions, and updates."
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(event) => setForm({ ...form, isPinned: event.target.checked })}
              />
              Pin this update
            </label>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Only admins can create announcements.</p>
      )}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-400">No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white">
                    {announcement.title}
                    {announcement.isPinned ? (
                      <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-200">
                        Pinned
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{announcement.content}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    By {announcement.createdBy?.name || "Admin"}
                  </p>
                </div>
                {isAdmin ? (
                  <Button variant="ghost" onClick={() => togglePin(announcement)}>
                    {announcement.isPinned ? "Unpin" : "Pin"}
                  </Button>
                ) : null}
              </div>
              <div className="mt-4 space-y-4">
                <ReactionBar workspaceId={workspaceId} announcementId={announcement.id} />
                <CommentThread
                  workspaceId={workspaceId}
                  announcementId={announcement.id}
                  onActivity={onActivity}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
