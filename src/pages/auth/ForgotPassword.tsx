import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPassword() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure reset link." footer={<><Link to="/login" className="font-medium text-accent hover:underline">Back to sign in</Link></>}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
        <Button type="submit" className="w-full rounded-lg">Send reset link</Button>
      </form>
    </AuthShell>
  );
}