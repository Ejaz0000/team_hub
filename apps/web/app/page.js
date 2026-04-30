export default function Home() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white">Spaces</h2>
        <p className="mt-2 text-sm text-slate-300">
          Organize teams, projects, and rituals in one shared hub.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white">Activity</h2>
        <p className="mt-2 text-sm text-slate-300">
          Capture decisions and keep momentum across time zones.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white">Ownership</h2>
        <p className="mt-2 text-sm text-slate-300">
          Share accountability with clear statuses and smart routing.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg lg:col-span-2">
        <h3 className="text-base font-semibold text-white">Next Up</h3>
        <p className="mt-2 text-sm text-slate-300">
          Connect the API and Prisma layer, then layer in auth and workspace
          roles.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h3 className="text-base font-semibold text-white">API Status</h3>
        <p className="mt-2 text-sm text-slate-300">
          Hit <span className="text-white">/health</span> on the API to verify.
        </p>
      </div>
    </section>
  );
}
