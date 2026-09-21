import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCanAccess, type Feature } from "@/lib/entitlements";

export function FeatureGate({ feature, children }: { feature: Feature; children: ReactNode }) {
  const { allowed, isLoading } = useCanAccess(feature);
  if (isLoading) return <div className="py-12 text-center text-sm text-muted-foreground">Checking your plan…</div>;
  if (allowed) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
        <LockKeyhole className="size-5" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">This feature is on a paid plan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upgrade to Starter to unlock Planner, Strategy & Ads, and the AI Marketing Assistant.
        Upgrade to Pro for Live Rep support.
      </p>
      <Link
        to="/subscription"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        View plans
      </Link>
    </div>
  );
}
