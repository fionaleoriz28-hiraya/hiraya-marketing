import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Headset, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ChatThread } from "@/components/chat-thread";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai.functions";
import { friendlyError, toAiBusiness, useBusiness } from "@/lib/business";
import { useMessages, useMyConversation, useSendMessage, useSetMode } from "@/lib/chat";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "Marketing assistant — Hiraya Marketing" },
      {
        name: "description",
        content:
          "Ask marketing questions and get instant AI answers, or hand the chat over to a Hiraya specialist who replies in the same conversation.",
      },
      { property: "og:title", content: "Marketing assistant — Hiraya Marketing" },
      {
        property: "og:description",
        content: "Instant AI answers with a real specialist one tap away.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const STARTERS = [
  "How do I get more customers from Facebook this month?",
  "What should I post this week to build trust?",
  "My reach dropped. What should I check first?",
  "How much should I spend on ads with a small budget?",
];

function AssistantPage() {
  const { data: business } = useBusiness();
  const { data: conversation, isLoading } = useMyConversation();
  const { data: messages = [] } = useMessages(conversation?.id);
  const sendMessage = useSendMessage();
  const setMode = useSetMode();
  const ask = useServerFn(askAssistant);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const withAgent = conversation?.mode === "agent";
  const agentJoined = withAgent && !!conversation?.agent_id;

  async function send(text: string) {
    const question = text.trim();
    if (!question || !conversation) return;
    setInput("");

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        sender: "user",
        content: question,
      });
    } catch (error) {
      toast.error(friendlyError(error));
      return;
    }

    if (withAgent) return;

    setThinking(true);
    try {
      const history = messages
        .filter((m) => m.sender === "user" || m.sender === "ai")
        .slice(-10)
        .map((m) => ({ role: m.sender === "user" ? ("user" as const) : ("assistant" as const), content: m.content }));

      const result = await ask({
        data: { business: toAiBusiness(business), history, question },
      });

      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        sender: "ai",
        content: result.answer,
      });
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setThinking(false);
    }
  }

  async function handover() {
    if (!conversation) return;
    try {
      await setMode.mutateAsync({
        conversationId: conversation.id,
        mode: "agent",
        systemNote:
          "This chat has been passed to a Hiraya specialist. Someone will reply here shortly — your messages stay in this thread.",
      });
      toast.success("A specialist has been notified.");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  async function backToAi() {
    if (!conversation) return;
    try {
      await setMode.mutateAsync({
        conversationId: conversation.id,
        mode: "ai",
        systemNote: "Back to instant AI answers.",
      });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  return (
    <div>
      <PageHeader
        title="Marketing assistant"
        subtitle="Ask anything about growing your business — and hand the chat to a real specialist whenever you want."
      />

      <div className="card-soft flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            {withAgent ? (
              <>
                <Headset className="size-4 text-primary" />
                <span>
                  {agentJoined
                    ? "A Hiraya specialist is in this chat"
                    : "Waiting for a specialist to join…"}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-primary" />
                <span>Instant AI answers</span>
              </>
            )}
          </div>
          {withAgent ? (
            <Button variant="ghost" size="sm" onClick={backToAi} disabled={setMode.isPending}>
              Back to AI answers
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={handover} disabled={setMode.isPending}>
              <Headset className="size-4" /> Talk to a person
            </Button>
          )}
        </div>

        <div className="max-h-[55vh] min-h-[18rem] overflow-y-auto px-5 py-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Opening your chat…</p>
          ) : (
            <ChatThread
              messages={messages}
              pending={thinking ? "Thinking…" : null}
              emptyState={
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Start with one of these, or type your own question.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STARTERS.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        className="rounded-full border border-border px-3 py-1.5 text-left text-xs hover:bg-secondary"
                        onClick={() => void send(starter)}
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
          )}
        </div>

        <form
          className="flex items-end gap-2 border-t border-border px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder={withAgent ? "Write to the specialist…" : "Ask a marketing question…"}
            className="min-h-[3rem] resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || thinking}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>

      {withAgent && !agentJoined && (
        <p className="mt-3 text-xs text-muted-foreground">
          Specialists reply during business hours. Anything you write now will be waiting for them.
        </p>
      )}
    </div>
  );
}
