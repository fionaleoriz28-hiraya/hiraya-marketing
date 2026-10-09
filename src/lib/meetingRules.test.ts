// @ts-expect-error bun:test types are provided by the Bun runtime
import { describe, expect, it } from "bun:test";
import { validateMeetingSlot } from "./meetingRules";

const now = new Date("2026-10-09T00:00:00Z"); // Fri 8:00 AM Manila

describe("validateMeetingSlot", () => {
  it("accepts a weekday 10:00 AM Manila slot", () => {
    expect(validateMeetingSlot("2026-10-12T10:00", now).ok).toBe(true);
  });
  it("rejects weekends", () => {
    expect(validateMeetingSlot("2026-10-10T10:00", now).ok).toBe(false);
  });
  it("rejects slots ending after 6:00 PM", () => {
    expect(validateMeetingSlot("2026-10-12T17:45", now).ok).toBe(false);
  });
  it("rejects slots before 9:00 AM", () => {
    expect(validateMeetingSlot("2026-10-12T08:30", now).ok).toBe(false);
  });
  it("rejects slots under 1 hour away", () => {
    expect(validateMeetingSlot("2026-10-09T08:30", now).ok).toBe(false);
  });
});
