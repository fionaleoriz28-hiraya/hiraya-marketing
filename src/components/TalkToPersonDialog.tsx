import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Headset } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookSpecialistMeeting } from "@/lib/meetings.functions";

type Booked = { start: string; eventLink: string | null; meetLink: string | null };

export function TalkToPersonDialog({ open, onOpenChange, onChatNow }: { open: boolean; onOpenChange: (open: boolean) => void; onChatNow: () => void }) {
  const book = useServerFn(bookSpecialistMeeting);
  const [step, setStep] = useState<"choose" | "book" | "done">("choose");
  const [when, setWhen] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState<Booked | null>(null);

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) setStep("choose");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsBooking(true);
    try {
      const result = await book({ data: { localDateTime: when, topic, notes: notes || undefined } });
      setBooked(result);
      setStep("done");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking didn't work. Please try again.");
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Talk to a person</DialogTitle>
              <DialogDescription>Chat with a Hiraya specialist now, or book a 30-minute video meeting.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Button variant="outline" className="h-auto justify-start py-3 text-left" onClick={() => { close(false); onChatNow(); }}>
                <Headset className="mr-3 size-5" />
                <span><span className="block font-medium">Chat now</span><span className="block text-xs text-muted-foreground">A specialist replies in this chat.</span></span>
              </Button>
              <Button variant="outline" className="h-auto justify-start py-3 text-left" onClick={() => setStep("book")}>
                <CalendarDays className="mr-3 size-5" />
                <span><span className="block font-medium">Book a meeting</span><span className="block text-xs text-muted-foreground">Pick a time and get a calendar invite.</span></span>
              </Button>
            </div>
          </>
        )}
        {step === "book" && (
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display">Book a specialist meeting</DialogTitle>
              <DialogDescription>30 minutes on Google Meet. Monday to Friday, 9:00 AM to 6:00 PM Manila time.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2"><Label htmlFor="meet-when">Date and time (Manila)</Label><Input id="meet-when" type="datetime-local" step={900} value={when} onChange={(e) => setWhen(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="meet-topic">Topic</Label><Input id="meet-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Facebook ads budget" minLength={2} maxLength={120} required /></div>
            <div className="space-y-2"><Label htmlFor="meet-notes">Notes (optional)</Label><Textarea id="meet-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} /></div>
            <div className="flex justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep("choose")}>Back</Button>
              <Button type="submit" disabled={isBooking}>{isBooking ? "Booking…" : "Book meeting"}</Button>
            </div>
          </form>
        )}
        {step === "done" && booked && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">You're booked</DialogTitle>
              <DialogDescription>
                {new Date(booked.start).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "full", timeStyle: "short" })} (Manila time). A calendar invite is on its way to your email.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              {booked.meetLink && <Button asChild><a href={booked.meetLink} target="_blank" rel="noreferrer">Open meeting link</a></Button>}
              {booked.eventLink && <Button variant="outline" asChild><a href={booked.eventLink} target="_blank" rel="noreferrer">View in calendar</a></Button>}
              <Button variant="ghost" onClick={() => close(false)}>Done</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
