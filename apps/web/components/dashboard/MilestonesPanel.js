"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function MilestonesPanel({
  workspaceId,
  goalId,
  onActivity,
  refreshKey
}) {
  const [milestones, setMilestones] = useState([]);
  const [form, setForm] = useState({ title: "", progress: 0, dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!workspaceId || !goalId) {
      return;
    }

    let mounted = true;
    setFetching(true);
    api
      .get(`/workspaces/${workspaceId}/goals/${goalId}/milestones`)
      .then((data) => {
        if (mounted) {
          setMilestones(data.milestones || []);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) {
          setFetching(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [workspaceId, goalId, refreshKey]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      return;
    }

    setLoading(true);
    try {
      const data = await api.post(`/workspaces/${workspaceId}/goals/${goalId}/milestones`, {
        title: form.title,
        progress: Number(form.progress || 0),
        dueDate: form.dueDate || undefined
      });
      setMilestones((prev) => [data.milestone, ...prev]);
      setForm({ title: "", progress: 0, dueDate: "" });
      if (onActivity) {
        onActivity({
          title: `Milestone added: ${data.milestone.title}`,
          meta: "Goals",
          time: "just now"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">New milestone</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_140px_160px_140px]">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Launch recap"
          />
          <Input
            label="Progress"
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(event) => setForm({ ...form, progress: event.target.value })}
          />
          <Input
            label="Due"
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Add"}
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {fetching && milestones.length === 0 ? (
          <p className="text-sm text-slate-400">Loading milestones...</p>
        ) : milestones.length === 0 ? (
          <p className="text-sm text-slate-400">No milestones yet.</p>
        ) : (
          milestones.map((milestone) => (
            <div key={milestone.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{milestone.title}</p>
                  <p className="text-xs text-slate-400">
                    Progress {milestone.progress}%
                    {milestone.dueDate ? ` | Due ${milestone.dueDate.slice(0, 10)}` : ""}
                  </p>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-2 bg-emerald-400"
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
