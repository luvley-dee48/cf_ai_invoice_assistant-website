import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const tasks = [
  { t: "Send thank-you email to Priya at Stripe", due: "Today", done: false, tag: "Stripe" },
  { t: "Complete Linear take-home", due: "Fri", done: false, tag: "Linear" },
  { t: "Update CV with Workers AI project", due: "Mon", done: false, tag: "CV" },
  { t: "Follow up with Vercel recruiter", due: "Tue", done: false, tag: "Vercel" },
  { t: "Research Cloudflare Workers team", due: "—", done: true, tag: "Cloudflare" },
];

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">7 active · created from chat & workflows</p>
        <Button className="rounded-full"><Plus className="mr-1.5 h-4 w-4" /> New task</Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {tasks.map((t, i) => (
          <div key={i} className={`flex items-center justify-between gap-4 px-5 py-4 ${i !== tasks.length - 1 ? "border-b border-border" : ""}`}>
            <div className="flex items-center gap-3">
              <Checkbox checked={t.done} />
              <div>
                <div className={`text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Due {t.due}</div>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{t.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}