import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Conversation = {
  id: string;
  user_id: string;
  subject: string;
  mode: "ai" | "agent" | string;
  status: string;
  agent_id: string | null;
  last_message_at: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender: "user" | "ai" | "agent" | "system" | string;
  sender_id: string | null;
  content: string;
  created_at: string;
};

/* --------------------------------- roles --------------------------------- */

export function useIsAgent() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-agent", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).some((row) => row.role === "agent" || row.role === "admin");
    },
  });
}

/* ----------------------------- conversations ------------------------------ */

export function useMyConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["my-conversation", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Conversation> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "open")
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Conversation;

      const { data: created, error: insertError } = await supabase
        .from("conversations")
        .insert({ user_id: user!.id })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return created as Conversation;
    },
    staleTime: 60_000,
  });

  // Live updates when an agent picks up or hands the chat back.
  useEffect(() => {
    const id = query.data?.id;
    if (!id) return;
    const channel = supabase
      .channel(`conversation-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations", filter: `id=eq.${id}` },
        (payload) => {
          queryClient.setQueryData(["my-conversation", user?.id], payload.new as Conversation);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [query.data?.id, queryClient, user?.id]);

  return query;
}

export function useAgentInbox() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["agent-inbox"],
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("mode", "agent")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Conversation[];
    },
    refetchInterval: 15_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("agent-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["agent-inbox"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useSetMode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      mode,
      systemNote,
    }: {
      conversationId: string;
      mode: "ai" | "agent";
      systemNote?: string;
    }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ mode, ...(mode === "ai" ? { agent_id: null } : {}) })
        .eq("id", conversationId);
      if (error) throw error;

      if (systemNote) {
        const { error: messageError } = await supabase
          .from("chat_messages")
          .insert({ conversation_id: conversationId, sender: "system", content: systemNote, ...(user ? { sender_id: user.id } : {}) });
        if (messageError) throw messageError;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-conversation"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-inbox"] });
    },
  });
}

export function useClaimConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({ agent_id: user!.id })
        .eq("id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agent-inbox"] }),
  });
}

/* -------------------------------- messages -------------------------------- */

export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-messages", conversationId],
    enabled: !!conversationId,
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(["chat-messages", conversationId], (current) => {
            const rows = current ?? [];
            if (rows.some((row) => row.id === incoming.id)) return rows;
            return [...rows, incoming];
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      sender,
      content,
    }: {
      conversationId: string;
      sender: "user" | "ai" | "agent";
      content: string;
    }) => {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender,
        content,
        ...(sender === "agent" ? { sender_id: user!.id } : {}),
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.conversationId] });
    },
  });
}
