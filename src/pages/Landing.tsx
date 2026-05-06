import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Brain, Workflow, MessageSquare, ListChecks, Check, ShieldCheck, Plus, Sparkles, Bookmark } from "lucide-react";

const Nav = () => (
  <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
    <div className="container flex h-16 items-center justify-between">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#features" className="hover:text-foreground">Features</a>
        <a href="#pricing" className="hover:text-foreground">Pricing</a>
        <a href="#security" className="hover:text-foreground">Security</a>
        <a href="#faq" className="hover:text-foreground">FAQ</a>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">Sign in</Link>
        <Button asChild size="sm" className="rounded-full">
          <Link to="/signup">Start free <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    </div>
  </header>
);

const ProductMock = () => (
  <div className="relative">
    <div className="absolute -inset-4 rounded-[2rem] bg-gradient-accent opacity-20 blur-3xl" />
    <div className="relative grid grid-cols-5 gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
      {/* Chat */}
      <div className="col-span-3 rounded-xl border border-border bg-background p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs font-medium text-muted-foreground">Mentic agent · live</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-3 py-2">Help me prep for the Stripe SWE interview tomorrow.</div></div>
          <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-accent-soft px-3 py-2">
            Pulling your notes on <span className="rounded bg-background px-1 font-medium">Stripe</span>. You met <span className="rounded bg-background px-1 font-medium">Priya (EM)</span> last week — focus on systems design.
            <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-foreground align-middle" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:bg-secondary"><Bookmark className="h-3 w-3" /> Save to memory</button>
            <button className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:bg-secondary"><Plus className="h-3 w-3" /> Create task</button>
          </div>
        </div>
      </div>
      {/* Side: memory + tracker */}
      <div className="col-span-2 space-y-3">
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Memory</span>
            <Brain className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between"><span>Goal: senior SWE, infra</span></div>
            <div className="flex items-center justify-between"><span>CV v3 · Aug 2025</span></div>
            <div className="flex items-center justify-between"><span>Target: Stripe, Linear, Cloudflare</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tracker</span>
            <ListChecks className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="space-y-2 text-xs">
            <Row company="Stripe" stage="Onsite" tone="bg-accent-soft text-accent" />
            <Row company="Linear" stage="Take-home" tone="bg-warning/15 text-warning" />
            <Row company="Vercel" stage="Recruiter" tone="bg-secondary text-foreground" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Row = ({ company, stage, tone }: { company: string; stage: string; tone: string }) => (
  <div className="flex items-center justify-between">
    <span className="font-medium">{company}</span>
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>{stage}</span>
  </div>
);

const features = [
  { icon: Brain, title: "Persistent memory", desc: "Goals, companies, contacts and interview notes — recalled in every chat." },
  { icon: Workflow, title: "Workflow automation", desc: "Reminders, follow-ups, and task creation triggered by your pipeline." },
  { icon: MessageSquare, title: "Streaming AI chat", desc: "Real-time responses with tool actions, attachments, and saved threads." },
  { icon: ListChecks, title: "Application tracker", desc: "A structured view of every role, stage, deadline, and next action." },
];

const steps = [
  { n: "01", t: "Connect", d: "Bring your CV, calendar, and target list. Mentic ingests context once." },
  { n: "02", t: "Chat", d: "Ask anything — the agent remembers companies, contacts, and prior interviews." },
  { n: "03", t: "Save", d: "Pin facts to memory. They become permanent context across sessions." },
  { n: "04", t: "Act", d: "Generate tasks, reminders and follow-ups directly from chat." },
];

const tiers = [
  { name: "Free", price: "$0", desc: "For getting started.", cta: "Start free", features: ["50 chats / month", "Basic memory", "1 workspace", "Application tracker"] },
  { name: "Pro", price: "$19", desc: "For active job seekers.", cta: "Start Pro trial", featured: true, features: ["Unlimited chats", "Workflow automation", "Reminders & follow-ups", "Export & integrations"] },
  { name: "Team", price: "$49", desc: "For coaches & teams.", cta: "Talk to sales", features: ["Shared workspace", "Admin controls", "Collaboration", "Priority models"] },
];

const faqs = [
  { q: "How does the agent remember things?", a: "Mentic runs on Cloudflare Durable Objects. Every saved fact, conversation, and task is persisted per-user and recalled with each new session." },
  { q: "Where is my data stored?", a: "Your workspace state lives at the edge with strict per-user isolation. You can export or delete everything at any time from Settings." },
  { q: "What model powers the chat?", a: "Llama 3.3 on Cloudflare Workers AI by default. Pro plans can route to other providers." },
  { q: "Can I cancel anytime?", a: "Yes. Pro and Team plans are month-to-month. Cancellation takes effect at the end of the current period." },
  { q: "Do you train models on my data?", a: "No. Your memory and conversations are never used to train foundation models." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="container grid gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Built on Cloudflare Agents
            </div>
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Your AI career assistant for <em className="text-accent">applications, interviews</em> & follow-ups.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Track every role, remember every company, and automate your next move — in one persistent workspace that actually remembers you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/signup">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to="/app">See live demo</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Free forever tier</span>
            </div>
          </div>
          <ProductMock />
        </div>

        {/* Social proof */}
        <div className="border-y border-border/60 bg-background/60">
          <div className="container flex flex-wrap items-center justify-between gap-6 py-6 text-sm text-muted-foreground">
            <span className="text-xs uppercase tracking-wider">Trusted by candidates from</span>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 font-semibold tracking-tight opacity-70">
              <span>Stripe</span><span>Linear</span><span>Vercel</span><span>Cloudflare</span><span>Notion</span><span>Figma</span><span>Anthropic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Workspace, not chatbot</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">More than chat. A career operating system.</h2>
          <p className="mt-4 text-muted-foreground">Mentic is stateful by design. Every conversation, fact, and follow-up persists — and compounds.</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">How it works</p>
              <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">Four steps to a smarter search.</h2>
              <p className="mt-4 text-muted-foreground">Set it up once. Mentic builds context with every chat.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((s) => (
                <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                  <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
                  <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Pricing</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">Simple, honest pricing.</h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when your search gets serious.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative flex flex-col rounded-2xl border p-7 ${t.featured ? "border-accent bg-foreground text-background shadow-glow" : "border-border bg-card shadow-card"}`}>
              {t.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Most popular</span>}
              <div className="text-sm font-medium opacity-80">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-5xl tracking-tight">{t.price}</span>
                <span className="text-sm opacity-60">/mo</span>
              </div>
              <p className={`mt-2 text-sm ${t.featured ? "opacity-70" : "text-muted-foreground"}`}>{t.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 ${t.featured ? "text-accent" : "text-success"}`} /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className={`mt-8 rounded-full ${t.featured ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`} variant={t.featured ? "default" : "outline"}>
                <Link to="/signup">{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-t border-border bg-secondary/40">
        <div className="container grid items-center gap-10 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><ShieldCheck className="h-5 w-5" /></div>
            <h2 className="font-display text-4xl tracking-tight md:text-5xl">Your memory. Your control.</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">Workspace state runs on Cloudflare Durable Objects with per-user isolation. Export or delete everything at any time. We never train foundation models on your data.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["SOC 2 ready", "Audit-grade controls"],
              ["Per-user isolation", "Each workspace, its own state"],
              ["No model training", "Your data isn't fuel"],
              ["1-click export", "Take your memory anywhere"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-5">
                <div className="text-sm font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-accent">FAQ</p>
          <h2 className="mt-3 text-center font-display text-4xl tracking-tight md:text-5xl">Questions, answered.</h2>
          <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
                  {f.q}
                  <Plus className="h-4 w-4 transition group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-12 text-background md:p-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <Sparkles className="mb-4 h-6 w-6 text-accent" />
              <h2 className="font-display text-4xl tracking-tight md:text-5xl">Stop re-explaining yourself to AI.</h2>
              <p className="mt-3 max-w-xl text-base opacity-70">Mentic remembers. Try the workspace free — no card, no setup.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/signup">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background">
                <Link to="/app">Open demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <div className="flex gap-6">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#security">Security</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>© 2026 Mentic Labs.</div>
        </div>
      </footer>
    </div>
  );
}