import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="animate-fade-up">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Collaborative Team Hub
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
            Build shared momentum across goals, announcements, and action items.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300 md:text-lg">
            Keep every workspace in sync with real-time updates, crisp ownership,
            and a living timeline of decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-100"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="surface-card animate-fade-up-delay rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Snapshot
            </p>
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-200">
              Live signal
            </span>
          </div>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Active workspaces</span>
              <span className="text-white">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Goals on track</span>
              <span className="text-white">14</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Open action items</span>
              <span className="text-white">22</span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-xs text-slate-400">
            Real-time updates, notifications, and audit logs are ready to go.
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Workspaces",
            text: "Switch context fast with clean memberships and role-aware actions."
          },
          {
            title: "Goals",
            text: "Break strategy into milestones and keep progress visible."
          },
          {
            title: "Announcements",
            text: "Broadcast with pinned updates, reactions, and threaded comments."
          }
        ].map((card) => (
          <div key={card.title} className="surface-soft rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{card.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
