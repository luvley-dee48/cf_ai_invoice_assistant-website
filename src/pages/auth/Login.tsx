import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { useLogin } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Login - Attempting login with:', { email, password: '***' });
      const result = await login.mutateAsync({ email, password });
      console.log('Login - Success:', result);
      toast.success("Successfully logged in!");
      nav("/app");
    } catch (error) {
      console.error('Login - Error:', error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Mentic workspace." footer={<>Don't have an account? <Link to="/signup" className="font-medium text-accent hover:underline">Sign up</Link></>}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Button type="button" variant="outline" className="w-full rounded-lg">Continue with Google</Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <Button type="submit" className="w-full rounded-lg" disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}