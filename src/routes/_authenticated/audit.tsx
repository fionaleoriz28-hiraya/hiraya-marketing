import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Brand awareness audit — Hiraya Marketing" },
      {
        name: "description",
        content: "Check how visible your brand is and where to improve, step by step.",
      },
      { property: "og:title", content: "Brand awareness audit — Hiraya Marketing" },
      { property: "og:description", content: "See how visible your brand is today." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Brand awareness audit</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Answer a few questions about your presence and get a clear score with next steps.
      </p>
      <div className="card-soft mt-6 p-6 text-sm text-muted-foreground">
        This page is being set up next.
      </div>
    </div>
  );
}
