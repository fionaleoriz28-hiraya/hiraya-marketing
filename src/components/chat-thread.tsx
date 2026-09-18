import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/lib/chat";
import { cn } from "@/lib/utils";

function senderLabel(sender: string) {
  if (sender === "user") return "You";
  if (sender === "ai") return "Hiraya AI";
  if (sender === "agent") return "Hiraya specialist";
  return "";
}

export function ChatThread({
  messages,
  pending,
  perspective = "owner",
  emptyState,
}: {
  messages: ChatMessage[];
  pending?: string | null;
  perspective?: "owner" | "agent";
  emptyState?: React.ReactNode;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending]);

  const mine = perspective === "agent" ? "agent" : "user";

  return (
    <div className="space-y-4">
      {messages.length === 0 && !pending && emptyState}

      {messages.map((message) =>
        message.sender === "system" ? (
          <p key={message.id} className="text-center text-xs text-muted-foreground">
            {message.content}
          </p>
        ) : (
          <div
            key={message.id}
            className={cn("flex flex-col gap-1", message.sender === mine ? "items-end" : "items-start")}
          >
            <span className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {senderLabel(message.sender)}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                message.sender === mine
                  ? "bg-primary text-primary-foreground"
                  : message.sender === "agent"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground",
              )}
            >
              {message.content}
            </div>
          </div>
        ),
      )}

      {pending && (
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            Hiraya AI
          </span>
          <div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
            {pending}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
