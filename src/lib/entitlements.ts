import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Plan = "free" | "starter" | "pro";

export type Feature = "dashboard" | "audit" | "growth" | "planner" | "strategy" | "assistant" | "live-agent";

export const PLAN_LEVEL: Record<Plan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
};

export const FEATURE_REQUIREMENTS: Record<Feature, Plan> = {
  dashboard: "free",
  audit: "free",
  growth: "free",
  planner: "starter",
  strategy: "starter",
  assistant: "starter",
  "live-agent": "pro",
};

export const PLAN_FEATURES = {
  free: ["Dashboard", "Marketing Audit", "Growth Tracking"],
  starter: ["Dashboard", "Marketing Audit", "Growth Tracking", "Content Planner", "Strategy & Ads", "AI Marketing Assistant"],
  pro: ["Dashboard", "Marketing Audit", "Growth Tracking", "Content Planner", "Strategy & Ads", "AI Marketing Assistant", "Live Rep"],
} as const;

function normalizePlan(value: unknown): Plan {
  if (value === "starter" || value === "pro") return value;
  return "free";
}

export function canAccess(plan: Plan, feature: Feature) {
  return PLAN_LEVEL[plan] >= PLAN_LEVEL[FEATURE_REQUIREMENTS[feature]];
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
