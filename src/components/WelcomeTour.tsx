import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, MessageCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STEPS = [
  {
    to: "/dashboard" as const,
    icon: LayoutDashboard,
    title: "Your dashboard",
    body: "See your awareness score, engagement rate and follower growth in one place, plus what to do next.",
  },
  {
    to: "/audit" as const,
    icon: Search,
    title: "Brand Awareness Audit",
    body: "Answer five quick questions to get a score out of 100, with strengths, gaps and practical next steps.",
  },
  {
    to: "/assistant" as const,
    icon: MessageCircle,
    title: "Chat inbox",
    body: "Ask marketing questions anytime. Tap \"Talk to a person\" and a Hiraya specialist replies in the same chat.",
  },
];

const tourKey = (userId: string) => `hiraya-tour:${userId}`;

export function startWelcomeTour(userId: string) {
  localStorage.setItem(tourKey(userId), "pending");
}

export function WelcomeTour({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const check = () => {
      if (localStorage.getItem(tourKey(userId)) === "pending") {
        setStep(0);
        setIsOpen(true);
        navigate({ to: "/dashboard" });
      }
    };
    check();
    window.addEventListener("hiraya-tour-start", check);
    return () => window.removeEventListener("hiraya-tour-start", check);
  }, [userId, navigate]);

  function finish() {
    localStorage.setItem(tourKey(userId), "done");
    setIsOpen(false);
    navigate({ to: "/dashboard" });
  }

  function goTo(index: number) {
    setStep(index);
    navigate({ to: STEPS[index]?.to ?? "/dashboard" });
  }

  const current = STEPS[step] ?? STEPS[0]!;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && finish()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
            <current.icon className="size-5" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Welcome tour · {step + 1} of {STEPS.length}
          </p>
          <DialogTitle className="font-display">{current.title}</DialogTitle>
          <DialogDescription>{current.body}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s.to} className={`h-1.5 w-6 rounded-full ${i === step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={finish}>Skip tour</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={() => goTo(step - 1)}>Back</Button>}
            <Button onClick={() => (isLast ? finish() : goTo(step + 1))}>
              {isLast ? "Start using Hiraya" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
