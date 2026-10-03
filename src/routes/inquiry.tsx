import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, HeartHandshake, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/inquiry")({
  head: () => ({
    meta: [
      { title: "Client Inquiry — Hiraya Marketing" },
      {
        name: "description",
        content:
          "Tell Hiraya about your business and explore the 6-Week Marketing Trial or other digital marketing support.",
      },
    ],
  }),
  component: InquiryPage,
});

const services = [
  "6-Week Marketing Trial",
  "Social Media Marketing",
  "Content Creation",
  "Digital Marketing",
  "Growth & Brand Visibility",
  "Not sure yet — help me choose",
];

function InquiryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    socialLinks: "",
    services: [] as string[],
    challenge: "",
    budget: "",
    message: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleService(service: string) {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.services.length) {
      toast.error("Please choose at least one service or tell us you need help choosing.");
      return;
    }

    setSaving(true);
    const { error } = await (supabase as any).rpc("submit_public_inquiry", {
      p_full_name: form.fullName.trim(),
      p_business_name: form.businessName.trim(),
      p_email: form.email.trim(),
      p_phone: form.phone.trim() || null,
      p_business_type: form.businessType.trim() || null,
      p_social_links: form.socialLinks.trim() || null,
      p_services: form.services,
      p_challenge: form.challenge.trim() || null,
      p_budget: form.budget.trim() || null,
      p_message: form.message.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast.error("We couldn't send your inquiry yet. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="Back to Hiraya Marketing">
            <img src="/hiraya-logo.svg" alt="Hiraya Marketing" className="h-12 w-12 object-contain" />
          </Link>
          <Button asChild variant="ghost">
            <Link to="/">Back to home</Link>
          </Button>
        </header>
        <main className="mx-auto flex min-h-[75vh] max-w-2xl items-center px-5 py-16">
          <section className="w-full rounded-[1.5rem] border border-border bg-card p-8 text-center shadow-soft sm:p-12">
            <CheckCircle2 className="mx-auto size-12 text-primary" />
            <p className="eyebrow mt-6 text-primary">Inquiry received</p>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Let’s make your vision visible.</h1>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Thank you for telling us about your business. Hiraya can now review what you need and continue the
              conversation about the right service or 6-Week Trial fit.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/">Return to Hiraya <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/auth">Sign in to your workspace</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="Back to Hiraya Marketing">
            <img src="/hiraya-logo.svg" alt="Hiraya Marketing" className="h-12 w-12 object-contain" />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="mr-1 size-4" /> Back to home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="lg:sticky lg:top-8">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary">
              <HeartHandshake className="size-5 text-primary" />
            </div>
            <p className="eyebrow mt-6 text-primary">Start a conversation</p>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Tell us about your business.</h1>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Whether you are applying for the 6-Week Marketing Trial or looking for another kind of support, start
              with the context that matters.
            </p>
            <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-5">
              <p className="text-sm font-semibold">What happens next?</p>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><span className="font-semibold text-foreground">1.</span> Hiraya reviews your inquiry.</li>
                <li><span className="font-semibold text-foreground">2.</span> We discuss your goals and fit.</li>
                <li><span className="font-semibold text-foreground">3.</span> You receive the appropriate proposal or next step.</li>
                <li><span className="font-semibold text-foreground">4.</span> Once agreed, payment and onboarding begin.</li>
              </ol>
            </div>
          </aside>

          <form onSubmit={submit} className="card-soft space-y-7 p-6 sm:p-8">
            <div>
              <h2 className="font-display text-2xl font-semibold">Client inquiry</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fields marked with * are required.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Your name *</Label>
                <Input id="fullName" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Fiona Leoriz" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name *</Label>
                <Input id="businessName" required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Your business" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="09XX XXX XXXX" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="businessType">Business type / industry</Label>
                <Input id="businessType" value={form.businessType} onChange={(e) => update("businessType", e.target.value)} placeholder="Food, retail, service business, startup, etc." />
              </div>
            </div>

            <div className="space-y-3">
              <Label>What would you like help with? *</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {services.map((service) => (
                  <label key={service} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm transition-colors hover:bg-secondary/40">
                    <input
                      type="checkbox"
                      checked={form.services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="size-4 accent-[var(--primary)]"
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="socialLinks">Social media / website links</Label>
                <Textarea id="socialLinks" value={form.socialLinks} onChange={(e) => update("socialLinks", e.target.value)} placeholder="Facebook, Instagram, TikTok, website, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenge">What is your biggest marketing challenge?</Label>
                <Textarea id="challenge" value={form.challenge} onChange={(e) => update("challenge", e.target.value)} placeholder="Tell us what feels difficult right now." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget range (optional)</Label>
                <Input id="budget" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. ₱3,000–₱5,000 / month" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Anything else Hiraya should know?</Label>
              <Textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Your goals, timeline, current situation, or anything you want us to understand." className="min-h-32" />
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                By submitting, you are asking Hiraya Marketing to contact you about your inquiry. Trial pricing is
                discussed during consultation.
              </p>
              <Button type="submit" size="lg" disabled={saving}>
                <Send className="mr-1 size-4" />
                {saving ? "Sending…" : "Send inquiry"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
