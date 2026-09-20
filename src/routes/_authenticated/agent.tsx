import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, EmptyState } from "@/components/page-header";
import { ChatThread } from "@/components/chat-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import {
  useAgentInbox,
  useClaimConversation,
  useIsAgent,
  useMessages,
  useSendMessage,
  useSetMode,
  type Conversation,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agent")({
  head: () => ({
    meta: [
      { title: "Specialist inbox — Hiraya Marketing" },
      {
        name: "description",
        content:
          "Hiraya specialists pick up live chats from small business owners and reply in real time.",
      },
      { property: "og:title", content: "Specialist inbox — Hiraya Marketing" },
      {
        property: "og:description",
        content: "Pick up a waiting chat and answer a business owner's marketing question.",
      },
    ],
  }),
  component: AgentInboxPage,
});

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function AgentInboxPage() {
  const { user } = useAuth();
  const { data: isAgent, isLoading: roleLoading } = useIsAgent();
  const inbox = useAgentInbox();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const conversations = inbox.data ?? [];
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  if (roleLoading) {
    return <p className="text-sm text-muted-foreground">Checking your access…</p>;
  }

  if (!isAgent) {
    return (
      <>
        <PageHeader
          title="Specialist inbox"
          subtitle="This area is for Hiraya specialists who answer live chats."
        />
        <EmptyState>
          Your account doesn't have specialist access yet. Ask an administrator to add you as an
          agent, then reload this page.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Specialist inbox"
        subtitle="Chats where a business owner asked to talk to a real person."
      />

      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-2">
          {conversations.length === 0 && (
            <EmptyState>No one is waiting right now. New chats appear here automatically.</EmptyState>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-colors",
                conversation.id === selectedId
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-secondary/60",
              )}
            >
              <p className="text-sm font-medium">{conversation.subject}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {conversation.agent_id
                  ? conversation.agent_id === user?.id
                    ? "You picked this up"
                    : "Another specialist"
                  : "Waiting for a specialist"}
                {" · "}
                {timeAgo(conversation.last_message_at)}
              </p>
            </button>
          ))}
        </div>

        <div className="card-soft p-4 sm:p-5">
          {selected ? (
            <AgentConversation conversation={selected} />
          ) : (
            <p className="text-sm text-muted-foreground">Pick a chat on the left to read it.</p>
          )}
        </div>
      </div>
    </>
  );
}

function AgentConversation({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth();
  const messages = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const claim = useClaimConversation();
  const setMode = useSetMode();
  const [draft, setDraft] = useState("");

  const mine = conversation.agent_id === user?.id;

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    try {
      if (!conversation.agent_id) await claim.mutateAsync(conversation.id);
      await sendMessage.mutateAsync({ conversationId: conversation.id, sender: "agent", content });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your reply");
    }
  }

  return (
    <div className="flex h-[32rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <p className="text-sm font-medium">{conversation.subject}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.agent_id
              ? mine
                ? "You are answering this chat"
                : "Picked up by another specialist"
              : "Not picked up yet"}
          </p>
        </div>
        <div className="flex gap-2">
          {!conversation.agent_id && (
            <Button
              size="sm"
              disabled={claim.isPending}
              onClick={async () => {
                try {
                  await claim.mutateAsync(conversation.id);
                  await setMode.mutateAsync({
                    conversationId: conversation.id,
                    mode: "agent",
                    systemNote: "A Hiraya specialist joined the chat.",
                  });
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not pick up the chat");
                }
              }}
            >
              Pick up chat
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            disabled={setMode.isPending}
            onClick={async () => {
              try {
                await setMode.mutateAsync({
                  conversationId: conversation.id,
                  mode: "ai",
                  systemNote: "The specialist handed this chat back to AI answers.",
                });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not close the chat");
              }
            }}
          >
            Hand back to AI
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        <ChatThread
          messages={messages.data ?? []}
          perspective="agent"
          emptyState={
            <p className="text-sm text-muted-foreground">
              No messages yet in this chat.
            </p>
          }
        />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border pt-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your reply…"
        />
        <Button type="submit" disabled={sendMessage.isPending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
