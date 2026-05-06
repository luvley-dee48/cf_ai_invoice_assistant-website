import { Sparkles } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
      <Sparkles className="h-4 w-4" />
    </div>
    <span className="text-lg font-semibold tracking-tight">Mentic</span>
  </div>
);