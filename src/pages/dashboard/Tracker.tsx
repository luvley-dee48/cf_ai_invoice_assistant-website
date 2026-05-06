import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const cols = [
  { name: "Applied", tone: "text-muted-foreground", items: [{ c: "Cloudflare", r: "Workers AI eng.", d: "—", n: "Submitted via referral" }] },
  { name: "Recruiter", tone: "text-foreground", items: [{ c: "Vercel", r: "Edge Engineer", d: "May 12", n: "Call w/ Sam" }] },
  { name: "Take-home", tone: "text-warning", items: [{ c: "Linear", r: "Product Eng.", d: "May 9", n: "Due Friday" }] },
  { name: "Onsite", tone: "text-accent", items: [{ c: "Stripe", r: "Senior SWE, Infra", d: "May 6", n: "Met Priya" }] },
  { name: "Offer", tone: "text-success", items: [] },
];

export default function Tracker() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">12 applications · 4 in active stage</p>
        <Button className="rounded-full"><Plus className="mr-1.5 h-4 w-4" /> Add role</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {cols.map((col) => (
          <div key={col.name} className="rounded-2xl border border-border bg-card p-3 shadow-card">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className={`text-xs font-semibold uppercase tracking-wider ${col.tone}`}>{col.name}</span>
              <span className="text-xs text-muted-foreground">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((it) => (
                <div key={it.c} className="rounded-xl border border-border bg-background p-3 text-sm">
                  <div className="font-semibold">{it.c}</div>
                  <div className="text-xs text-muted-foreground">{it.r}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground"><span>{it.n}</span><span>{it.d}</span></div>
                </div>
              ))}
              {col.items.length === 0 && <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}