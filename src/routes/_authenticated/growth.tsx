import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, EmptyState, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORMS } from "@/lib/business";
import {
  formatMonth,
  formatNumber,
  useDeleteRow,
  useInsertRow,
  useRows,
  useUpdateRow,
  type Snapshot,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/growth")({
  head: () => ({
    meta: [
      { title: "Growth tracking — Hiraya Marketing" },
      {
        name: "description",
        content: "Track followers, reach and leads over time for each platform.",
      },
      { property: "og:title", content: "Growth tracking — Hiraya Marketing" },
      {
        property: "og:description",
        content: "See how your audience and marketing results are growing month by month.",
      },
    ],
  }),
  component: GrowthPage,
});

const emptyForm = {
  period: new Date().toISOString().slice(0, 7) + "-01",
  platform: "Facebook",
  followers: "",
  reach: "",
  leads: "",
};

type Metric = "followers" | "reach" | "leads";

function GrowthPage() {
  const { data: snapshots } = useRows<Snapshot>("growth_snapshots", "period", true);
  const insertSnapshot = useInsertRow("growth_snapshots");
  const updateSnapshot = useUpdateRow("growth_snapshots");
  const deleteSnapshot = useDeleteRow("growth_snapshots");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("followers");
  const [selectedPlatform, setSelectedPlatform] = useState("Facebook");

  const platforms = useMemo(() => {
    const saved = Array.from(new Set((snapshots ?? []).map((item) => item.platform)));
    return Array.from(new Set(["Facebook", ...saved, ...PLATFORMS]));
  }, [snapshots]);

  const selectedSnapshots = useMemo(
    () =>
      (snapshots ?? [])
        .filter((item) => item.platform === selectedPlatform)
        .sort((a, b) => a.period.localeCompare(b.period)),
    [snapshots, selectedPlatform],
  );

  const chartData = selectedSnapshots.map((item) => ({
    period: formatMonth(item.period),
    followers: item.followers,
    reach: item.reach,
    leads: item.leads,
  }));

  const latest = selectedSnapshots[selectedSnapshots.length - 1];
  const previous = selectedSnapshots[selectedSnapshots.length - 2];

  const changes = useMemo(() => {
    if (!latest || !previous) return null;
    return {
      followers: latest.followers - previous.followers,
      reach: latest.reach - previous.reach,
      leads: latest.leads - previous.leads,
    };
  }, [latest, previous]);

  async function saveSnapshot(event: React.FormEvent) {
    event.preventDefault();
    try {
      const values = {
        period: form.period,
        platform: form.platform,
        followers: Math.max(0, Number(form.followers) || 0),
        reach: Math.max(0, Number(form.reach) || 0),
        leads: Math.max(0, Number(form.leads) || 0),
      };

      if (editingId) {
        await updateSnapshot.mutateAsync({ id: editingId, values });
        toast.success("Growth snapshot updated");
      } else {
        await insertSnapshot.mutateAsync(values);
        toast.success("Growth snapshot saved");
      }

      setForm({ ...emptyForm, platform: form.platform, period: form.period });
      setEditingId(null);
      setSelectedPlatform(form.platform);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the snapshot");
    }
  }

  function editSnapshot(item: Snapshot) {
    setEditingId(item.id);
    setSelectedPlatform(item.platform);
    setForm({
      period: item.period.slice(0, 10),
      platform: item.platform,
      followers: String(item.followers),
      reach: String(item.reach),
      leads: String(item.leads),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function changeLabel(value: number | undefined) {
    if (value == null) return "—";
    return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
  }

  function ChangeIcon({ value }: { value: number }) {
    if (value > 0) return <TrendingUp className="size-4" />;
    if (value < 0) return <TrendingDown className="size-4" />;
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Growth tracking"
        subtitle="Log your monthly numbers and turn them into a clear picture of progress."
      />

      <form onSubmit={saveSnapshot} className="card-soft space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              {editingId ? "Edit growth snapshot" : "Add monthly snapshot"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add one snapshot for each platform you want to monitor.
            </p>
          </div>
          {editingId && (
            <Button type="button" variant="ghost" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="period">Month</Label>
            <Input
              id="period"
              type="month"
              required
              value={form.period.slice(0, 7)}
              onChange={(e) =>
                setForm({ ...form, period: `${e.target.value}-01` })
              }
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
              {PLATFORMS.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followers">Followers</Label>
            <Input
              id="followers"
              type="number"
              min="0"
              required
              value={form.followers}
              onChange={(e) => setForm({ ...form, followers: e.target.value })}
              placeholder="1,250"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reach">Reach</Label>
            <Input
              id="reach"
              type="number"
              min="0"
              required
              value={form.reach}
              onChange={(e) => setForm({ ...form, reach: e.target.value })}
              placeholder="8,500"
            />
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="leads">Leads</Label>
            <Input
              id="leads"
              type="number"
              min="0"
              required
              value={form.leads}
              onChange={(e) => setForm({ ...form, leads: e.target.value })}
              placeholder="42"
            />
          </div>
        </div>

        <Button type="submit" disabled={insertSnapshot.isPending || updateSnapshot.isPending}>
          {insertSnapshot.isPending || updateSnapshot.isPending
            ? "Saving…"
            : editingId
              ? "Update snapshot"
              : "Save snapshot"}
        </Button>
      </form>

      {latest && (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold">Month-over-month change</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {previous
                  ? `${selectedPlatform} · ${formatMonth(previous.period)} → ${formatMonth(latest.period)}`
                  : `${selectedPlatform} · add another month to compare change`}
              </p>
            </div>
            <select
              aria-label="Platform for growth summary"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              {platforms.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Followers"
              value={formatNumber(latest.followers)}
              hint={changes ? changeLabel(changes.followers) : "No comparison yet"}
              icon={changes ? <ChangeIcon value={changes.followers} /> : undefined}
            />
            <StatCard
              label="Reach"
              value={formatNumber(latest.reach)}
              hint={changes ? changeLabel(changes.reach) : "No comparison yet"}
              icon={changes ? <ChangeIcon value={changes.reach} /> : undefined}
            />
            <StatCard
              label="Leads"
              value={formatNumber(latest.leads)}
              hint={changes ? changeLabel(changes.leads) : "No comparison yet"}
              icon={changes ? <ChangeIcon value={changes.leads} /> : undefined}
            />
          </div>
        </div>
      )}

      {!!selectedSnapshots.length && (
        <div className="card-soft mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold">Growth trend</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedPlatform} over time
              </p>
            </div>
            <div className="flex rounded-md border border-border p-1">
              {([
                ["followers", "Followers"],
                ["reach", "Reach"],
                ["leads", "Leads"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMetric(value)}
                  className={
                    metric === value
                      ? "rounded px-3 py-1.5 text-xs font-medium bg-secondary"
                      : "rounded px-3 py-1.5 text-xs text-muted-foreground"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="period" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(value) => Number(value).toLocaleString()}
                />
                <Tooltip
                  formatter={(value) => formatNumber(Number(value))}
                  labelFormatter={(label) => String(label)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={metric}
                  name={metric === "followers" ? "Followers" : metric === "reach" ? "Reach" : "Leads"}
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card-soft mt-6 overflow-x-auto p-5">
        <h2 className="font-display text-base font-semibold">Past snapshots</h2>
        {!snapshots?.length ? (
          <div className="mt-4">
            <EmptyState>Add your first monthly snapshot above to start tracking growth.</EmptyState>
          </div>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="py-2 pr-3">Month</th>
                <th className="py-2 pr-3">Platform</th>
                <th className="py-2 pr-3">Followers</th>
                <th className="py-2 pr-3">Reach</th>
                <th className="py-2 pr-3">Leads</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...(snapshots ?? [])]
                .sort((a, b) => b.period.localeCompare(a.period))
                .map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-3 font-medium">{formatMonth(item.period)}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{item.platform}</td>
                    <td className="py-2.5 pr-3">{formatNumber(item.followers)}</td>
                    <td className="py-2.5 pr-3">{formatNumber(item.reach)}</td>
                    <td className="py-2.5 pr-3">{formatNumber(item.leads)}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editSnapshot(item)}
                          aria-label={`Edit ${item.platform} ${formatMonth(item.period)} snapshot`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteSnapshot.mutate(item.id, {
                              onSuccess: () => toast.success("Snapshot deleted"),
                              onError: (error) =>
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : "Could not delete the snapshot",
                                ),
                            })
                          }
                          aria-label={`Delete ${item.platform} ${formatMonth(item.period)} snapshot`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
