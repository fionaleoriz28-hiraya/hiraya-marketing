import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useMyConversation, type ChatMessage } from "@/lib/chat";

/** Shows a toast to the business owner whenever a specialist replies in their chat. */
export function AgentReplyNotifier() {
  const { data: conversation } = useMyConversation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const conversationId = conversation?.id;

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`notify-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const message = payload.new as ChatMessage;
          void queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
          if (message.sender !== "agent" || pathname === "/assistant") return;
          toast("A Hiraya specialist replied", {
            description: message.content.length > 120 ? `${message.content.slice(0, 120)}…` : message.content,
            duration: 10000,
            action: { label: "Open chat", onClick: () => navigate({ to: "/assistant" }) },
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, pathname, queryClient, navigate]);

  return null;
}
