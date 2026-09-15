# Hiraya Marketing — From Vision to Visibility

A digital marketing companion for small businesses: audit brand awareness, review engagement, track growth, plan social content, and get strategy plus paid-ads guidance — with an AI assistant and the option to reach a live agent.

## Your choices, applied

- Owners type in their own numbers (followers, reach, likes, comments, spend). No platform linking.
- All four areas built, plus an AI marketing assistant on every page and a "Talk to a live agent" request.
- Colours: your Hiraya palette — sage #7F8B7C, charcoal #454444, cream #FAF7F2, peach #EFDDD5, dusty rose #E8C7BD, borders #E2DDD6.
- Typography: Outfit for headings, Figtree for body.

## Pages

1. **Landing** — name, tagline, what it does, sign-up call to action.
2. **Sign up / Log in** — email and password.
3. **Dashboard** — awareness score, engagement rate, follower growth chart, quick actions.
4. **Brand Awareness Audit** — guided questionnaire (profile completeness, posting consistency, branding, reviews, discoverability) giving a score out of 100 with strengths, gaps, and AI recommendations.
5. **Engagement Analysis** — log posts with reach, likes, comments, shares; engagement rate per post, best formats, best posting times.
6. **Growth Tracking** — monthly snapshots per platform (followers, reach, leads) with trend charts and period-over-period change.
7. **Content Planner** — calendar of planned posts with platform, caption, hashtags, status (idea / drafted / scheduled / posted). AI generates a themed plan for a chosen period.
8. **Strategy & Paid Ads** — AI-built strategy from the business profile (goals, audience, budget) plus ad suggestions: platform, targeting, budget split, sample ad copy, expected outcomes.
9. **AI Assistant + Live Agent** — chat panel for marketing questions; a "Talk to a live agent" button opens a short request form (topic, preferred time, contact) that is saved and confirmed, so a real consultant can follow up.
10. **Business Profile** — name, industry, location, audience, goals, monthly budget, platforms used. Feeds every AI feature.

## Design direction

Soft, warm, editorial calm: cream and off-white surfaces, sage as the primary action colour, peach and dusty rose for highlights and chart accents, charcoal text. Generous whitespace, gently rounded cards, quiet shadows, big readable numbers. Mobile-first, since owners will use phones.

## Technical notes

- Lovable Cloud for accounts, database, and server logic. Tables: `profiles`, `businesses`, `audits`, `posts`, `growth_snapshots`, `content_plans`, `strategies`, `ad_campaigns`, `assistant_threads`, `agent_requests` — all row-level-secured to the owning user, with grants.
- Email and password auth enabled; app pages behind an authenticated route group.
- AI features run server-side through Lovable AI (`openai/gpt-6-astra`), streaming, with structured output for audits, content plans, strategies, and ad plans. Gateway errors shown in the UI.
- Palette tokens and the Outfit/Figtree pairing defined in `src/styles.css`; fonts loaded via the root head.
- Charts with Recharts; forms with react-hook-form plus zod.
- Per-page titles and descriptions for search and sharing.

## Out of scope for v1

Live social platform syncing, real ad spending or ad publishing, live human chat in real time (requests are captured for follow-up), team members, and payments.
