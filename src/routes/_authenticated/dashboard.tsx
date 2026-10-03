import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Compass,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Store,
  Target,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChatWidget } from "@/components/chat-widget";
import { EmptyState, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/business";
import {
  engagementRate,
  formatMonth,
  formatNumber,
  useRows,
  type Audit,
  type ContentItem,
  type Post,
  type Snapshot,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hiraya Marketing" },
      {
        name: "description",
        content:
          "Your Hiraya Marketing workspace for brand awareness, engagement, growth, content planning and strategy.",
      },
      { property: "og:title", content: "Dashboard — Hiraya Marketing" },
      {
        property: "og:description",
        content: "See your marketing health, growth and next actions in one calm workspace.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${import.meta.env.BASE_URL}hiraya-logo.svg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${import.meta.env.BASE_URL}hiraya-logo.svg` },
    ],
  }),
  component: Dashboard,
});

const shortcuts = [
  { to: "/audit", label: "Run an audit", copy: "Check your brand visibility.", icon: Search },
  { to: "/engagement", label: "Log engagement", copy: "See what your audience responds to.", icon: Heart },
  { to: "/growth", label: "Track growth", copy: "Add your latest numbers.", icon: BarChart3 },
  { to: "/planner", label: "Plan content", copy: "Build your next posts.", icon: CalendarDays },
  { to: "/strategy", label: "Build strategy", copy: "Create your 90-day plan.", icon: Compass },
  { to: "/assistant", label: "Ask Hiraya", copy: "Get marketing guidance.", icon: MessageCircle },
] as const;

