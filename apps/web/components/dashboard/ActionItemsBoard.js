import Button from "@/components/ui/Button";

const columns = [
  { key: "ACTIVE", label: "Active" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "COMPLETED", label: "Completed" }
];

export default function ActionItemsBoard({ items, onUpdateStatus }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => (
        <div key={column.key} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">{column.label}</h4>
            <span className="text-xs text-slate-400">
              {items.filter((item) => item.status === column.key).length}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {items
              .filter((item) => item.status === column.key)
              .map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">
                    {item.assignee?.name || "Unassigned"} | {item.priority}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {columns
                      .filter((col) => col.key !== column.key)
                      .map((col) => (
                        <Button
                          key={col.key}
                          variant="soft"
                          className="px-3 py-1 text-xs"
                          onClick={() => onUpdateStatus(item.id, col.key)}
                        >
                          Move to {col.label}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
