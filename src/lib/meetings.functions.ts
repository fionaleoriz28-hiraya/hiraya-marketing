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
