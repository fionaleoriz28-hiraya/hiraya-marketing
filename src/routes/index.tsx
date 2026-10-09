import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  ChevronRight,
  Compass,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  MessageCircle,
  PenTool,
  Search,
  Sparkles,
  Users,
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
          "Hiraya Marketing helps Filipino small businesses, startups and entrepreneurs turn their vision into visibility through practical digital marketing.",
      },
      { property: "og:title", content: "Hiraya Marketing — From Vision to Visibility" },
      {
        property: "og:description",
        content:
          "Digital marketing support for Filipino small businesses, startups and entrepreneurs.",
      },
      { property: "og:image", content: `${import.meta.env.BASE_URL}hiraya-logo.svg` },
      { property: "og:image:alt", content: "Hiraya Marketing — From Vision to Visibility" },
    ],
  }),
  component: Landing,
});

const services = [
  {
    icon: MessageCircle,
    title: "Social Media Marketing",
    body: "Build a consistent presence with strategy, community-focused content and a clearer brand voice.",
  },
  {
    icon: PenTool,
    title: "Content Creation",
    body: "Turn ideas into useful, on-brand content designed to help your business be seen and remembered.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    body: "Connect the pieces of your online presence so your marketing feels intentional instead of scattered.",
  },
  {
    icon: BarChart3,
    title: "Growth & Brand Visibility",
    body: "Use practical marketing insights to understand what is working and decide what to improve next.",
  },
];

const trialPackages = [
  {
    name: "Starter",
    eyebrow: "Build your foundation",
    body: "A focused starting point for businesses that need clearer direction and a more consistent digital presence.",
    points: ["Core marketing direction", "Content support", "Visibility-focused recommendations"],
  },
  {
    name: "Growth",
    eyebrow: "Build consistency",
    body: "A broader marketing experience for businesses ready to turn regular activity into a repeatable system.",
    points: ["Expanded content support", "Growth-focused strategy", "Ongoing marketing guidance"],
    featured: true,
  },
  {
    name: "Experience + Ad",
    eyebrow: "Amplify the experience",
    body: "A hands-on trial designed to pair creative marketing support with an advertising concept.",
    points: ["Campaign concept", "Content and ad support", "Practical visibility insights"],
  },
];

const workflow = [
  ["01", "Discover", "Understand your business, audience, goals and current visibility."],
  ["02", "Strategize", "Choose the marketing priorities that make sense for your stage."],
  ["03", "Create", "Turn your direction into useful, consistent content and campaigns."],
  ["04", "Amplify", "Measure the response, learn and decide what to improve next."],
];

