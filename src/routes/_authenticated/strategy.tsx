import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/strategy")({
  head: () => ({
    meta: [
      { title: "Strategy & ads — Hiraya Marketing" },
      {
        name: "description",
        content: "Get a marketing plan and paid ad ideas that match your goals and budget.",
      },
      { property: "og:title", content: "Strategy & ads — Hiraya Marketing" },
      { property: "og:description", content: "A plan for the next 90 days, plus ad ideas." },
    ],
  }),
  component: StrategyPage,
});

function StrategyPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Strategy &amp; ads</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Turn your goals and budget into a clear plan and ad ideas.
      </p>
      <div className="card-soft mt-6 p-6 text-sm text-muted-foreground">
        This page is being set up next.
      </div>
    </div>
  );
}
