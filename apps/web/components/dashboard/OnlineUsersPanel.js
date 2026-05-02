import Card from "@/components/ui/Card";

export default function OnlineUsersPanel({ onlineUsers = [] }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Online now</h3>
        <span className="text-xs text-emerald-300">{onlineUsers.length}</span>
      </div>
      {onlineUsers.length === 0 ? (
        <p className="text-sm text-slate-400">No active users yet.</p>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((userId) => (
            <div key={userId} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-300">{userId}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
