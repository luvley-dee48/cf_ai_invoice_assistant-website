import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Kanban, Brain, ListChecks, Settings as SettingsIcon, CreditCard, Search, Bell } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/chat", label: "Chat", icon: MessageSquare },
  { to: "/app/tracker", label: "Tracker", icon: Kanban },
  { to: "/app/memory", label: "Memory", icon: Brain },
  { to: "/app/tasks", label: "Tasks", icon: ListChecks },
];
const account = [
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
  { to: "/app/billing", label: "Billing", icon: CreditCard },
];

const titleMap: Record<string, string> = {
  "/app": "Overview",
  "/app/chat": "Chat",
  "/app/tracker": "Tracker",
  "/app/memory": "Memory vault",
  "/app/tasks": "Tasks",
  "/app/settings": "Settings",
  "/app/billing": "Billing & usage",
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const title = titleMap[pathname] ?? "Workspace";
  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-secondary/40">
      <aside className="sticky top-0 flex h-screen flex-col border-r border-border bg-background">
        <div className="px-5 py-5"><Logo /></div>
        <nav className="flex-1 space-y-6 px-3">
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
            {nav.map((n) => <NavItem key={n.to} {...n} />)}
          </div>
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</div>
            {account.map((n) => <NavItem key={n.to} {...n} />)}
          </div>
        </nav>
        <div className="m-3 rounded-xl border border-border bg-gradient-hero p-4">
          <div className="text-xs font-semibold">Free plan</div>
          <div className="mt-1 text-xs text-muted-foreground">23 / 50 chats this month</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full w-[46%] bg-accent" /></div>
          <Button asChild size="sm" className="mt-3 w-full rounded-lg"><NavLink to="/app/billing">Upgrade to Pro</NavLink></Button>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search memory, companies, tasks…" className="pl-9" />
            </div>
            <Button size="icon" variant="outline" className="rounded-full"><Bell className="h-4 w-4" /></Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">A</div>
          </div>
        </header>
        <main className="flex-1 p-8"><Outlet /></main>
      </div>
    </div>
  );
}

const NavItem = ({ to, label, icon: Icon, end }: { to: string; label: string; icon: any; end?: boolean }) => (
  <NavLink end={end} to={to} className={({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`
  }>
    <Icon className="h-4 w-4" /> {label}
  </NavLink>
);