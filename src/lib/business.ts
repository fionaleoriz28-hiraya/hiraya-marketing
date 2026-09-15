import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Business = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  audience: string | null;
  goals: string | null;
  monthly_budget: number | null;
  platforms: string[];
};

export const PLATFORMS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "X",
  "LinkedIn",
  "Google",
] as const;

export function useBusiness() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["business", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Business) ?? null;
    },
  });
}

export function toAiBusiness(business: Business | null | undefined) {
  return {
    name: business?.name ?? "this business",
    industry: business?.industry ?? "",
    location: business?.location ?? "",
    audience: business?.audience ?? "",
    goals: business?.goals ?? "",
    monthlyBudget:
      business?.monthly_budget != null ? `PHP ${Number(business.monthly_budget).toLocaleString()}` : "",
    platforms: (business?.platforms ?? []).join(", "),
  };
}

export function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/402|credit/i.test(message)) {
    return "The AI credits for this app have run out. The app owner needs to top up to keep using AI features.";
  }
  if (/429|rate/i.test(message)) {
    return "The AI is busy right now. Please wait a moment and try again.";
  }
  if (/unauthorized/i.test(message)) {
    return "Your session expired. Please sign in again.";
  }
  return message || "Something went wrong. Please try again.";
}
