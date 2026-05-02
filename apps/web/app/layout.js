import "./globals.css";
import SessionBootstrap from "@/components/auth/SessionBootstrap";

export const metadata = {
  title: "Collaborative Team Hub",
  description: "Team workspace for projects, notes, and discussions."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-100 antialiased">
        <SessionBootstrap />
        <div className="relative min-h-screen">
          <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.35),_transparent_45%)]" />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
