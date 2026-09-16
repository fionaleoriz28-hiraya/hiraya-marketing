import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Audit = {
  id: string;
  created_at: string;
  score: number;
  summary: string | null;
  strengths: string[];
  gaps: string[];
  recommendations: { title: string; action: string; effort: string }[];
  answers: Record<string, string | number>;
};

export type Post = {
  id: string;
  title: string;
  platform: string;
  format: string;
  posted_at: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
};

export type Snapshot = {
  id: string;
  period: string;
  platform: string;
  followers: number;
  reach: number;
  leads: number;
};

export type ContentItem = {
  id: string;
  platform: string;
  scheduled_date: string;
  theme: string | null;
  caption: string;
  hashtags: string | null;
  status: string;
};

export type Strategy = {
  id: string;
  created_at: string;
  title: string;
  summary: string | null;
  details: {
    positioning?: string;
    pillars?: { name: string; description: string }[];
    channels?: { channel: string; plan: string }[];
    monthlyActions?: string[];
    kpis?: string[];
  };
};

export type AdCampaign = {
  id: string;
  name: string;
  platform: string;
  objective: string | null;
  budget: number | null;
  targeting: string | null;
  ad_copy: string | null;
  notes: string | null;
  status: string;
};

export type AssistantMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export type AgentRequest = {
  id: string;
  topic: string;
  preferred_time: string | null;
  contact: string;
  details: string | null;
  status: string;
  created_at: string;
};

type TableName =
  | "audits"
  | "posts"
  | "growth_snapshots"
  | "content_items"
  | "strategies"
  | "ad_campaigns"
  | "assistant_messages"
  | "agent_requests";

export function useRows<T>(
  table: TableName,
  orderBy: string,
  ascending = false,
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [table, user?.id],
    enabled: !!user,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useInsertRow(table: TableName) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Record<string, unknown> | Record<string, unknown>[]) => {
      if (!user) throw new Error("Please sign in again.");
      const rows = (Array.isArray(values) ? values : [values]).map((row) => ({
        ...row,
        user_id: user.id,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).insert(rows as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}

export function useUpdateRow(table: TableName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).update(values as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}

export function useDeleteRow(table: TableName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}

export function engagementRate(post: Post) {
  const interactions = post.likes + post.comments + post.shares;
  if (!post.reach) return 0;
  return (interactions / post.reach) * 100;
}

export function formatNumber(value: number) {
  return value.toLocaleString();
}

export function formatMonth(period: string) {
  const date = new Date(`${period.slice(0, 7)}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
