import {
  Activity,
  Bot,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Requirements", href: "/requirements", icon: ClipboardCheck },
  { label: "Operations", href: "/ops", icon: Activity },
  { label: "RAG Lab", href: "/rag", icon: FileSearch },
  { label: "AI Control", href: "/ai-control-center", icon: Bot },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings }
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-950 px-4 py-5 text-ink-inverse lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-signal-teal">
            <ScrollText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">AI Ops</p>
            <h1 className="text-lg font-semibold">Studio</h1>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink-muted">Portfolio case-study platform</p>
              <h2 className="text-xl font-semibold text-ink">AI Ops Studio</h2>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
              Mock AI mode
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
