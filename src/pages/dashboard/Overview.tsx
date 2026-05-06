import { ArrowUpRight, Briefcase, ListChecks, Bell, Sparkles, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Stat = ({ icon: Icon, label, value, delta }: any) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="flex items-center justify-between">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent"><Icon className="h-4 w-4" /></span>
      <span className="text-xs text-success">{delta}</span>
    </div>
    <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
    <div className="mt-1 text-sm text-muted-foreground">{label}</div>
  </div>
);

const activity = [
  { icon: Sparkles, t: "Mentic summarized your Stripe onsite notes", time: "2m ago" },
  { icon: CheckCircle2, t: "Task completed: Send thank-you email to Priya", time: "1h ago" },
  { icon: MessageSquare, t: "New chat: Compare Linear vs Vercel offers", time: "3h ago" },
  { icon: Bell, t: "Reminder fired: Follow up with Cloudflare recruiter", time: "Yesterday" },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Welcome back, Alex.</h2>
          <p className="mt-1 text-sm text-muted-foreground">You have 3 follow-ups due this week.</p>
        </div>
        <Button asChild className="rounded-full"><Link to="/app/chat">Open chat <ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Briefcase} label="Active applications" value="12" delta="+2 this week" />
        <Stat icon={ListChecks} label="Pending tasks" value="7" delta="3 due today" />
        <Stat icon={Bell} label="Upcoming reminders" value="4" delta="next: Tue" />
        <Stat icon={MessageSquare} label="Chats this month" value="23" delta="of 50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Pipeline timeline</h3>
            <Link to="/app/tracker" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="mt-6 space-y-5">
            {[
              { c: "Stripe", role: "Senior SWE, Infra", stage: "Onsite", pct: 80, tone: "bg-accent" },
              { c: "Linear", role: "Product Engineer", stage: "Take-home", pct: 50, tone: "bg-warning" },
              { c: "Vercel", role: "Edge Engineer", stage: "Recruiter screen", pct: 20, tone: "bg-foreground" },
              { c: "Cloudflare", role: "Workers AI eng.", stage: "Applied", pct: 10, tone: "bg-muted-foreground" },
            ].map((r) => (
              <div key={r.c}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div><span className="font-medium">{r.c}</span> <span className="text-muted-foreground">· {r.role}</span></div>
                  <span className="text-xs text-muted-foreground">{r.stage}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full ${r.tone}`} style={{ width: `${r.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-base font-semibold">Latest AI activity</h3>
          <ul className="mt-4 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><a.icon className="h-4 w-4" /></span>
                <div className="text-sm"><div>{a.t}</div><div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {a.time}</div></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}