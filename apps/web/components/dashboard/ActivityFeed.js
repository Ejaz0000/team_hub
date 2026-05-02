export default function ActivityFeed({ items = [] }) {
  return (
    <div className="surface-card rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Activity feed</h3>
        <span className="text-xs text-slate-400">Latest</span>
      </div>
      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-sm text-white">{item.title}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{item.meta}</span>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
