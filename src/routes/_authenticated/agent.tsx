import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Headset, Send, UserRound } from "lucide-react";

import { ChatThread } from "@/components/chat-thread";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { friendlyError } from "@/lib/business";
import {
  useAgentInbox,
  useClaimConversation,
  useIsAgent,
  useMessages,
  useSendMessage,
  useSetMode,
  type Conversation,
} from "@/lib/chat";

export const Route = createFileRoute("/_authenticated/agent")({
  head: () => ({
    meta: [
      { title: "Live agent inbox — Hiraya Marketing" },
      {
        name: "description",
        content: "Manage live-agent marketing conversations and reply to clients.",
      },
    ],
  }),
  component: AgentInboxPage,
});

function AgentInboxPage() {
  const { data: isAgent, isLoading: roleLoading } = useIsAgent();
  const { data: conversations = [], isLoading } = useAgentInbox();
  const [selected, setSelected] = useState<Conversation | null>(null);

  if (roleLoading || isLoading) {
    return <p className="text-sm text-muted-foreground">Loading live-agent inbox…</p>;
  }

  if (!isAgent) {
    return (
      <div>
        <PageHeader title="Live agent" subtitle="This workspace is available to Hiraya support agents." />
        <EmptyState>You don't have an agent role on this account.</EmptyState>
      </div>
    );
  }

  const active = selected && conversations.some((item) => item.id === selected.id)
    ? conversations.find((item) => item.id === selected.id) ?? selected
    : selected;

  return (
    <div>
      <PageHeader
        title="Live agent inbox"
        subtitle="Pick up client conversations, reply in real time, and return chats to AI when you're done."
      />

      {!conversations.length ? (
        <EmptyState>No conversations are waiting for a live agent right now.</EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="card-soft overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {conversations.length} open conversation{conversations.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelected(conversation)}
                  className={`w-full border-b border-border p-4 text-left transition-colors hover:bg-secondary/60 ${active?.id === conversation.id ? "bg-secondary" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{conversation.subject}</span>
                    {conversation.agent_id ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <span className="rounded-full bg-peach px-2 py-0.5 text-[10px]">Waiting</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {new Date(conversation.last_message_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="card-soft min-h-[28rem] overflow-hidden">
            {active ? <AgentConversation conversation={active} /> : (
              <div className="flex min-h-[28rem] items-center justify-center p-6 text-center">
                <div><UserRound className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Select a conversation to respond.</p></div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function AgentConversation({ conversation }: { conversation: Conversation }) {
  const { data: messages = [] } = useMessages(conversation.id);
  const claim = useClaimConversation();
  const send = useSendMessage();
  const setMode = useSetMode();
  const [input, setInput] = useState("");

  async function claimChat() {
    try {
      await claim.mutateAsync(conversation.id);
      toast.success("Conversation claimed.");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  async function reply() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    try {
      await send.mutateAsync({ conversationId: conversation.id, sender: "agent", content });
    } catch (error) {
      setInput(content);
      toast.error(friendlyError(error));
    }
  }

  async function returnToAi() {
    try {
      await setMode.mutateAsync({
        conversationId: conversation.id,
        mode: "ai",
        systemNote: "A Hiraya specialist has returned this chat to instant AI support.",
      });
      toast.success("Chat returned to AI.");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Headset className="size-5" />
          <div><p className="font-display font-semibold">{conversation.subject}</p><p className="text-xs text-muted-foreground">Client conversation</p></div>
        </div>
        <div className="flex gap-2">
          {!conversation.agent_id ? (
            <Button size="sm" onClick={claimChat} disabled={claim.isPending}>Claim conversation</Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={returnToAi}>Return to AI</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <ChatThread messages={messages} perspective="agent" emptyState={<p className="text-sm text-muted-foreground">No messages yet.</p>} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border px-5 py-4"
        onSubmit={(event) => { event.preventDefault(); void reply(); }}
      >
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={2}
          className="min-h-[3rem] resize-none"
          placeholder="Reply to the client…"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void reply();
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || send.isPending} aria-label="Send reply">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
