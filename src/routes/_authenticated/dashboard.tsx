import { createFileRoute, Link } from "@tanstack/react-router";
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
          "See your brand awareness score, engagement rate and follower growth at a glance in Hiraya Marketing.",
      },
      { property: "og:title", content: "Dashboard — Hiraya Marketing" },
      {
        property: "og:description",
        content: "Your marketing numbers in one calm view: awareness, engagement and growth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const shortcuts = [
  { to: "/audit", label: "Brand awareness audit", copy: "Check how visible your brand is." },
  { to: "/engagement", label: "Engagement analysis", copy: "See which posts people respond to." },
  { to: "/growth", label: "Growth tracking", copy: "Log followers and watch the trend." },
  { to: "/planner", label: "Content planner", copy: "Plan what to post, week by week." },
  { to: "/strategy", label: "Strategy & ads", copy: "Build a plan and ad ideas." },
  { to: "/assistant", label: "Assistant", copy: "Ask for marketing help anytime." },
] as const;

function scoreBand(score: number) {
  if (score >= 75) return "Strong";
  if (score >= 45) return "Getting there";
  return "Needs work";
}

function Dashboard() {
  const { data: business, isLoading } = useBusiness();
  const { data: audits = [] } = useRows<Audit>("audits", "created_at");
  const { data: posts = [] } = useRows<Post>("posts", "posted_at");
  const { data: snapshots = [] } = useRows<Snapshot>("growth_snapshots", "period");
  const { data: planned = [] } = useRows<ContentItem>("content_items", "scheduled_date", true);

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
    followerChange != null && priorTrend && priorTrend.followers
      ? (followerChange / priorTrend.followers) * 100
      : null;

  const upcoming = planned
    .filter((item) => new Date(`${item.scheduled_date}T00:00:00`) >= new Date(new Date().toDateString()))
    .slice(0, 4);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">
        {business?.name ? `Welcome back, ${business.name}` : "Welcome to Hiraya"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">From vision to visibility.</p>

      {!isLoading && !business && (
        <div className="card-soft mt-6 p-6">
          <h2 className="font-display text-lg font-semibold">Start with your business profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about your business so every suggestion fits you.
          </p>
          <Button asChild className="mt-4">
            <Link to="/profile">Add business details</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Awareness score"
          value={latestAudit ? `${Math.round(latestAudit.score)}/100` : "—"}
          hint={
            latestAudit
              ? `${scoreBand(latestAudit.score)}${
                  auditDelta != null
                    ? ` · ${auditDelta >= 0 ? "+" : ""}${auditDelta} vs last audit`
                    : ""
                }`
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
              ? `${followerChange >= 0 ? "+" : ""}${formatNumber(followerChange)}${
                  followerPct != null ? ` (${followerPct.toFixed(1)}%)` : ""
                } vs ${priorTrend?.label}`
              : latestTrend
                ? `As of ${latestTrend.label}`
                : "Add a monthly snapshot"
          }
        />
        <StatCard
          label="Total reach"
          value={totalReach ? formatNumber(totalReach) : "—"}
          hint={bestPost ? `Best post: ${bestPost.title}` : "From the posts you log"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-base font-semibold">Growth trend</h2>
            <Link to="/growth" className="text-xs text-muted-foreground underline">
              Update numbers
            </Link>
          </div>
          {trend.length < 2 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Add at least two monthly snapshots in Growth tracking to see your trend line here.
            </p>
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
                    strokeWidth={2}
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
        </div>

        <div className="card-soft p-5">
          <h2 className="font-display text-base font-semibold">What to do next</h2>
          {latestAudit?.recommendations?.length ? (
            <ul className="mt-3 space-y-3">
              {latestAudit.recommendations.slice(0, 3).map((item) => (
                <li key={item.title}>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Run a brand awareness audit and your top three actions will appear here.
            </p>
          )}
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link to="/audit">Open audit</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-soft p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-base font-semibold">Coming up</h2>
            <Link to="/planner" className="text-xs text-muted-foreground underline">
              Plan more
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {upcoming.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.theme || item.caption.slice(0, 48)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.platform} ·{" "}
                      {new Date(`${item.scheduled_date}T00:00:00`).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{item.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-soft p-5">
          <h2 className="font-display text-base font-semibold">Recent posts</h2>
          {recentPosts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Log a few posts in Engagement analysis to see them here.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentPosts.slice(0, 4).map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.platform} · {formatNumber(post.reach)} reached
                    </p>
                  </div>
                  <span className="text-sm font-medium">{engagementRate(post).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">Jump back in</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card-soft p-5 transition-colors hover:bg-secondary/50"
          >
            <h3 className="font-display text-base font-semibold">{item.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
          </Link>
        ))}
      </div>

      {!isLoading && !business && posts.length === 0 && audits.length === 0 && (
        <EmptyState>
          Your numbers will fill in as you run an audit, log posts and add monthly snapshots.
        </EmptyState>
      )}

      <ChatWidget />
    </div>
  );
}
