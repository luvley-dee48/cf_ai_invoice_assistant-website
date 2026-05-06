import { Plus, Bookmark, Briefcase, FileText, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const groups = [
  { icon: Bookmark, title: "Goals", items: ["Land senior SWE role at infra-focused company", "Target compensation: $250k+", "Remote or NYC preferred"] },
  { icon: Briefcase, title: "Preferred companies", items: ["Stripe — Payments infra", "Linear — Product velocity", "Cloudflare — Edge & Workers AI"] },
  { icon: FileText, title: "CV versions", items: ["v3 — Aug 2025 (current)", "v2 — Mar 2025", "v1 — Oct 2024"] },
  { icon: MessageSquare, title: "Interview notes", items: ["Stripe · Priya (EM): focuses on systems design", "Linear · Karri: values async writing samples"] },
  { icon: Bell, title: "Reminder history", items: ["Followed up with Cloudflare recruiter — May 1", "Sent thank-you to Priya — Apr 28"] },
];

export default function Memory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Everything Mentic remembers about you. Persisted on Cloudflare Durable Objects.</p>
        <Button className="rounded-full"><Plus className="mr-1.5 h-4 w-4" /> Add memory</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><g.icon className="h-4 w-4" /></span>
              <h3 className="text-sm font-semibold">{g.title}</h3>
            </div>
            <ul className="space-y-2">
              {g.items.map((i) => <li key={i} className="rounded-lg bg-secondary px-3 py-2 text-sm">{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}