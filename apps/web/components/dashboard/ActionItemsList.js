export default function ActionItemsList({ items }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
      <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <span>Title</span>
        <span>Assignee</span>
        <span>Priority</span>
        <span>Status</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200 md:grid-cols-[1.5fr_1fr_1fr_1fr]"
          >
            <span>{item.title}</span>
            <span>{item.assignee?.name || "Unassigned"}</span>
            <span>{item.priority}</span>
            <span>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
