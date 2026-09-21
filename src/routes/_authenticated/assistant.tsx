import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Headset, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { ChatThread } from "@/components/chat-thread";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai.functions";
import { friendlyError, toAiBusiness, useBusiness } from "@/lib/business";
import { useMessages, useMyConversation, useSendMessage, useSetMode } from "@/lib/chat";
import { useCanAccess } from "@/lib/entitlements";
import { useInsertRow, useRows, type AgentRequest } from "@/lib/data";

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
  const { allowed: canUseLiveRep } = useCanAccess("live-agent");
  const { data: conversation, isLoading } = useMyConversation();
  const { data: messages = [] } = useMessages(conversation?.id);
  const sendMessage = useSendMessage();
  const setMode = useSetMode();
  const { data: requests = [] } = useRows<AgentRequest>("agent_requests", "created_at");
  const insertRequest = useInsertRow("agent_requests");
  const ask = useServerFn(askAssistant);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [requestingAgent, setRequestingAgent] = useState(false);

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
    if (!topic.trim() || !contact.trim()) {
      toast.error("Please add a topic and contact detail.");
      return;
    }
    setRequestingAgent(true);
    try {
      await insertRequest.mutateAsync({
        topic: topic.trim(),
        preferred_time: preferredTime.trim() || null,
        contact: contact.trim(),
        details: details.trim() || null,
        status: "pending",
      });
      await setMode.mutateAsync({
        conversationId: conversation.id,
        mode: "agent",
        systemNote:
          "This chat has been passed to a Hiraya specialist. Someone will reply here shortly — your messages stay in this thread.",
      });
      setShowAgentForm(false);
      setTopic("");
      setPreferredTime("");
      setContact("");
      setDetails("");
      toast.success("Your live-agent request was sent.");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setRequestingAgent(false);
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
            <Button variant="secondary" size="sm" onClick={() => setShowAgentForm(true)} disabled={setMode.isPending || !canUseLiveRep}>
              <Headset className="size-4" /> Talk to a person
            </Button>
          )}
        </div>

        {showAgentForm && !withAgent ? (
          <div className="border-b border-border bg-secondary/40 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">Talk to a live agent</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tell us what you need so a Hiraya specialist can pick up the conversation with context.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAgentForm(false)} aria-label="Close live agent form"><X className="size-4" /></Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><label htmlFor="agent-topic" className="text-sm font-medium">Topic *</label><input id="agent-topic" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Facebook ads" /></div>
              <div className="space-y-2"><label htmlFor="agent-contact" className="text-sm font-medium">Contact *</label><input id="agent-contact" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email, phone, or Messenger" /></div>
              <div className="space-y-2"><label htmlFor="agent-time" className="text-sm font-medium">Preferred time</label><input id="agent-time" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} placeholder="e.g. Weekdays 2–5 PM" /></div>
              <div className="space-y-2 md:col-span-2"><label htmlFor="agent-details" className="text-sm font-medium">Details</label><textarea id="agent-details" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What would you like the specialist to help with?" /></div>
            </div>
            <Button className="mt-4" onClick={() => void handover()} disabled={requestingAgent}><Headset className="mr-2 size-4" />{requestingAgent ? "Sending request…" : "Request live agent"}</Button>
          </div>
        ) : null}

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

      {!withAgent && requests.length > 0 && (
        <section className="mt-4 card-soft p-5">
          <h2 className="font-display text-base font-semibold">Your live-agent requests</h2>
          <div className="mt-3 space-y-2">
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                <div><p className="font-medium">{request.topic}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(request.created_at).toLocaleString()}</p></div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs capitalize">{request.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {withAgent && !agentJoined && (
        <p className="mt-3 text-xs text-muted-foreground">
          Specialists reply during business hours. Anything you write now will be waiting for them.
        </p>
      )}
    </div>
  );
}
