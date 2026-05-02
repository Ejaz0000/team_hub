"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SectionHeader from "@/components/ui/SectionHeader";
import MilestonesPanel from "@/components/dashboard/MilestonesPanel";

const statusOptions = ["ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"];

export default function GoalsPanel({ workspaceId, onActivity, refreshKey }) {
  const [goals, setGoals] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    status: "ACTIVE",
    ownerId: ""
  });

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let mounted = true;
    setFetching(true);
    Promise.all([
      api.get(`/workspaces/${workspaceId}/goals`),
      api.get(`/workspaces/${workspaceId}/members`)
    ])
      .then(([goalsData, membersData]) => {
        if (mounted) {
          setGoals(goalsData.goals || []);
          setMembers(membersData.members || []);
          if (goalsData.goals?.length) {
            setSelectedGoalId(goalsData.goals[0].id);
          }
        }
      })
      .catch(() => null);
      .finally(() => {
        if (mounted) {
          setFetching(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [workspaceId, refreshKey]);

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId),
    [goals, selectedGoalId]
  );

  const handleCreate = async () => {
    if (!form.title.trim()) {
      return;
    }

    setLoading(true);
    try {
      const data = await api.post(`/workspaces/${workspaceId}/goals`, {
        title: form.title,
        dueDate: form.dueDate || undefined,
        status: form.status,
        ownerId: form.ownerId || undefined
      });
      setGoals((prev) => [data.goal, ...prev]);
      setSelectedGoalId(data.goal.id);
      setForm({ title: "", dueDate: "", status: "ACTIVE", ownerId: "" });
      if (onActivity) {
        onActivity({
          title: `Goal created: ${data.goal.title}`,
          meta: "Goals",
          time: "just now"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateGoalStatus = async (goalId, status) => {
    const data = await api.patch(`/workspaces/${workspaceId}/goals/${goalId}`, { status });
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? data.goal : goal)));
    if (onActivity) {
      onActivity({
        title: `Goal status updated to ${status}`,
        meta: "Goals",
        time: "just now"
      });
    }
  };

  const handleExport = () => {
    const rows = goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      status: goal.status,
      owner: goal.owner?.name || goal.owner?.email || "",
      dueDate: goal.dueDate ? goal.dueDate.slice(0, 10) : "",
      createdAt: goal.createdAt ? goal.createdAt.slice(0, 10) : ""
    }));
    downloadCsv("goals.csv", rows);
  };

  return (
    <Card id="goals" className="space-y-5">
      <SectionHeader
        title="Goals"
        subtitle="Create goals, assign owners, and track progress."
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{goals.length} total</span>
            <Button variant="ghost" onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        }
      />
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">New goal</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_170px_180px_160px_140px]">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Ship workspace analytics"
          />
          <Input
            label="Due"
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          />
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Status
            <select
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Owner
            <select
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
              value={form.ownerId}
              onChange={(event) => setForm({ ...form, ownerId: event.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user?.name || member.user?.email}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Add goal"}
            </Button>
          </div>
        </div>
      </div>

      {fetching && goals.length === 0 ? (
        <p className="text-sm text-slate-400">Loading goals...</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-slate-400">No goals yet.</p>
          ) : (
            goals.map((goal) => (
              <button
                key={goal.id}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  goal.id === selectedGoalId
                    ? "border-amber-400/70 bg-amber-400/10"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
                onClick={() => setSelectedGoalId(goal.id)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white">{goal.title}</p>
                  <span className="text-xs text-slate-400">{goal.status}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{goal.owner?.name || "Unassigned"}</span>
                  <span>{goal.dueDate ? goal.dueDate.slice(0, 10) : "No due date"}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span>Update status</span>
                  <select
                    className="rounded-full border border-slate-700 bg-transparent px-2 py-1 text-xs text-slate-100"
                    value={goal.status}
                    onChange={(event) => updateGoalStatus(goal.id, event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </button>
            ))
          )}
        </div>
        <div>
          {selectedGoal ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected goal</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{selectedGoal.title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                Owner: {selectedGoal.owner?.name || "Unassigned"}
              </p>
              <MilestonesPanel
                workspaceId={workspaceId}
                goalId={selectedGoal.id}
                onActivity={onActivity}
                refreshKey={refreshKey}
              />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Select a goal to view milestones.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
