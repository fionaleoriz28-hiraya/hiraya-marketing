import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState, PageHeader, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORMS } from "@/lib/business";
import {
  engagementRate,
  formatNumber,
  useDeleteRow,
  useInsertRow,
  useRows,
  type Post,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/engagement")({
  head: () => ({
    meta: [
      { title: "Engagement analysis — Hiraya Marketing" },
      {
        name: "description",
        content: "See which posts your customers respond to and what to do more of.",
      },
      { property: "og:title", content: "Engagement analysis — Hiraya Marketing" },
      { property: "og:description", content: "Understand what your audience responds to." },
    ],
  }),
  component: EngagementPage,
});

const FORMATS = ["Reel", "Carousel", "Photo", "Story", "Video", "Text"] as const;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const emptyForm = {
  title: "",
  platform: "Facebook",
  format: "Photo",
  posted_at: new Date().toISOString().slice(0, 10),
  reach: "",
  likes: "",
  comments: "",
  shares: "",
};

function EngagementPage() {
  const { data: posts } = useRows<Post>("posts", "posted_at");
  const insertPost = useInsertRow("posts");
  const deletePost = useDeleteRow("posts");
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const list = posts ?? [];
    if (!list.length) return null;
    const rates = list.map(engagementRate);
    const average = rates.reduce((a, b) => a + b, 0) / list.length;
    const totalReach = list.reduce((sum, post) => sum + post.reach, 0);
    let bestIndex = 0;
    rates.forEach((rate, index) => {
      if (rate > (rates[bestIndex] ?? 0)) bestIndex = index;
    });

    const group = (key: "format" | "platform") => {
      const map = new Map<string, { total: number; count: number }>();
      list.forEach((post, index) => {
        const entry = map.get(post[key]) ?? { total: 0, count: 0 };
        entry.total += rates[index] ?? 0;
        entry.count += 1;
        map.set(post[key], entry);
      });
      return Array.from(map.entries()).map(([name, value]) => ({
        name,
        rate: Number((value.total / value.count).toFixed(2)),
      }));
    };

    const dayMap = new Map<string, { total: number; count: number }>();
    list.forEach((post, index) => {
      const day = DAYS[new Date(post.posted_at).getDay()] ?? "";
      const entry = dayMap.get(day) ?? { total: 0, count: 0 };
      entry.total += rates[index] ?? 0;
      entry.count += 1;
      dayMap.set(day, entry);
    });
    const bestDay = Array.from(dayMap.entries())
      .map(([day, value]) => ({ day, rate: value.total / value.count }))
      .sort((a, b) => b.rate - a.rate)[0];

    return {
      average,
      totalReach,
      best: list[bestIndex]!,
      bestRate: rates[bestIndex] ?? 0,
      byFormat: group("format"),
      byPlatform: group("platform"),
      bestDay,
    };
  }, [posts]);

  async function addPost(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    try {
      await insertPost.mutateAsync({
        title: form.title.trim(),
        platform: form.platform,
        format: form.format,
        posted_at: form.posted_at,
        reach: Number(form.reach) || 0,
        likes: Number(form.likes) || 0,
        comments: Number(form.comments) || 0,
        shares: Number(form.shares) || 0,
      });
      setForm({ ...emptyForm, platform: form.platform, format: form.format });
      toast.success("Post added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the post");
    }
  }

  return (
    <div>
      <PageHeader
        title="Engagement analysis"
        subtitle="Add your posts with likes, comments and reach to see what works best."
      />

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Average engagement" value={`${stats.average.toFixed(2)}%`} />
          <StatCard label="Total reach" value={formatNumber(stats.totalReach)} />
          <StatCard
            label="Best post"
            value={`${stats.bestRate.toFixed(2)}%`}
            hint={stats.best.title}
          />
        </div>
      )}

      <form onSubmit={addPost} className="card-soft space-y-5 p-6">
        <h2 className="font-display text-base font-semibold">Add a post</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Post title or description</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Weekend sale reel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <select
              id="platform"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <select
              id="format"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            >
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="posted_at">Date posted</Label>
            <Input
              id="posted_at"
              type="date"
              value={form.posted_at}
              onChange={(e) => setForm({ ...form, posted_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reach">Reach</Label>
            <Input
              id="reach"
              type="number"
              min="0"
              value={form.reach}
              onChange={(e) => setForm({ ...form, reach: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="likes">Likes</Label>
            <Input
              id="likes"
              type="number"
              min="0"
              value={form.likes}
              onChange={(e) => setForm({ ...form, likes: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Input
              id="comments"
              type="number"
              min="0"
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shares">Shares</Label>
            <Input
              id="shares"
              type="number"
              min="0"
              value={form.shares}
              onChange={(e) => setForm({ ...form, shares: e.target.value })}
            />
          </div>
        </div>
        <Button type="submit" disabled={insertPost.isPending}>
          {insertPost.isPending ? "Saving…" : "Add post"}
        </Button>
      </form>

      {stats ? (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="card-soft p-5">
              <h2 className="font-display text-base font-semibold">Engagement by format</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byFormat}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                    <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="rate" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-soft p-5">
              <h2 className="font-display text-base font-semibold">Engagement by platform</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byPlatform}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                    <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="rate" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {stats.bestDay && (
            <p className="mt-4 text-sm text-muted-foreground">
              Your posts do best on <strong className="text-foreground">{stats.bestDay.day}</strong>{" "}
              — average {stats.bestDay.rate.toFixed(2)}% engagement.
            </p>
          )}

          <div className="card-soft mt-6 overflow-x-auto p-5">
            <h2 className="font-display text-base font-semibold">Your posts</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3">Post</th>
                  <th className="py-2 pr-3">Platform</th>
                  <th className="py-2 pr-3">Reach</th>
                  <th className="py-2 pr-3">Rate</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(posts ?? []).map((post) => (
                  <tr key={post.id}>
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{post.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {post.format} · {new Date(post.posted_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{post.platform}</td>
                    <td className="py-2.5 pr-3">{formatNumber(post.reach)}</td>
                    <td className="py-2.5 pr-3">{engagementRate(post).toFixed(2)}%</td>
                    <td className="py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePost.mutate(post.id)}
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState>Add your first post above to see your engagement rate and trends.</EmptyState>
        </div>
      )}
    </div>
  );
}
