import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateMeetingSlot, MEETING_MINUTES } from "@/lib/meetingRules";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

const inputSchema = z.object({
  localDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  topic: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(1000).optional(),
});

async function gateway(path: string, init: RequestInit) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const calendarKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  if (!lovableKey || !calendarKey) throw new Error("Meeting booking isn't set up yet.");
  const response = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": calendarKey,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Google Calendar request failed [${response.status}]: ${body}`);
    throw new Error("We couldn't reach the booking calendar. Please try again.");
  }
  return response.json() as Promise<Record<string, unknown>>;
}

export const bookSpecialistMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const slot = validateMeetingSlot(data.localDateTime, new Date());
    if (!slot.ok) throw new Error(slot.reason);

    const email = typeof context.claims["email"] === "string" ? context.claims["email"] : null;
    if (!email) throw new Error("Your account needs an email address to book a meeting.");

    const busy = await gateway("/freeBusy", {
      method: "POST",
      body: JSON.stringify({ timeMin: slot.start.toISOString(), timeMax: slot.end.toISOString(), items: [{ id: "primary" }] }),
    });
    const calendars = busy["calendars"] as Record<string, { busy?: unknown[] }> | undefined;
    if ((calendars?.["primary"]?.busy?.length ?? 0) > 0) {
      throw new Error("That time is already taken. Please pick another time.");
    }

    const event = await gateway("/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
      method: "POST",
      body: JSON.stringify({
        summary: `Hiraya specialist meeting: ${data.topic}`,
        description: `Booked from Hiraya Marketing by ${email}.\n\n${data.notes ?? ""}`.trim(),
        start: { dateTime: slot.start.toISOString(), timeZone: "Asia/Manila" },
        end: { dateTime: slot.end.toISOString(), timeZone: "Asia/Manila" },
        attendees: [{ email }],
        conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      }),
    });

    return {
      start: slot.start.toISOString(),
      minutes: MEETING_MINUTES,
      eventLink: typeof event["htmlLink"] === "string" ? event["htmlLink"] : null,
      meetLink: typeof event["hangoutLink"] === "string" ? event["hangoutLink"] : null,
    };
  });

export type CalendarItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
  isBooking: boolean;
  meetLink: string | null;
  eventLink: string | null;
  attendee: string | null;
};

const BOOKING_PREFIX = "Hiraya specialist meeting: ";

export const listSpecialistCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CalendarItem[]> => {
    const { data: isAgent, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "agent" });
    if (error || !isAgent) throw new Error("Only Hiraya specialists can see the team calendar.");

    const now = new Date();
    const later = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({ timeMin: now.toISOString(), timeMax: later.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "100" });
    const result = await gateway(`/calendars/primary/events?${params.toString()}`, { method: "GET" });
    const items = (result["items"] as Array<Record<string, unknown>> | undefined) ?? [];

    const maskEmail = (email: string | undefined): string | null => {
      if (!email) return null;
      const [name, domain] = email.split("@");
      if (!domain) return "Client";
      return `${(name ?? "").slice(0, 2)}•••@${domain}`;
    };

    // Discretion: only Hiraya client bookings are returned; personal calendar
    // entries never leave the server, and client emails are masked.
    return items
      .filter((item) => typeof item["summary"] === "string" && (item["summary"] as string).startsWith(BOOKING_PREFIX))
      .map((item) => {
        const start = item["start"] as { date?: string; dateTime?: string } | undefined;
        const end = item["end"] as { date?: string; dateTime?: string } | undefined;
        const summary = item["summary"] as string;
        const attendees = (item["attendees"] as Array<{ email?: string; self?: boolean }> | undefined) ?? [];
        return {
          id: String(item["id"]),
          title: summary.slice(BOOKING_PREFIX.length),
          start: start?.dateTime ?? start?.date ?? "",
          end: end?.dateTime ?? end?.date ?? "",
          isAllDay: !start?.dateTime,
          isBooking: true,
          meetLink: typeof item["hangoutLink"] === "string" ? item["hangoutLink"] : null,
          eventLink: typeof item["htmlLink"] === "string" ? item["htmlLink"] : null,
          attendee: maskEmail(attendees.find((a) => !a.self)?.email),
        };
      });
  });
