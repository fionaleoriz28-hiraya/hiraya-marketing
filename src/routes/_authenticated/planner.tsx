import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteRow, useInsertRow, useRows, useUpdateRow, type ContentItem } from "@/lib/data";
import { friendlyError, PLATFORMS, toAiBusiness, useBusiness } from "@/lib/business";
import { generateContentPlan } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Content planner — Hiraya Marketing" },
      {
        name: "description",
        content: "Plan what to post on your social media, week by week, with ideas that fit you.",
      },
      { property: "og:title", content: "Content planner — Hiraya Marketing" },
      { property: "og:description", content: "Plan your social media posts with confidence." },
    ],
  }),
  component: PlannerPage,
});

const STATUSES = ["idea", "drafted", "scheduled", "posted"] as const;
type Status = (typeof STATUSES)[number];

function localDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function statusClass(status: string) {
  if (status === "posted") return "bg-primary/10 text-primary";
  if (status === "scheduled") return "bg-secondary text-secondary-foreground";
  if (status === "drafted") return "bg-muted text-foreground";
  return "bg-accent text-accent-foreground";
}

const emptyForm = {
  scheduled_date: localDate(new Date()),
  platform: "Facebook",
  theme: "",
  caption: "",
  hashtags: "",
  status: "idea" as Status,
};

