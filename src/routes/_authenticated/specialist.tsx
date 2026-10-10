import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Headset, Video } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAgentInbox, useIsAgent } from "@/lib/chat";
import { listSpecialistCalendar, type CalendarItem } from "@/lib/meetings.functions";

export const Route = createFileRoute("/_authenticated/specialist")({
  head: () => ({
    meta: [
      { title: "Specialist dashboard — Hiraya Marketing" },
      { name: "description", content: "Waiting chats, booked client meetings and the specialist calendar in one place." },
      { property: "og:title", content: "Specialist dashboard — Hiraya Marketing" },
      { property: "og:description", content: "Everything a Hiraya specialist needs for the day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SpecialistDashboard,
});

function formatWhen(item: CalendarItem) {
  if (item.isAllDay) {
    return new Date(`${item.start}T00:00:00`).toLocaleDateString("en-PH", { dateStyle: "medium" }) + " · All day";
  }
  return new Date(item.start).toLocaleString("en-PH", { timeZone: "Asia/Manila", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function EventRow({ item }: { item: CalendarItem }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatWhen(item)}{item.attendee ? ` · ${item.attendee}` : ""}</p>
      </div>
      <div className="flex gap-2">
        {item.meetLink && <Button size="sm" asChild><a href={item.meetLink} target="_blank" rel="noreferrer"><Video className="mr-1 size-4" />Join</a></Button>}
        {item.eventLink && <Button size="sm" variant="outline" asChild><a href={item.eventLink} target="_blank" rel="noreferrer">Open</a></Button>}
      </div>
    </div>
  );
}

function SpecialistDashboard() {
  const { data: isAgent, isLoading: roleLoading } = useIsAgent();
  const inbox = useAgentInbox();
  const fetchCalendar = useServerFn(listSpecialistCalendar);
  const calendar = useQuery({ queryKey: ["specialist-calendar"], queryFn: () => fetchCalendar(), enabled: !!isAgent, refetchInterval: 60_000 });

  if (roleLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!isAgent) return <EmptyState>Specialists only. Ask an administrator to add you as a Hiraya specialist.</EmptyState>;

  const pending = (inbox.data ?? []).filter((c) => !c.agent_id);
  const events = calendar.data ?? [];
  const bookings = events.filter((e) => e.isBooking);
  const others = events.filter((e) => !e.isBooking);

  return (
    <div className="space-y-4">
      <PageHeader title="Specialist dashboard" subtitle="Waiting chats, client meetings and your calendar for the next 14 days." />

      <section className="card-soft p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold"><Headset className="size-4 text-primary" />Waiting chats ({pending.length})</h2>
          <Button size="sm" variant="secondary" asChild><Link to="/agent">Open inbox</Link></Button>
        </div>
        <div className="mt-3 space-y-2">
          {inbox.isLoading && <p className="text-sm text-muted-foreground">Loading chats…</p>}
          {!inbox.isLoading && pending.length === 0 && <p className="text-sm text-muted-foreground">No one is waiting right now.</p>}
          {pending.slice(0, 6).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
              <span className="font-medium">{c.subject}</span>
              <span className="text-xs text-muted-foreground">{new Date(c.last_message_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-soft p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold"><Video className="size-4 text-primary" />Booked client meetings ({bookings.length})</h2>
          <div className="mt-3 space-y-2">
            {calendar.isLoading && <p className="text-sm text-muted-foreground">Loading calendar…</p>}
            {calendar.isError && <p className="text-sm text-destructive">We couldn't load the calendar. Please try again shortly.</p>}
            {calendar.isSuccess && bookings.length === 0 && <p className="text-sm text-muted-foreground">No client meetings booked yet.</p>}
            {bookings.map((e) => <EventRow key={e.id} item={e} />)}
          </div>
        </section>
        <section className="card-soft p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold"><CalendarDays className="size-4 text-primary" />My calendar</h2>
          <div className="mt-3 space-y-2">
            {calendar.isLoading && <p className="text-sm text-muted-foreground">Loading calendar…</p>}
            {calendar.isSuccess && others.length === 0 && <p className="text-sm text-muted-foreground">Nothing else on your calendar.</p>}
            {others.map((e) => <EventRow key={e.id} item={e} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
