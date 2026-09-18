import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Megaphone, Pencil, Plus, Save, Sparkles, Target, Trash2, X } from "lucide-react";

import { PageHeader, EmptyState, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { friendlyError, PLATFORMS, toAiBusiness, useBusiness } from "@/lib/business";
import { useDeleteRow, useInsertRow, useRows, useUpdateRow, type AdCampaign, type Strategy } from "@/lib/data";
import { generateAdPlan, generateStrategy } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/strategy")({
  head: () => ({
    meta: [
      { title: "Strategy & ads — Hiraya Marketing" },
      {
        name: "description",
        content: "Build a practical 90-day marketing strategy and paid advertising plan.",
      },
      { property: "og:title", content: "Strategy & ads — Hiraya Marketing" },
      { property: "og:description", content: "Turn your goals and budget into a clear plan and ad ideas." },
    ],
  }),
  component: StrategyPage,
});

const AD_STATUSES = ["idea", "draft", "ready", "active", "paused"] as const;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StrategyPage() {
  const { data: business } = useBusiness();
  const { data: strategies } = useRows<Strategy>("strategies", "created_at");
  const { data: campaigns } = useRows<AdCampaign>("ad_campaigns", "created_at");
  const insertStrategy = useInsertRow("strategies");
  const deleteStrategy = useDeleteRow("strategies");
  const insertCampaign = useInsertRow("ad_campaigns");
  const updateCampaign = useUpdateRow("ad_campaigns");
  const deleteCampaign = useDeleteRow("ad_campaigns");

  const [notes, setNotes] = useState("");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [generatingAds, setGeneratingAds] = useState(false);
  const [budget, setBudget] = useState(business?.monthly_budget?.toString() ?? "");
  const [objective, setObjective] = useState("Conversions / sales");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);

  const activeStrategy = strategy ?? strategies?.[0] ?? null;
  const activeCampaigns = useMemo(() => campaigns ?? [], [campaigns]);

  async function buildStrategy() {
    if (!business) {
      toast.error("Complete your Business Profile first so Hiraya can tailor the strategy.");
      return;
    }
    setGeneratingStrategy(true);
    try {
      const result = await generateStrategy({
        data: { business: toAiBusiness(business), notes: notes.trim() },
      });
      await insertStrategy.mutateAsync({
        title: result.title,
        summary: result.summary,
        details: {
          positioning: result.positioning,
          pillars: result.pillars,
          channels: result.channels,
          monthlyActions: result.monthlyActions,
          kpis: result.kpis,
        },
      });
      setStrategy(null);
      setNotes("");
      toast.success("90-day strategy generated and saved");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setGeneratingStrategy(false);
    }
  }

  async function buildAds() {
    if (!business) {
      toast.error("Complete your Business Profile first so Hiraya can tailor the ad plan.");
      return;
    }
    setGeneratingAds(true);
    try {
      const result = await generateAdPlan({
        data: {
          business: toAiBusiness(business),
          budget: budget.trim() ? `PHP ${budget.trim()}` : "",
          objective: objective.trim(),
        },
      });
      const generated = result.campaigns.filter((item) => item.name.trim()).map((item) => ({
        name: item.name,
        platform: PLATFORMS.includes(item.platform as (typeof PLATFORMS)[number]) ? item.platform : PLATFORMS[0],
        objective: item.objective,
        budget: parseBudget(item.budgetShare),
        targeting: item.targeting,
        ad_copy: item.adCopy,
        notes: `Expected outcome: ${item.expected}`,
        status: "idea",
      }));
      if (!generated.length) {
        toast.error("The AI returned no usable campaigns. Please try again.");
        return;
      }
      await insertCampaign.mutateAsync(generated);
      toast.success(`Generated ${generated.length} ad campaign ideas`);
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setGeneratingAds(false);
    }
  }

  function loadStrategy(item: Strategy) {
    setStrategy(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader
        title="Strategy & ads"
        subtitle="Turn your business goals and budget into a practical 90-day strategy and paid campaign ideas."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="90-day strategy" value={activeStrategy ? "Ready" : "Not yet"} hint="Your latest saved plan" />
        <StatCard label="Ad campaigns" value={String(activeCampaigns.length)} hint="Ideas and campaigns saved" />
        <StatCard label="Platforms" value={String(business?.platforms?.length ?? 0)} hint="From your business profile" />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="card-soft p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="rounded-lg bg-secondary p-2.5">
                <Target className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">90-day marketing strategy</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hiraya will turn your business profile into positioning, content pillars, channel plans, actions and KPIs.
                </p>
              </div>
            </div>
            {activeStrategy ? (
              <Button variant="outline" size="sm" onClick={() => setStrategy(null)}>Show latest saved</Button>
            ) : null}
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="strategy-notes">Optional notes</Label>
            <Textarea
              id="strategy-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell Hiraya about a new offer, seasonal campaign, competitor, challenge, or priority."
            />
          </div>
          <Button className="mt-4" onClick={buildStrategy} disabled={generatingStrategy}>
            <Sparkles className="mr-2 size-4" />
            {generatingStrategy ? "Building strategy…" : "Generate 90-day strategy"}
          </Button>

          {activeStrategy ? (
            <div className="mt-6 rounded-xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Latest strategy</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{activeStrategy.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeStrategy.summary}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{formatDate(activeStrategy.created_at)}</span>
              </div>

              {activeStrategy.details.positioning ? (
                <div className="mt-5 rounded-lg bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Positioning</p>
                  <p className="mt-2 text-sm leading-6">{activeStrategy.details.positioning}</p>
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {activeStrategy.details.pillars?.map((pillar) => (
                  <div key={pillar.name} className="rounded-lg border border-border p-4">
                    <h4 className="font-medium">{pillar.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
                  </div>
                ))}
              </div>

              {activeStrategy.details.channels?.length ? (
                <div className="mt-5">
                  <h4 className="font-medium">Channel plans</h4>
                  <div className="mt-3 space-y-2">
                    {activeStrategy.details.channels.map((channel) => (
                      <div key={channel.channel} className="rounded-lg border border-border p-4">
                        <p className="text-sm font-semibold">{channel.channel}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{channel.plan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <ListBlock title="Monthly actions" items={activeStrategy.details.monthlyActions ?? []} />
                <ListBlock title="KPIs to watch" items={activeStrategy.details.kpis ?? []} />
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState>No strategy yet. Generate one using your Business Profile and any extra context above.</EmptyState>
            </div>
          )}
        </div>

        <aside className="card-soft h-fit p-5">
          <div className="flex gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">What Hiraya uses</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your industry, location, audience, goals, budget and platforms—plus any notes you add.
              </p>
            </div>
          </div>
          {business ? (
            <div className="mt-4 space-y-2 text-sm">
              <ProfileLine label="Business" value={business.name} />
              <ProfileLine label="Industry" value={business.industry || "Not set"} />
              <ProfileLine label="Audience" value={business.audience || "Not set"} />
              <ProfileLine label="Budget" value={business.monthly_budget != null ? `PHP ${business.monthly_budget.toLocaleString()}/month` : "Not set"} />
              <ProfileLine label="Platforms" value={business.platforms?.join(", ") || "Not set"} />
            </div>
          ) : (
            <div className="mt-4"><EmptyState>Complete your Business Profile to personalize AI recommendations.</EmptyState></div>
          )}
        </aside>
      </section>

      <section className="mt-8 card-soft p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-lg bg-secondary p-2.5">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Paid ads planner</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate 2–4 campaign concepts with budget splits, targeting, copy and realistic expected outcomes.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="ad-budget">Ad budget</Label>
            <Input id="ad-budget" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 3000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-objective">Main objective</Label>
            <select
              id="ad-objective"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            >
              <option>Conversions / sales</option>
              <option>Leads / inquiries</option>
              <option>Website traffic</option>
              <option>Brand awareness</option>
              <option>Engagement</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={buildAds} disabled={generatingAds} className="w-full md:w-auto">
              <Sparkles className="mr-2 size-4" />
              {generatingAds ? "Planning…" : "Generate ad plan"}
            </Button>
          </div>
        </div>

        {!activeCampaigns.length ? (
          <div className="mt-5"><EmptyState>No ad campaigns saved yet. Generate an ad plan to create your first campaign ideas.</EmptyState></div>
        ) : (
          <div className="mt-5 space-y-3">
            {activeCampaigns.map((campaign) => {
              const isOpen = expanded === campaign.id;
              const isEditing = editingCampaign === campaign.id;
              return (
                <div key={campaign.id} className="rounded-xl border border-border bg-background">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setExpanded(isOpen ? null : campaign.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{campaign.name}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{campaign.platform}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{campaign.status}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{campaign.objective || "No objective set"}</p>
                    </button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setExpanded(isOpen ? null : campaign.id)} aria-label="Expand campaign">
                        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingCampaign(isEditing ? null : campaign.id)} aria-label="Edit campaign">
                        {isEditing ? <X className="size-4" /> : <Pencil className="size-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCampaign.mutate(campaign.id, {
                          onSuccess: () => toast.success("Campaign deleted"),
                          onError: (error) => toast.error(friendlyError(error)),
                        })}
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {isOpen ? <CampaignDetails campaign={campaign} /> : null}
                  {isEditing ? (
                    <CampaignEditor
                      campaign={campaign}
                      onSave={async (values) => {
                        try {
                          await updateCampaign.mutateAsync({ id: campaign.id, values });
                          toast.success("Campaign updated");
                          setEditingCampaign(null);
                        } catch (error) {
                          toast.error(friendlyError(error));
                        }
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 card-soft p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Saved strategies</h2>
            <p className="mt-1 text-sm text-muted-foreground">Reload an earlier strategy whenever you want to compare plans.</p>
          </div>
        </div>
        {!strategies?.length ? (
          <div className="mt-4"><EmptyState>Your saved strategies will appear here.</EmptyState></div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {strategies.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
                <button type="button" className="min-w-0 text-left" onClick={() => loadStrategy(item)}>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteStrategy.mutate(item.id, {
                    onSuccess: () => {
                      if (strategy?.id === item.id) setStrategy(null);
                      toast.success("Strategy deleted");
                    },
                    onError: (error) => toast.error(friendlyError(error)),
                  })}
                  aria-label="Delete strategy"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function parseBudget(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-medium">{title}</h4>
      {items.length ? (
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {items.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2"><span>•</span><span>{item}</span></li>)}
        </ul>
      ) : <p className="mt-2 text-sm text-muted-foreground">No items provided.</p>}
    </div>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right">{value}</span>
    </div>
  );
}

function CampaignDetails({ campaign }: { campaign: AdCampaign }) {
  return (
    <div className="grid gap-4 border-t border-border bg-muted/20 p-4 md:grid-cols-2">
      <Detail label="Budget allocation" value={campaign.budget != null ? `PHP ${campaign.budget.toLocaleString()}` : "Not specified"} />
      <Detail label="Objective" value={campaign.objective || "Not specified"} />
      <Detail label="Targeting" value={campaign.targeting || "Not specified"} />
      <Detail label="Ad copy" value={campaign.ad_copy || "Not specified"} />
      {campaign.notes ? <Detail label="Notes / expected outcome" value={campaign.notes} /> : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value}</p>
    </div>
  );
}

function CampaignEditor({
  campaign,
  onSave,
}: {
  campaign: AdCampaign;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [status, setStatus] = useState(campaign.status);
  const [budget, setBudget] = useState(campaign.budget?.toString() ?? "");
  const [objective, setObjective] = useState(campaign.objective ?? "");
  const [targeting, setTargeting] = useState(campaign.targeting ?? "");
  const [adCopy, setAdCopy] = useState(campaign.ad_copy ?? "");
  const [notes, setNotes] = useState(campaign.notes ?? "");

  return (
    <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Status</Label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {AD_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Budget</Label>
        <Input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="PHP amount" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Objective</Label>
        <Input value={objective} onChange={(e) => setObjective(e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Targeting</Label>
        <Textarea rows={3} value={targeting} onChange={(e) => setTargeting(e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Ad copy</Label>
        <Textarea rows={4} value={adCopy} onChange={(e) => setAdCopy(e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Notes / expected outcome</Label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button onClick={() => onSave({
          status,
          budget: parseBudget(budget),
          objective: objective.trim() || null,
          targeting: targeting.trim() || null,
          ad_copy: adCopy.trim() || null,
          notes: notes.trim() || null,
        })}>
          <Save className="mr-2 size-4" /> Save campaign
        </Button>
      </div>
    </div>
  );
}
