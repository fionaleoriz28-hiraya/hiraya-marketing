import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/growth")({
  head: () => ({
    meta: [
      { title: "Growth tracking — Hiraya Marketing" },
      {
        name: "description",
        content: "Log your followers and reach each week and watch your growth trend.",
      },
      { property: "og:title", content: "Growth tracking — Hiraya Marketing" },
      { property: "og:description", content: "Track followers and reach over time." },
    ],
  }),
  component: GrowthPage,
});

function GrowthPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Growth tracking</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Record your numbers regularly to see progress over time.
      </p>
      <div className="card-soft mt-6 p-6 text-sm text-muted-foreground">
        This page is being set up next.
      </div>
    </div>
  );
}
