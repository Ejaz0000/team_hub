"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";

export default function NotificationsPanel({ refreshKey }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/notifications")
      .then((data) => {
        if (mounted) {
          setNotifications(data.notifications || []);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Notifications</h3>
        <span className="text-xs text-slate-400">Latest 50</span>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-slate-400">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((note) => (
            <div key={note.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
              <p className="text-sm text-white">{note.title}</p>
              {note.body ? <p className="mt-1 text-xs text-slate-400">{note.body}</p> : null}
              <p className="mt-2 text-xs text-slate-500">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
