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
      { property: "og:image", content: "/hiraya-logo.svg" },
      { property: "og:image:alt", content: "Hiraya Marketing — From Vision to Visibility" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Search, title: "Brand awareness audit", body: "Answer a short set of questions and get a score out of 100 with clear strengths, gaps and next steps." },
  { icon: Heart, title: "Engagement analysis", body: "Log your posts and see which formats, platforms and posting times your customers actually respond to." },
  { icon: BarChart3, title: "Growth tracking", body: "Record followers, reach and leads each month and watch the trend instead of guessing." },
  { icon: CalendarDays, title: "Content planning", body: "Get a themed calendar with ready captions and hashtags you can edit, schedule and tick off." },
  { icon: Compass, title: "Marketing strategy", body: "A 90-day plan built around your goals, audience and budget — pillars, channels and monthly actions." },
  { icon: Megaphone, title: "Paid ads guidance", body: "Campaign ideas with targeting, budget split and ad copy so every peso works harder." },
];

function Landing() {
  const { user } = useAuth();
  const primaryTo = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to={primaryTo} aria-label="Hiraya Marketing" className="flex items-center">
          <img src="/hiraya-logo.svg" alt="Hiraya Marketing" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
        </Link>
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
                Turn your marketing effort into measurable growth.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Hiraya gives small businesses a practical marketing workspace to understand what is working,
                plan what comes next, and turn consistent marketing activity into clearer customer growth.
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

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-primary">Simple plans</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Start free. Grow when you’re ready.</h2>
            <p className="mt-3 text-muted-foreground">Begin with the tools you need to get clarity, then unlock a fuller marketing workflow as your business grows.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="pricing-card flex flex-col p-6">
              <p className="text-sm font-semibold text-primary">Free</p>
              <p className="mt-2 font-display text-3xl font-semibold">₱0</p>
              <p className="mt-1 text-sm text-muted-foreground">For getting your marketing foundation in place.</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground"><li>• Brand awareness audit</li><li>• Basic growth tracking</li><li>• Marketing workspace</li></ul>
              <Button asChild variant="secondary" className="mt-8 w-full"><Link to={primaryTo}>Start free</Link></Button>
            </article>
            <article className="pricing-card flex flex-col border-primary/40 p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-primary">Starter</p><span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">For consistency</span></div>
              <p className="mt-2 font-display text-3xl font-semibold">₱399<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="mt-1 text-sm text-muted-foreground">For small businesses ready to turn activity into a repeatable system.</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground"><li>• Everything in Free</li><li>• Engagement analysis</li><li>• Content planning tools</li><li>• Strategy guidance</li></ul>
              <Button asChild className="mt-8 w-full"><Link to={primaryTo}>Choose Starter</Link></Button>
            </article>
            <article className="pricing-card flex flex-col p-6">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-primary">Growth</p><span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">For scaling</span></div>
              <p className="mt-2 font-display text-3xl font-semibold">₱999<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="mt-1 text-sm text-muted-foreground">For businesses ready to connect planning, growth tracking and promotion.</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground"><li>• Everything in Starter</li><li>• Advanced growth tracking</li><li>• Paid ads guidance</li><li>• More complete 90-day planning</li></ul>
              <Button asChild variant="secondary" className="mt-8 w-full"><Link to={primaryTo}>Choose Growth</Link></Button>
            </article>
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">Display pricing for now. Payment processing and subscription billing will be implemented separately.</p>
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
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div><p className="eyebrow text-primary">The Hiraya workflow</p><h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">From audit to action — without the guesswork.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Use one connected workflow to spot gaps, understand customer response, decide what to publish, and measure what changes.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[['01','Audit','Find visibility gaps and practical next steps.'],['02','Understand','Review engagement and growth signals.'],['03','Plan','Build content and a 90-day strategy.'],['04','Promote','Develop ad ideas and track outcomes.']].map(([number,title,body]) => <div key={number} className="rounded-[var(--radius)] border border-border bg-card p-5"><span className="text-xs font-semibold text-primary">{number}</span><h3 className="mt-2 font-display text-lg font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to be seen by the right people?</h2>
          <p className="mt-3 text-muted-foreground">Set up your business profile once, and Hiraya tailors every audit, plan and ad idea to it. Need a human? Request a live agent any time.</p>
          <Button asChild size="lg" className="mt-8"><Link to={primaryTo}>{user ? "Open workspace" : "Create your account"}</Link></Button>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Hiraya Marketing — From vision to visibility.
      </footer>
    </div>
  );
}
