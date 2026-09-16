import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "Marketing assistant — Hiraya Marketing" },
      {
        name: "description",
        content: "Ask marketing questions any time, or request a call with a live agent.",
      },
      { property: "og:title", content: "Marketing assistant — Hiraya Marketing" },
      { property: "og:description", content: "Marketing help whenever you need it." },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Marketing assistant</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask anything about growing your business, or ask to talk to a live agent.
      </p>
      <div className="card-soft mt-6 p-6 text-sm text-muted-foreground">
        This page is being set up next.
      </div>
    </div>
  );
}