function PlannerPage() {
  const { data: business } = useBusiness();
  const { data: items } = useRows<ContentItem>("content_items", "scheduled_date", true);
  const insertItem = useInsertRow("content_items");
  const updateItem = useUpdateRow("content_items");
  const deleteItem = useDeleteRow("content_items");

  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(localDate(today));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm, scheduled_date: localDate(today) });
  const [focus, setFocus] = useState("");
  const [generating, setGenerating] = useState(false);

  const monthStart = localDate(month);
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const monthEnd = localDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0));

  const monthItems = useMemo(
    () =>
      (items ?? [])
        .filter((item) => {
          const date = item.scheduled_date.slice(0, 10);
          return date >= monthStart && date <= monthEnd;
        })
        .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)),
    [items, monthStart, monthEnd],
  );

  const selectedItems = useMemo(
    () => (items ?? []).filter((item) => item.scheduled_date.slice(0, 10) === selectedDate),
    [items, selectedDate],
  );

  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const leading = first.getDay();
    const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  function openNew(date = selectedDate) {
    setEditingId(null);
    setForm({ ...emptyForm, scheduled_date: date });
  }

  function editItem(item: ContentItem) {
    setEditingId(item.id);
    setSelectedDate(item.scheduled_date.slice(0, 10));
    setForm({
      scheduled_date: item.scheduled_date.slice(0, 10),
      platform: item.platform,
      theme: item.theme ?? "",
      caption: item.caption,
      hashtags: item.hashtags ?? "",
      status: (STATUSES.includes(item.status as Status) ? item.status : "idea") as Status,
    });
  }

  function moveMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    const nextDate = new Date(next.getFullYear(), next.getMonth(), 1);
    setSelectedDate(localDate(nextDate));
    openNew(localDate(nextDate));
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    try {
      const values = {
        scheduled_date: form.scheduled_date,
        platform: form.platform,
        theme: form.theme.trim() || null,
        caption: form.caption.trim(),
        hashtags: form.hashtags.trim() || null,
        status: form.status,
      };
      if (!values.caption) {
        toast.error("Add a caption before saving.");
        return;
      }
      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, values });
        toast.success("Content item updated");
      } else {
        await insertItem.mutateAsync(values);
        toast.success("Content item added");
      }
      setSelectedDate(form.scheduled_date);
      const d = parseDate(form.scheduled_date);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      openNew(form.scheduled_date);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  async function generatePlan() {
    if (!business) {
      toast.error("Complete your Business Profile first so Hiraya can tailor the plan.");
      return;
    }
    setGenerating(true);
    try {
      const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const result = await generateContentPlan({
        data: {
          business: toAiBusiness(business),
          days,
          focus: focus.trim(),
          startDate: monthStart,
        },
      });
      const start = parseDate(monthStart);
      const generated = result.items
        .map((item) => {
          const offset = Math.min(Math.max(0, Math.round(item.dayOffset)), days - 1);
          const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
          const platform = PLATFORMS.includes(item.platform as (typeof PLATFORMS)[number])
            ? item.platform
            : PLATFORMS[0];
          return {
            scheduled_date: localDate(date),
            platform,
            theme: item.theme || result.theme,
            caption: item.caption,
            hashtags: item.hashtags,
            status: "idea",
          };
        })
        .filter((item) => item.caption.trim());

      if (!generated.length) {
        toast.error("The AI returned no usable posts. Please try again.");
        return;
      }
      await insertItem.mutateAsync(generated);
      toast.success(`Generated ${generated.length} content ideas for ${monthLabel(month)}`);
      setFocus("");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Content planner"
        subtitle="Build a clear posting calendar with ideas, captions and hashtags ready for review."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card-soft overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="font-display text-base font-semibold">{monthLabel(month)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {monthItems.length} planned {monthItems.length === 1 ? "post" : "posts"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month">
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const current = new Date(now.getFullYear(), now.getMonth(), 1);
                  setMonth(current);
                  setSelectedDate(localDate(now));
                  openNew(localDate(now));
                }}
              >
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => moveMonth(1)} aria-label="Next month">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-28 border-b border-r border-border bg-muted/10" />;
              }
              const dateKey = localDate(date);
              const dayItems = monthItems.filter((item) => item.scheduled_date.slice(0, 10) === dateKey);
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === localDate(today);
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => {
                    setSelectedDate(dateKey);
                    openNew(dateKey);
                  }}
                  className={`min-h-28 border-b border-r border-border p-2 text-left transition hover:bg-muted/30 ${isSelected ? "bg-secondary/40" : ""}`}
                >
                  <span className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="truncate rounded px-1.5 py-1 text-[10px]">
                        <span className="font-medium">{item.platform}</span>
                        <span className={`ml-1 rounded px-1 ${statusClass(item.status)}`}>{item.status}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="px-1.5 text-[10px] text-muted-foreground">+{dayItems.length - 3} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="card-soft p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold">Generate a plan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Let Hiraya draft 6–12 posts around your business profile.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="focus">Optional focus</Label>
              <Input
                id="focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. Christmas promos, customer trust"
              />
            </div>
            <Button className="mt-4 w-full" onClick={generatePlan} disabled={generating}>
              <Sparkles className="mr-2 size-4" />
              {generating ? "Generating…" : `Generate ${monthLabel(month)} plan`}
            </Button>
          </div>

          <form onSubmit={saveItem} className="card-soft space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold">
                  {editingId ? "Edit post" : "Add a post"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatDay(parseDate(form.scheduled_date))}</p>
              </div>
              {editingId ? (
                <Button type="button" variant="ghost" size="icon" onClick={() => openNew(selectedDate)} aria-label="Cancel editing">
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Date</Label>
              <Input
                id="scheduled-date"
                type="date"
                required
                value={form.scheduled_date}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, scheduled_date: value });
                  setSelectedDate(value);
                  const d = parseDate(value);
                  setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="planner-platform">Platform</Label>
                <select
                  id="planner-platform"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                >
                  {PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                >
                  {STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                placeholder="e.g. Customer story"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                required
                rows={5}
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Write a caption your audience can act on…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                value={form.hashtags}
                onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                placeholder="#smallbusiness #localbusiness"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={insertItem.isPending || updateItem.isPending}>
                <Plus className="mr-2 size-4" />
                {insertItem.isPending || updateItem.isPending ? "Saving…" : editingId ? "Update post" : "Add post"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={() => openNew(selectedDate)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </aside>
      </div>

      <section className="card-soft mt-6 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">Posts for {formatDay(parseDate(selectedDate))}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review, edit or remove everything planned for this day.
            </p>
          </div>
          <Button variant="outline" onClick={() => openNew(selectedDate)}>
            <Plus className="mr-2 size-4" /> Add post
          </Button>
        </div>

        {!selectedItems.length ? (
          <div className="mt-4">
            <EmptyState>No posts planned for this day yet. Add one or generate a plan above.</EmptyState>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {selectedItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold">{item.platform}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass(item.status)}`}>{item.status}</span>
                    </div>
                    <h3 className="mt-2 font-medium">{item.theme || "Untitled content"}</h3>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => editItem(item)} aria-label="Edit post">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        deleteItem.mutate(item.id, {
                          onSuccess: () => toast.success("Post deleted"),
                          onError: (error) => toast.error(friendlyError(error)),
                        })
                      }
                      aria-label="Delete post"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{item.caption}</p>
                {item.hashtags ? <p className="mt-3 text-xs text-muted-foreground">{item.hashtags}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
