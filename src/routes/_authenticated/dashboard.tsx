import { createFileRoute, Link } from "@tanstack/react-router";

import { useBusiness } from "@/lib/business";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hiraya Marketing" },
      {
        name: "description",
        content:
          "See your brand awareness score, engagement rate and follower growth at a glance in Hiraya Marketing.",
      },
      { property: "og:title", content: "Dashboard — Hiraya Marketing" },
      {
        property: "og:description",
        content: "Your marketing numbers in one calm view: awareness, engagement and growth.",
      },
    ],
  }),
  component: Dashboard,
});

const shortcuts = [
  { to: "/audit", label: "Brand awareness audit", copy: "Check how visible your brand is." },
  { to: "/engagement", label: "Engagement analysis", copy: "See which posts people respond to." },
  { to: "/growth", label: "Growth tracking", copy: "Log followers and watch the trend." },
  { to: "/planner", label: "Content planner", copy: "Plan what to post, week by week." },
  { to: "/strategy", label: "Strategy & ads", copy: "Build a plan and ad ideas." },
  { to: "/assistant", label: "Assistant", copy: "Ask for marketing help anytime." },
] as const;

function Dashboard() {
  const { data: business, isLoading } = useBusiness();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">
        {business?.name ? `Welcome back, ${business.name}` : "Welcome to Hiraya"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">From vision to visibility.</p>

      {!isLoading && !business && (
        <div className="card-soft mt-6 p-6">
          <h2 className="font-display text-lg font-semibold">Start with your business profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about your business so every suggestion fits you.
          </p>
          <Button asChild className="mt-4">
            <Link to="/profile">Add business details</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link key={item.to} to={item.to} className="card-soft p-5 transition-colors hover:bg-secondary/50">
            <h3 className="font-display text-base font-semibold">{item.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
