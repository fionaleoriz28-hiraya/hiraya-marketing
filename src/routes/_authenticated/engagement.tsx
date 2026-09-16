import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/engagement")({
  head: () => ({
    meta: [
      { title: "Engagement analysis — Hiraya Marketing" },
      {
        name: "description",
        content: "See which posts your customers respond to and what to do more of.",
      },
      { property: "og:title", content: "Engagement analysis — Hiraya Marketing" },
      { property: "og:description", content: "Understand what your audience responds to." },
    ],
  }),
  component: EngagementPage,
});

function EngagementPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Engagement analysis</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add your posts with likes, comments and reach to see what works best.
      </p>
      <div className="card-soft mt-6 p-6 text-sm text-muted-foreground">
        This page is being set up next.
      </div>
    </div>
  );
}