function Landing() {
  const { user } = useAuth();
  const workspaceTo = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <a href="#top" aria-label="Hiraya Marketing home" className="shrink-0">
            <img src={`${import.meta.env.BASE_URL}hiraya-logo.svg`} alt="Hiraya Marketing" className="h-12 w-12 object-contain" />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Primary navigation">
            <a href="#trial" className="transition-colors hover:text-foreground">6-Week Trial</a>
            <a href="#services" className="transition-colors hover:text-foreground">Services</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#about" className="transition-colors hover:text-foreground">About</a>
          </nav>
          <div className="flex items-center gap-2">
            {!user && (
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "signup" }}>Sign up</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link to="/inquiry">Join the 6-Week Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:pb-28 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Digital marketing for growing Filipino businesses
              </div>
              <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
                From Vision to Visibility.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Hiraya is the voice behind your business — helping turn your imagination into something people can see,
                understand and remember.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Practical digital marketing support for small businesses, startups and entrepreneurs who are ready to
                be heard, be known and be seen.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/inquiry">
                    Join the 6-Week Trial
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  {user ? <Link to="/dashboard">Open workspace</Link> : <Link to="/auth" search={{ mode: "signup" }}>Create free account</Link>}
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href="#services">Explore services</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Trial package fit and pricing are discussed during consultation.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -right-10 -top-10 size-44 rounded-full bg-accent/50 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 size-44 rounded-full bg-secondary/70 blur-3xl" />
              <div className="relative rounded-[2rem] border border-border bg-card p-2 shadow-soft">
                <img
                  src={heroShop}
                  alt="Small business owner arranging handmade products beside a laptop"
                  width={1280}
                  height={1024}
                  className="w-full rounded-[1.5rem] object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-5 max-w-xs rounded-2xl border border-border bg-card/95 p-4 shadow-soft backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  <HeartHandshake className="size-4" />
                  Small businesses help each other.
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Hiraya starts with collaboration, not one-size-fits-all marketing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/35">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="eyebrow text-primary">The Hiraya difference</p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  Your imagination deserves somewhere to exist.
                </h2>
              </div>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  Hiraya is the kind of company that allows your imagination to exist. We turn your imaginations into
                  realities, your visions to visibility.
                </p>
                <p>
                  We are the voice of your business. Be heard, be known, be seen — with marketing built around where
                  your business actually is today.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="trial" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-primary">Soft launch · 6 weeks</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                Try the Hiraya way of marketing.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The 6-Week Marketing Trial is an opportunity to experience strategic, creative marketing support before
                committing to a longer relationship. We match the experience to your business and discuss pricing during
                your consultation.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/inquiry">Apply for the trial <ChevronRight className="ml-1 size-4" /></Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {trialPackages.map((item) => (
              <article
                key={item.name}
                className={item.featured
                  ? "rounded-[1.25rem] border border-primary/40 bg-card p-6 shadow-soft"
                  : "rounded-[1.25rem] border border-border bg-card p-6"}
              >
                {item.featured && (
                  <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                    Recommended starting point
                  </span>
                )}
                <p className="mt-3 text-sm font-semibold text-primary">{item.name}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{item.eyebrow}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={item.featured ? "default" : "secondary"} className="mt-7 w-full">
                  <Link to="/inquiry">Discuss this package</Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-secondary/25 p-6 sm:grid-cols-3">
            {[
              [Users, "Collaborative", "We learn about your business before deciding what it needs."],
              [Lightbulb, "Practical", "The goal is useful marketing you can actually keep doing."],
              [BadgeCheck, "Transparent", "Package fit and pricing are discussed directly during consultation."],
            ].map(([Icon, title, body]) => (
              <div key={title as string} className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{title as string}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body as string}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="scroll-mt-20 border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <div className="max-w-2xl">
              <p className="eyebrow text-primary">Services</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                Marketing support that connects the pieces.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start with what your business needs now. As Hiraya grows with you, your marketing system can grow too.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <article key={service.title} className="card-soft group p-6 transition-transform hover:-translate-y-0.5">
                  <service.icon className="size-5 text-primary" />
                  <h3 className="mt-5 font-display text-xl font-semibold">{service.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{service.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="eyebrow text-primary">How Hiraya works</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                From idea to action without losing the vision.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                A simple process keeps the creative side of marketing connected to business goals.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map(([number, title, body]) => (
                <article key={number} className="rounded-2xl border border-border bg-card p-5">
                  <span className="text-xs font-semibold tracking-[0.16em] text-primary">{number}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div className="rounded-[1.5rem] border border-border bg-card p-7 shadow-soft">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                  <Compass className="size-6 text-primary" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Founder</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Fiona Leoriz</h2>
                <p className="mt-1 text-sm text-muted-foreground">Founder & Digital Marketer</p>
              </div>
              <div>
                <p className="eyebrow text-primary">Why Hiraya exists</p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  Built from a vision, with room to become something bigger.
                </h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  Fiona began building Hiraya as a self-taught aspiring digital marketer while still in senior high
                  school. What started from learning, experimenting and helping businesses become more visible is being
                  shaped into a company with a larger purpose.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  The long-term direction is to make Hiraya a fuller digital marketing platform — but today, the focus
                  is simple: build excellent marketing experiences, earn trust and grow one business relationship at a
                  time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow text-primary">Work & ideas</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">A place for the work to speak.</h2>
            </div>
            <BriefcaseBusiness className="hidden size-8 text-primary sm:block" />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Sample / concept", "Content direction", "Brand voice, post concepts and content systems built around a clear audience."],
              ["Sample / concept", "Campaign thinking", "Creative campaign ideas designed to connect a business offer with a real customer need."],
              ["Sample / concept", "Visibility systems", "Practical ways to make a business easier to discover, understand and remember online."],
            ].map(([label, title, body]) => (
              <article key={title} className="rounded-2xl border border-dashed border-border bg-secondary/20 p-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-primary">Partner stories</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Real experiences, when they are ready.</h2>
              <p className="mt-4 text-muted-foreground">
                Hiraya will only publish testimonials from real partners. We would rather let the work build the stories
                than manufacture them.
              </p>
            </div>
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-dashed border-border bg-secondary/20 p-7 text-center">
              <HeartHandshake className="mx-auto size-7 text-primary" />
              <p className="mt-3 font-semibold">Partner stories coming soon.</p>
              <p className="mt-1 text-sm text-muted-foreground">This section is ready for verified client feedback.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="rounded-[1.75rem] border border-border bg-secondary/45 p-7 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="eyebrow text-primary">Your client journey</p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  A clear next step at every stage.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [Search, "1. Inquire", "Tell Hiraya about your business and what you need."],
                  [MessageCircle, "2. Consult", "Discuss goals, priorities and the right service or trial fit."],
                  [CalendarCheck2, "3. Agree & pay", "Review the proposal, agreement and payment arrangements before work begins."],
                  [Users, "4. Onboard", "Complete your business profile and give Hiraya the context needed to do good work."],
                ].map(([Icon, title, body]) => (
                  <div key={title as string} className="rounded-xl border border-border bg-card p-4">
                    <Icon className="size-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">{title as string}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-24 pt-4 text-center sm:pb-28">
          <p className="eyebrow text-primary">Ready when you are</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Your business has a vision. Let’s make it visible.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Start with a conversation. Tell us where your business is, what you want to achieve and what kind of support
            you are looking for.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/inquiry">Join the 6-Week Trial <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to={workspaceTo}>{user ? "Open workspace" : "Sign in"}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={`${import.meta.env.BASE_URL}hiraya-logo.svg`} alt="Hiraya Marketing" className="h-12 w-12 object-contain" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              From Vision to Visibility. Digital marketing support for businesses building what comes next.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Explore</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <a className="block hover:text-foreground" href="#trial">6-Week Trial</a>
              <a className="block hover:text-foreground" href="#services">Services</a>
              <a className="block hover:text-foreground" href="#about">About</a>
              <Link className="block hover:text-foreground" to="/inquiry">Client inquiry</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <a className="block hover:text-foreground" href="mailto:hiraya.marketing2026@outlook.com">hiraya.marketing2026@outlook.com</a>
              <a className="block hover:text-foreground" href="tel:+639348231136">09348231136</a>
              <a
                className="block hover:text-foreground"
                href="https://www.facebook.com/profile.php?id=61594120709243"
                target="_blank"
                rel="noreferrer"
              >
                Facebook · Hiraya Marketing
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Serving</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Philippines · Serving businesses online
            </p>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          Hiraya Marketing · From Vision to Visibility.
        </div>
      </footer>
    </div>
  );
}
