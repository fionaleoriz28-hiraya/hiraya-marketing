import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession, createCustomerPortalSession, getSubscription, PLANS, PLAN_FEATURES } from "@/lib/billing.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/subscription")({ component: SubscriptionPage });

function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    void getSubscription()
      .then(setSubscription)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load subscription."));
  }, []);

  const checkout = async (plan: "starter" | "pro") => {
    setLoadingPlan(plan);
    try {
      const { url } = await createCheckoutSession({ data: { plan } });
      window.location.assign(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout.");
      setLoadingPlan(null);
    }
  };

  const portal = async () => {
    setPortalLoading(true);
    try {
      const { url } = await createCustomerPortalSession();
      window.location.assign(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open billing portal.");
      setPortalLoading(false);
    }
  };

  const currentPlan = subscription?.plan ?? "free";
  const currentPlanName = currentPlan === "free" ? "Free" : PLANS[currentPlan as keyof typeof PLANS]?.name ?? String(currentPlan);
  const planKeys = ["free", "starter", "pro"] as const;
  const featureRows = useMemo(() => {
    const all = new Set<string>();
    planKeys.forEach((key) => PLAN_FEATURES[key].forEach((feature) => all.add(feature)));
    return [...all];
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Hiraya Marketing</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plans that grow with your business</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Start with the free marketing essentials, then unlock planning, strategy and AI with Starter. Pro adds Live Rep support.</p>
        </div>
        {subscription?.stripe_customer_id && <Button variant="outline" onClick={portal} disabled={portalLoading}><CreditCard className="mr-2 size-4" />{portalLoading ? "Opening…" : "Manage billing"}</Button>}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm text-muted-foreground">Your current plan</p><p className="text-xl font-semibold">{currentPlanName}</p><p className="text-sm text-muted-foreground">{subscription?.status ?? "inactive"}{subscription?.cancel_at_period_end ? " · Cancels at period end" : ""}</p></div>
          {subscription?.stripe_customer_id && <Button variant="outline" onClick={portal}>Manage subscription</Button>}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {planKeys.map((key) => {
          const isCurrent = currentPlan === key;
          const paid = key !== "free";
          const plan = paid ? PLANS[key] : { name: "Free", price: 0, description: "Core marketing essentials for getting started." };
          const highlighted = key === "starter";
          return (
            <Card key={key} className={`relative flex h-full flex-col ${highlighted ? "border-primary shadow-lg" : ""}`}>
              {highlighted && <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Recommended</div>}
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary"><Sparkles className="size-5" /></div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2 text-3xl font-bold">₱{plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> / month</span></div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 space-y-3 text-sm">{PLAN_FEATURES[key].map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>)}</ul>
                {paid ? <Button className="mt-auto w-full" variant={isCurrent || highlighted ? "default" : "outline"} onClick={() => checkout(key)} disabled={loadingPlan !== null || isCurrent}>{loadingPlan === key ? "Opening checkout…" : isCurrent ? "Current plan" : `Choose ${plan.name}`}</Button> : <Button className="mt-auto w-full" variant="secondary" disabled>{isCurrent ? "Current plan" : "Free"}</Button>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section>
        <div className="mb-4"><h2 className="text-xl font-semibold">Compare features</h2><p className="text-sm text-muted-foreground">Access is controlled by your active subscription.</p></div>
        <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-secondary/60"><tr><th className="px-4 py-3 text-left font-medium">Feature</th>{planKeys.map((key) => <th key={key} className="px-4 py-3 text-center font-medium">{key === "free" ? "Free" : PLANS[key].name}</th>)}</tr></thead><tbody className="divide-y divide-border">{featureRows.map((feature) => <tr key={feature}><td className="px-4 py-3">{feature}</td>{planKeys.map((key) => <td key={key} className="px-4 py-3 text-center">{PLAN_FEATURES[key].includes(feature as never) ? <Check className="mx-auto size-4 text-primary" /> : <X className="mx-auto size-4 text-muted-foreground/50" />}</td>)}</tr>)}</tbody></table></div></Card>
      </section>

      <p className="text-center text-xs text-muted-foreground">Payments are processed securely by Stripe. Subscription access is updated from Stripe webhook events.</p>
    </div>
  );
}
