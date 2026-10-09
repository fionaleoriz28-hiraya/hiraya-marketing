export const MEETING_MINUTES = 30;
export const MEETING_OPEN_HOUR = 9;
export const MEETING_CLOSE_HOUR = 18;
export const MEETING_MAX_DAYS_AHEAD = 60;

export type SlotResult = { ok: true; start: Date; end: Date } | { ok: false; reason: string };

/** localDateTime is "YYYY-MM-DDTHH:mm" in Manila time (UTC+8). */
export function validateMeetingSlot(localDateTime: string, now: Date): SlotResult {
  const start = new Date(`${localDateTime}:00+08:00`);
  if (Number.isNaN(start.getTime())) return { ok: false, reason: "Please pick a valid date and time." };
  const manila = new Date(start.getTime() + 8 * 3600_000);
  const day = manila.getUTCDay();
  const minutes = manila.getUTCHours() * 60 + manila.getUTCMinutes();
  if (start.getTime() < now.getTime() + 3600_000) return { ok: false, reason: "Please pick a time at least 1 hour from now." };
  if (start.getTime() > now.getTime() + MEETING_MAX_DAYS_AHEAD * 86400_000) return { ok: false, reason: "Please pick a time within the next 60 days." };
  if (day === 0 || day === 6) return { ok: false, reason: "Meetings are available Monday to Friday." };
  if (minutes < MEETING_OPEN_HOUR * 60 || minutes + MEETING_MINUTES > MEETING_CLOSE_HOUR * 60) {
    return { ok: false, reason: "Meetings are available 9:00 AM to 6:00 PM Manila time." };
  }
  return { ok: true, start, end: new Date(start.getTime() + MEETING_MINUTES * 60_000) };
}
