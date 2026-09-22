import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Plan = "free" | "starter" | "growth" | "pro";

export type Feature = "dashboard" | "audit" | "growth" | "planner" | "strategy" | "assistant" | "live-agent" | "engagement";

export const PLAN_LEVEL: Record<Plan, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  pro: 3,
};

type Requirement = Plan | "unavailable";

export const FEATURE_REQUIREMENTS: Record<Feature, Requirement> = {
  dashboard: "free",
  audit: "free",
  growth: "free",
  planner: "starter",
  strategy: "starter",
  assistant: "starter",
  "live-agent": "pro",
  engagement: "unavailable",
};

export const PLAN_FEATURES = {
  free: ["Dashboard", "Marketing Audit", "Growth Tracking"],
  starter: ["Dashboard", "Marketing Audit", "Growth Tracking", "Content Planner", "Strategy & Ads", "AI Marketing Assistant"],
  growth: ["Dashboard", "Marketing Audit", "Growth Tracking", "Content Planner", "Strategy & Ads", "AI Marketing Assistant", "Advanced Growth Insights", "Higher Usage Limits"],
  pro: ["Dashboard", "Marketing Audit", "Growth Tracking", "Content Planner", "Strategy & Ads", "AI Marketing Assistant", "Live Rep"],
} as const;

function normalizePlan(value: unknown): Plan {
  if (value === "starter" || value === "growth" || value === "pro") return value;
  return "free";
}

export function canAccess(plan: Plan, feature: Feature) {
  const requirement = FEATURE_REQUIREMENTS[feature];
  if (requirement === "unavailable") return false;
  return PLAN_LEVEL[plan] >= PLAN_LEVEL[requirement];
}

export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions" as never)
        .select("plan,status,cancel_at_period_end,current_period_end,stripe_customer_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return {
        ...(data as Record<string, unknown> | null),
        plan: normalizePlan((data as Record<string, unknown> | null)?.plan),
      };
    },
  });
}

export function useCanAccess(feature: Feature) {
  const query = useSubscription();
  return { ...query, allowed: canAccess((query.data?.plan ?? "free") as Plan, feature) };
}
