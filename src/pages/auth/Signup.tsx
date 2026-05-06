import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";

export default function Signup() {
  const nav = useNavigate();
  return (
    <AuthShell title="Create your workspace" subtitle="Free forever. No credit card required." footer={<>Already have an account? <Link to="/login" className="font-medium text-accent hover:underline">Sign in</Link></>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nav("/app"); }}>
        <Button type="button" variant="outline" className="w-full rounded-lg">Sign up with Google</Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" required /></div>
        <div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" required /></div>
        <Button type="submit" className="w-full rounded-lg">Create account</Button>
        <p className="text-center text-xs text-muted-foreground">By continuing you agree to our Terms.</p>
      </form>
    </AuthShell>
  );
}