"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SectionHeader from "@/components/ui/SectionHeader";
import ActionItemsBoard from "@/components/dashboard/ActionItemsBoard";
import ActionItemsList from "@/components/dashboard/ActionItemsList";

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ActionItemsPanel({ workspaceId, onActivity }) {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [view, setView] = useState("board");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "MEDIUM",
    dueDate: "",
    status: "ACTIVE",
    assigneeId: "",
    goalId: ""
  });

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let mounted = true;
    Promise.all([
      api.get(`/workspaces/${workspaceId}/action-items`),
      api.get(`/workspaces/${workspaceId}/members`),
      api.get(`/workspaces/${workspaceId}/goals`)
    ])
      .then(([itemsData, membersData, goalsData]) => {
        if (mounted) {
          setItems(itemsData.actionItems || []);
          setMembers(membersData.members || []);
          setGoals(goalsData.goals || []);
        }
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      return;
    }

    setLoading(true);
    try {
      const data = await api.post(`/workspaces/${workspaceId}/action-items`, {
        title: form.title,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || undefined,
        assigneeId: form.assigneeId || undefined,
        goalId: form.goalId || undefined
      });
      setItems((prev) => [data.actionItem, ...prev]);
      setForm({
        title: "",
        priority: "MEDIUM",
        dueDate: "",
        status: "ACTIVE",
        assigneeId: "",
        goalId: ""
      });
      if (onActivity) {
        onActivity({
          title: `Action item added: ${data.actionItem.title}`,
          meta: "Action items",
          time: "just now"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (actionItemId, status) => {
    const data = await api.patch(`/workspaces/${workspaceId}/action-items/${actionItemId}`, {
      status
    });
    setItems((prev) => prev.map((item) => (item.id === actionItemId ? data.actionItem : item)));
    if (onActivity) {
      onActivity({
        title: `Action item status updated to ${status}`,
        meta: "Action items",
        time: "just now"
      });
    }
  };

  return (
    <Card id="action-items" className="space-y-5">
      <SectionHeader
        title="Action items"
        subtitle="Track tasks in a board or list view."
        action={
          <div className="flex gap-2">
            <Button variant={view === "board" ? "primary" : "ghost"} onClick={() => setView("board")}>
              Board
            </Button>
            <Button variant={view === "list" ? "primary" : "ghost"} onClick={() => setView("list")}>
              List
            </Button>
          </div>
        }
      />
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">New action item</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_160px_160px_160px_180px_180px_140px]">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Draft release notes"
          />
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Priority
            <select
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Due"
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          />
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Assignee
            <select
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
              value={form.assigneeId}
              onChange={(event) => setForm({ ...form, assigneeId: event.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user?.name || member.user?.email}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Goal link
            <select
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
              value={form.goalId}
              onChange={(event) => setForm({ ...form, goalId: event.target.value })}
            >
              <option value="">No goal</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Status
            <select
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Add"}
            </Button>
          </div>
        </div>
      </div>

      {view === "board" ? (
        <ActionItemsBoard items={items} onUpdateStatus={updateStatus} />
      ) : (
        <ActionItemsList items={items} />
      )}
    </Card>
  );
}
