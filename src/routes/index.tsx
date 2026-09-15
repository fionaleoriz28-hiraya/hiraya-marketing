import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Compass,
  Heart,
  MessageCircle,
  Megaphone,
  Search,
} from "lucide-react";

import heroShop from "@/assets/hero-shop.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hiraya Marketing — From Vision to Visibility" },
      {
        name: "description",
        content:
          "Hiraya Marketing helps small businesses audit brand awareness, analyse engagement, track growth, plan social content and run smarter paid ads.",
      },
      { property: "og:title", content: "Hiraya Marketing — From Vision to Visibility" },
      {
        property: "og:description",
        content:
          "A simple digital marketing workspace for small businesses: audits, engagement, growth, content plans, strategy and ads.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Search,
    title: "Brand awareness audit",
    body: "Answer a short set of questions and get a score out of 100 with clear strengths, gaps and next steps.",
  },
  {
    icon: Heart,
    title: "Engagement analysis",
    body: "Log your posts and see which formats, platforms and posting times your customers actually respond to.",
  },
  {
    icon: BarChart3,
    title: "Growth tracking",
    body: "Record followers, reach and leads each month and watch the trend instead of guessing.",
  },
  {
    icon: CalendarDays,
    title: "Content planning",
    body: "Get a themed calendar with ready captions and hashtags you can edit, schedule and tick off.",
  },
  {
    icon: Compass,
    title: "Marketing strategy",
    body: "A 90-day plan built around your goals, audience and budget — pillars, channels and monthly actions.",
  },
  {
    icon: Megaphone,
    title: "Paid ads guidance",
    body: "Campaign ideas with targeting, budget split and ad copy so every peso works harder.",
  },
];

function Landing() {
  const { user } = useAuth();
  const primaryTo = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div>
          <span className="font-display text-xl font-semibold">Hiraya</span>
          <span className="ml-1 font-display text-xl font-light text-primary">Marketing</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={primaryTo}>{user ? "Open workspace" : "Sign in"}</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-6 pb-16 sm:pt-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
                From vision to visibility
              </p>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-foreground sm:text-5xl">
                Marketing clarity for small businesses.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Hiraya turns scattered social media effort into a plan you can follow: know how
                visible your brand is, what your audience responds to, and exactly what to post and
                promote next.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to={primaryTo}>
                    {user ? "Open workspace" : "Start free audit"}
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to={user ? "/assistant" : "/auth"}>
                    <MessageCircle className="mr-1 size-4" />
                    Talk to Hiraya
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                You enter your own numbers — no account linking needed.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -right-4 hidden size-32 rounded-full bg-accent/60 blur-2xl sm:block" />
              <img
                src={heroShop}
                alt="Small business owner arranging handmade products beside a laptop in her shop"
                width={1280}
                height={1024}
                className="relative w-full rounded-[calc(var(--radius)+8px)] border border-border object-cover shadow-soft"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Everything your marketing needs, in one calm place
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="card-soft p-6">
                  <feature.icon className="size-5 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Ready to be seen by the right people?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Set up your business profile once, and Hiraya tailors every audit, plan and ad idea to
            it. Need a human? Request a live agent any time.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to={primaryTo}>{user ? "Open workspace" : "Create your account"}</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Hiraya Marketing — From vision to visibility.
      </footer>
    </div>
  );
}
