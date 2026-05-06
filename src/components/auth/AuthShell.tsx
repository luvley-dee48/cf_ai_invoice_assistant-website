import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Sparkles } from "lucide-react";

export const AuthShell = ({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col p-8 lg:p-12">
      <Link to="/"><Logo /></Link>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
      </div>
      <div className="text-xs text-muted-foreground">© 2026 Mentic Labs</div>
    </div>
    <div className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:block">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-background/20 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-accent" /> Built on Cloudflare Agents
        </div>
        <div>
          <h2 className="font-display text-5xl leading-tight tracking-tight">An AI workspace that <em className="text-accent">remembers</em> you.</h2>
          <p className="mt-4 max-w-md text-base opacity-70">Track applications, save what matters, and let your agent handle the follow-ups.</p>
        </div>
        <div className="rounded-2xl border border-background/10 bg-background/5 p-4 backdrop-blur">
          <div className="text-xs opacity-60">Saved to memory</div>
          <div className="mt-1 text-sm">Target list: Stripe, Linear, Cloudflare · CV v3</div>
        </div>
      </div>
    </div>
  </div>
);