import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";

export default function Login() {
  const nav = useNavigate();
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Mentic workspace." footer={<>Don't have an account? <Link to="/signup" className="font-medium text-accent hover:underline">Sign up</Link></>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nav("/app"); }}>
        <Button type="button" variant="outline" className="w-full rounded-lg">Continue with Google</Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@company.com" required /></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link></div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full rounded-lg">Sign in</Button>
      </form>
    </AuthShell>
  );
}