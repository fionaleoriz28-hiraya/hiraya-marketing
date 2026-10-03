import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PLATFORMS, useBusiness } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { startWelcomeTour } from "@/components/WelcomeTour";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Business profile — Hiraya Marketing" },
      {
        name: "description",
        content:
          "Tell Hiraya about your business so every audit, content plan and ad idea fits your goals and budget.",
      },
      { property: "og:title", content: "Business profile — Hiraya Marketing" },
      {
        property: "og:description",
        content: "Your business details power every recommendation in Hiraya Marketing.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { data: business, isLoading } = useBusiness();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    audience: "",
    goals: "",
    monthly_budget: "",
    platforms: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? "",
        industry: business.industry ?? "",
        location: business.location ?? "",
        audience: business.audience ?? "",
        goals: business.goals ?? "",
        monthly_budget: business.monthly_budget != null ? String(business.monthly_budget) : "",
        platforms: business.platforms ?? [],
      });
    }
  }, [business]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      name: form.name,
      industry: form.industry || null,
      location: form.location || null,
      audience: form.audience || null,
      goals: form.goals || null,
      monthly_budget: form.monthly_budget ? Number(form.monthly_budget) : null,
      platforms: form.platforms,
    };

    const { error } = business
      ? await supabase.from("businesses").update(payload).eq("id", business.id)
      : await supabase.from("businesses").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Business profile saved");
    queryClient.invalidateQueries({ queryKey: ["business"] });
    if (!business && localStorage.getItem(`hiraya-tour:${user.id}`) !== "done") {
      startWelcomeTour(user.id);
      window.dispatchEvent(new Event("hiraya-tour-start"));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Business profile</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        The more you share, the sharper every suggestion becomes.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={save} className="card-soft space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Likha Handmade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="Handmade skincare"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Quezon City, Philippines"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly marketing budget (PHP)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="100"
                value={form.monthly_budget}
                onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Who are your customers?</Label>
            <Textarea
              id="audience"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              placeholder="Women 25-40 in Metro Manila who care about natural products"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">What do you want to achieve?</Label>
            <Textarea
              id="goals"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              placeholder="More walk-ins, 2x online orders, build a loyal community"
            />
          </div>

          <div className="space-y-3">
            <Label>Platforms you use</Label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => {
                const checked = form.platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        setForm({
                          ...form,
                          platforms: value
                            ? [...form.platforms, platform]
                            : form.platforms.filter((p) => p !== platform),
                        })
                      }
                    />
                    {platform}
                  </label>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      )}
    </div>
  );
}
