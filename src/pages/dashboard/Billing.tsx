import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Billing() {
  return (
    <div className="grid max-w-5xl gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current plan</div>
            <div className="mt-1 font-display text-3xl tracking-tight">Free</div>
            <p className="mt-1 text-sm text-muted-foreground">Renews monthly. Upgrade anytime.</p>
          </div>
          <Button className="rounded-full">Upgrade to Pro</Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Usage label="Chats" used={23} limit={50} />
          <Usage label="Memory entries" used={48} limit={100} />
          <Usage label="Workspaces" used={1} limit={1} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { n: "Free", p: "$0", f: ["50 chats/mo", "Basic memory", "1 workspace"] },
          { n: "Pro", p: "$19", f: ["Unlimited chats", "Workflow automation", "Reminders & follow-ups", "Export"], featured: true },
          { n: "Team", p: "$49", f: ["Shared workspace", "Admin controls", "Collaboration"] },
        ].map((t) => (
          <div key={t.n} className={`rounded-2xl border p-6 ${t.featured ? "border-accent bg-accent-soft" : "border-border bg-card"}`}>
            <div className="text-sm font-medium">{t.n}</div>
            <div className="mt-2 font-display text-3xl">{t.p}<span className="text-sm text-muted-foreground">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm">
              {t.f.map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-accent" /> {x}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold">Payment method</h3>
        <p className="mt-1 text-sm text-muted-foreground">No card on file. Add one when you upgrade.</p>
        <Button variant="outline" className="mt-4 rounded-lg">Add payment method</Button>
      </div>
    </div>
  );
}

const Usage = ({ label, used, limit }: { label: string; used: number; limit: number }) => (
  <div className="rounded-xl border border-border bg-background p-4">
    <div className="flex items-baseline justify-between"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs">{used}/{limit}</span></div>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} /></div>
  </div>
);