import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Content planner — Hiraya Marketing" },
      {
        name: "description",
        content: "Plan what to post on your social media, week by week, with ideas that fit you.",
      },
      { property: "og:title", content: "Content planner — Hiraya Marketing" },
      { property: "og:description", content: "Plan your social media posts with confidence." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Content planner</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Build a simple posting calendar with ideas and captions.
      </p>
      <div className="card-soft mt-6 p-6 text-sm text-muted-foreground">
        This page is being set up next.
      </div>
    </div>
  );
}
