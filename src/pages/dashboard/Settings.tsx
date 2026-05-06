import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Section = ({ title, desc, children }: any) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
    <h3 className="text-base font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    <div className="mt-5 space-y-4">{children}</div>
  </div>
);

export default function Settings() {
  return (
    <div className="grid max-w-3xl gap-6">
      <Section title="Profile" desc="How you appear inside Mentic.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Full name</Label><Input defaultValue="Alex Morgan" /></div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue="alex@mentic.ai" /></div>
        </div>
        <Button className="w-fit rounded-lg">Save changes</Button>
      </Section>
      <Section title="Notifications" desc="Choose what triggers a ping.">
        <Toggle label="Reminder emails" defaultChecked />
        <Toggle label="Weekly pipeline summary" defaultChecked />
        <Toggle label="New AI suggestions" />
      </Section>
      <Section title="Theme" desc="Coming soon — dark mode in beta.">
        <Toggle label="Use system theme" defaultChecked />
      </Section>
      <Section title="Data" desc="Export or delete your workspace at any time.">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-lg">Export data</Button>
          <Button variant="outline" className="rounded-lg text-destructive hover:text-destructive">Delete account</Button>
        </div>
      </Section>
    </div>
  );
}

const Toggle = ({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <Switch defaultChecked={defaultChecked} />
  </div>
);