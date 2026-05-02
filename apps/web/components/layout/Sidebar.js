import Link from "next/link";
import WorkspaceSwitcher from "@/components/layout/WorkspaceSwitcher";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Goals", href: "/dashboard#goals" },
  { label: "Announcements", href: "/dashboard#announcements" },
  { label: "Action Items", href: "/dashboard#action-items" }
];

export default function Sidebar() {
  return (
    <aside className="surface-card flex min-h-screen flex-col gap-6 px-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Team Hub</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Control Room</h1>
      </div>
      <WorkspaceSwitcher />
      <nav className="flex flex-col gap-3 text-sm text-slate-300">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-2xl px-3 py-2 hover:bg-white/5">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-slate-500">
        Realtime, notifications, and audit trails enabled.
      </div>
    </aside>
  );
}
