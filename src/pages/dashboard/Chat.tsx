import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Plus, Paperclip, Sparkles, Send, Brain } from "lucide-react";

const suggestions = ["Prep me for the Stripe onsite", "Draft a follow-up to Priya", "Compare Linear vs Vercel offers", "What did I learn from the Cloudflare call?"];

const initial = [
  { from: "user", text: "Help me prep for the Stripe SWE interview tomorrow." },
  { from: "ai", text: "Pulling your notes on Stripe. You met Priya (EM) last week — focus on systems design. Want me to generate 5 likely questions and draft responses based on your CV v3?" },
];

export default function Chat() {
  const [msg, setMsg] = useState("");
  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold">Stripe onsite prep</div>
            <div className="text-xs text-muted-foreground">Llama 3.3 · Cloudflare Workers AI</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full"><Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save to memory</Button>
            <Button size="sm" variant="outline" className="rounded-full"><Plus className="mr-1.5 h-3.5 w-3.5" /> Create task</Button>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {initial.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "user" ? "rounded-br-sm bg-secondary" : "rounded-bl-sm bg-accent-soft"}`}>{m.text}</div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s) => <button key={s} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary">{s}</button>)}
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setMsg(""); }} className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
            <Button type="button" size="icon" variant="ghost"><Paperclip className="h-4 w-4" /></Button>
            <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask Mentic anything…" className="border-0 shadow-none focus-visible:ring-0" />
            <Button type="submit" size="icon" className="rounded-lg"><Send className="h-4 w-4" /></Button>
          </div>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Context</h3>
            <Brain className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-2 text-sm">
            {["Goal: senior SWE, infra", "CV v3 · Aug 2025", "Priya — EM, Payments", "Stripe onsite · Tomorrow"].map((x) => (
              <div key={x} className="rounded-lg bg-secondary px-3 py-2 text-xs">{x}</div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-accent" /> Tools available</div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>· web.search</li><li>· calendar.create_event</li><li>· memory.save</li><li>· tracker.update_status</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}