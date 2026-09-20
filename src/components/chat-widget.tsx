import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Headset, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";

import { ChatThread } from "@/components/chat-thread";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai.functions";
import { friendlyError, toAiBusiness, useBusiness } from "@/lib/business";
import { useMessages, useMyConversation, useSendMessage, useSetMode } from "@/lib/chat";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const { data: business } = useBusiness();
  const { data: conversation } = useMyConversation();
  const { data: messages = [] } = useMessages(conversation?.id);
  const sendMessage = useSendMessage();
  const setMode = useSetMode();
  const ask = useServerFn(askAssistant);

  const withAgent = conversation?.mode === "agent";
  const agentJoined = withAgent && !!conversation?.agent_id;

  async function send() {
    const question = input.trim();
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
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

      const result = await ask({ data: { business: toAiBusiness(business), history, question } });

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

  async function talkToPerson() {
    if (!conversation) return;
    try {
      await setMode.mutateAsync({
        conversationId: conversation.id,
        mode: "agent",
        systemNote:
          "This chat has been passed to a Hiraya specialist. Someone will reply here shortly.",
      });
      toast.success("A Hiraya specialist will reply in this chat.");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-20 z-40 h-12 rounded-full px-5 shadow-lg md:bottom-6"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Live chat
        </Button>
      )}

      {open && (
        <div className="card-soft fixed right-3 bottom-20 left-3 z-40 flex max-h-[70vh] flex-col overflow-hidden p-0 shadow-xl md:right-6 md:bottom-6 md:left-auto md:w-[24rem]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold">
                {withAgent ? "Hiraya specialist" : "Hiraya AI chat"}
              </p>
              <p className="text-xs text-muted-foreground">
                {withAgent
                  ? agentJoined
                    ? "A specialist is in this chat."
                    : "Waiting for a specialist to join."
                  : "Instant answers about your marketing."}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ChatThread
              messages={messages}
              pending={thinking ? "Thinking about your business…" : null}
              emptyState={
                <p className="text-sm text-muted-foreground">
                  Ask anything — what to post, why reach dropped, or how to spend a small ad budget.
                </p>
              }
            />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder={withAgent ? "Message the specialist…" : "Ask a marketing question…"}
                rows={2}
                className="min-h-[2.75rem] resize-none"
              />
              <Button size="icon" onClick={() => void send()} disabled={!input.trim()} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {withAgent ? (
                <span className="text-xs text-muted-foreground">Talking with a specialist</span>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => void talkToPerson()}>
                  <Headset className="mr-2 h-3.5 w-3.5" />
                  Talk to a person
                </Button>
              )}
              <Button variant="link" size="sm" asChild>
                <Link to="/assistant" onClick={() => setOpen(false)}>
                  Open full chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
