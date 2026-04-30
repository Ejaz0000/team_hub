import "./globals.css";

export const metadata = {
  title: "Collaborative Team Hub",
  description: "Team workspace for projects, notes, and discussions."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Collaborative Team Hub
              </p>
              <h1 className="text-3xl font-semibold text-white">Team Home</h1>
            </div>
            <div className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300">
              Next.js 14 + Tailwind + Zustand
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-12 text-xs text-slate-500">
            Build, ship, and collaborate.
          </footer>
        </div>
      </body>
    </html>
  );
}
