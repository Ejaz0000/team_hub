"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "@/lib/api";
import Card from "@/components/ui/Card";

const statusColors = {
  ACTIVE: "#38bdf8",
  BLOCKED: "#f97316",
  COMPLETED: "#34d399",
  ARCHIVED: "#64748b"
};

export default function AnalyticsPanel({ workspaceId, refreshKey }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let mounted = true;
    setLoading(true);
    api
      .get(`/workspaces/${workspaceId}/goals`)
      .then((data) => {
        if (mounted) {
          setGoals(data.goals || []);
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
  }, [workspaceId, refreshKey]);

  const analytics = useMemo(() => {
    const total = goals.length;
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const completedThisWeek = goals.filter((goal) => {
      if (goal.status !== "COMPLETED") {
        return false;
      }
      const updatedAt = new Date(goal.updatedAt || goal.createdAt);
      return updatedAt >= weekAgo;
    }).length;

    const overdue = goals.filter((goal) => {
      if (!goal.dueDate) {
        return false;
      }
      if (goal.status === "COMPLETED" || goal.status === "ARCHIVED") {
        return false;
      }
      return new Date(goal.dueDate) < now;
    }).length;

    const statusCounts = ["ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"].map((status) => ({
      name: status,
      value: goals.filter((goal) => goal.status === status).length,
      color: statusColors[status]
    }));

    return { total, completedThisWeek, overdue, statusCounts };
  }, [goals]);

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Analytics</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Goal health</h2>
        </div>
        <span className="text-xs text-slate-400">Weekly pulse</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading analytics...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Total goals</p>
            <p className="mt-2 text-2xl font-semibold text-white">{analytics.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Completed this week</p>
            <p className="mt-2 text-2xl font-semibold text-white">{analytics.completedThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Overdue</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{analytics.overdue}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="h-48 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.statusCounts}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {analytics.statusCounts.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-48 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.statusCounts}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={4}
              >
                {analytics.statusCounts.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