function scoreBand(score: number) {
  if (score >= 75) return "Strong foundation";
  if (score >= 45) return "Room to grow";
  return "Start improving";
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Dashboard() {
  const { data: business, isLoading: businessLoading } = useBusiness();
  const { data: audits = [], isLoading: auditsLoading } = useRows<Audit>("audits", "created_at");
  const { data: posts = [], isLoading: postsLoading } = useRows<Post>("posts", "posted_at");
  const { data: snapshots = [], isLoading: snapshotsLoading } = useRows<Snapshot>(
    "growth_snapshots",
    "period",
  );
  const { data: planned = [], isLoading: plannedLoading } = useRows<ContentItem>(
    "content_items",
    "scheduled_date",
    true,
  );

  const loading =
    businessLoading || auditsLoading || postsLoading || snapshotsLoading || plannedLoading;

  const latestAudit = audits[0];
  const previousAudit = audits[1];
  const auditDelta =
    latestAudit && previousAudit ? Math.round(latestAudit.score - previousAudit.score) : null;

  const recentPosts = posts.slice(0, 12);
  const avgEngagement = recentPosts.length
    ? recentPosts.reduce((sum, post) => sum + engagementRate(post), 0) / recentPosts.length
    : null;

  const totalReach = posts.reduce((sum, post) => sum + (post.reach ?? 0), 0);
  const bestPost = posts.reduce<Post | null>(
    (best, post) => (!best || engagementRate(post) > engagementRate(best) ? post : best),
    null,
  );

  const byPeriod = new Map<string, { followers: number; reach: number; leads: number }>();
  for (const snapshot of snapshots) {
    const key = snapshot.period.slice(0, 7);
    const current = byPeriod.get(key) ?? { followers: 0, reach: 0, leads: 0 };
    byPeriod.set(key, {
      followers: current.followers + (snapshot.followers ?? 0),
      reach: current.reach + (snapshot.reach ?? 0),
      leads: current.leads + (snapshot.leads ?? 0),
    });
  }

  const trend = [...byPeriod.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, totals]) => ({ period, label: formatMonth(period), ...totals }));

  const latestTrend = trend[trend.length - 1];
  const priorTrend = trend[trend.length - 2];
  const followerChange =
    latestTrend && priorTrend ? latestTrend.followers - priorTrend.followers : null;
  const followerPct =
    followerChange != null && priorTrend?.followers
      ? (followerChange / priorTrend.followers) * 100
      : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = planned
    .filter((item) => new Date(`${item.scheduled_date}T00:00:00`) >= today)
    .slice(0, 4);

  const setupItems = [
    { label: "Business profile", done: !!business, to: "/profile" as const },
    { label: "First audit", done: audits.length > 0, to: "/audit" as const },
    { label: "First growth snapshot", done: snapshots.length > 0, to: "/growth" as const },
    { label: "First content item", done: planned.length > 0, to: "/planner" as const },
  ];
  const setupComplete = setupItems.filter((item) => item.done).length;

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-primary uppercase">
              <Sparkles className="size-3.5" />
              Marketing workspace
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              {business?.name ? `Welcome back, ${business.name}` : "Welcome to Hiraya"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {business
                ? "Here is your latest marketing picture. Use the numbers below to decide what to do next."
                : "Set up your business profile first, then Hiraya can tailor your audits, plans and recommendations."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="secondary">
              <Link to="/assistant">
                <MessageCircle className="mr-1 size-4" />
                Ask Hiraya
              </Link>
            </Button>
            <Button asChild>
              <Link to="/audit">
                <Plus className="mr-1 size-4" />
                New audit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {!loading && !business && (
        <section className="rounded-2xl border border-primary/20 bg-secondary/50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Store className="size-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Complete your business profile</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your industry, audience, goals and platforms so Hiraya's recommendations are specific to your business.
              </p>
            </div>
            <Button asChild>
              <Link to="/profile">Set up profile <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">At a glance</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Your marketing numbers</h2>
          </div>
          <span className="text-xs text-muted-foreground">{formatRelativeDate(new Date().toISOString())}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Awareness score"
            value={latestAudit ? `${Math.round(latestAudit.score)}/100` : "—"}
            hint={
              latestAudit
                ? `${scoreBand(latestAudit.score)}${auditDelta != null ? ` · ${auditDelta >= 0 ? "+" : ""}${auditDelta} vs last` : ""}`
                : "Run your first audit"
            }
          />
          <StatCard
            label="Engagement rate"
            value={avgEngagement != null ? `${avgEngagement.toFixed(1)}%` : "—"}
            hint={
              recentPosts.length
                ? `Average of your last ${recentPosts.length} post${recentPosts.length === 1 ? "" : "s"}`
                : "Log a post to see this"
            }
          />
          <StatCard
            label="Followers"
            value={latestTrend ? formatNumber(latestTrend.followers) : "—"}
            hint={
              followerChange != null
                ? `${followerChange >= 0 ? "+" : ""}${formatNumber(followerChange)}${followerPct != null ? ` (${followerPct.toFixed(1)}%)` : ""} vs ${priorTrend?.label}`
                : latestTrend
                  ? `As of ${latestTrend.label}`
                  : "Add a monthly snapshot"
            }
          />
          <StatCard
            label="Total reach"
            value={totalReach ? formatNumber(totalReach) : "—"}
            hint={bestPost ? `Best logged post: ${bestPost.title}` : "From the posts you log"}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card-soft p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Growth</p>
              <h2 className="mt-1 font-display text-lg font-semibold">Audience trend</h2>
            </div>
            <Link to="/growth" className="text-xs text-muted-foreground underline underline-offset-4">
              Update numbers
            </Link>
          </div>

          {trend.length < 2 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/30 p-6">
              <BarChart3 className="size-5 text-primary" />
              <p className="mt-3 text-sm font-medium">Your growth chart will appear here</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Add at least two monthly snapshots to compare follower and reach trends.
              </p>
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to="/growth">Add snapshot</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    name="Followers"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    name="Reach"
                    stroke="var(--color-accent-foreground)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Next actions</p>
              <h2 className="mt-1 font-display text-lg font-semibold">Keep momentum</h2>
            </div>
            <Target className="size-5 text-primary" />
          </div>

          {latestAudit?.recommendations?.length ? (
            <ul className="mt-4 space-y-4">
              {latestAudit.recommendations.slice(0, 3).map((item) => (
                <li key={item.title} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.action}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl bg-secondary/40 p-4">
              <p className="text-sm font-medium">Start with a brand audit</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Hiraya will turn your answers into a score, gaps and practical next actions.
              </p>
            </div>
          )}
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link to="/audit">{latestAudit ? "Review audit" : "Run audit"}</Link>
          </Button>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-soft p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Content</p>
              <h2 className="mt-1 font-display text-lg font-semibold">Coming up</h2>
            </div>
            <Link to="/planner" className="text-xs text-muted-foreground underline underline-offset-4">Open planner</Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border p-5">
              <CalendarDays className="size-5 text-primary" />
              <p className="mt-3 text-sm font-medium">Nothing scheduled yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create your next content items so your marketing stays consistent.</p>
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to="/planner">Plan content</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.theme || item.caption.slice(0, 48)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.platform} · {new Date(`${item.scheduled_date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground capitalize">{item.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-soft p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Engagement</p>
              <h2 className="mt-1 font-display text-lg font-semibold">Recent posts</h2>
            </div>
            <Link to="/engagement" className="text-xs text-muted-foreground underline underline-offset-4">View all</Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border p-5">
              <Heart className="size-5 text-primary" />
              <p className="mt-3 text-sm font-medium">No posts logged yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Log your posts and Hiraya will calculate engagement automatically.</p>
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to="/engagement">Log a post</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentPosts.slice(0, 4).map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.platform} · {formatNumber(post.reach)} reached
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium">{engagementRate(post).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card-soft p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Getting started</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Build your Hiraya foundation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {setupComplete} of {setupItems.length} starter steps completed.
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary lg:max-w-xs">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(setupComplete / setupItems.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {setupItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/50"
            >
              {item.done ? (
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
              ) : (
                <div className="size-5 shrink-0 rounded-full border border-muted-foreground/40" />
              )}
              <span className={item.done ? "text-sm text-muted-foreground line-through" : "text-sm font-medium"}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Workspace</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Jump back in</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card-soft group p-5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center justify-between">
                <item.icon className="size-5 text-primary" />
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{item.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      {!loading && !business && posts.length === 0 && audits.length === 0 && snapshots.length === 0 && planned.length === 0 && (
        <EmptyState>
          Your dashboard will become more useful as you complete your profile, run an audit, log posts and add growth snapshots.
        </EmptyState>
      )}

      <ChatWidget />
    </div>
  );
}
