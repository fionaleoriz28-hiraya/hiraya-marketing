# Hiraya Marketing — From Vision to Visibility

A digital marketing companion for small businesses: audit their brand awareness, review engagement, track growth, plan social content, and get strategy plus paid-ads guidance.

## Defaults I'm assuming (skipped questions)

- Owners enter their own numbers (followers, reach, likes, comments, spend). No platform account linking in v1.
- Each business signs up with email and password, and their data stays private to them.
- Strategy ideas, content calendars, and ad copy are AI-generated, with everything editable.
- All four areas built, with the audit and dashboard as the strongest first surface.

## Pages

1. **Landing** — name, tagline, what it does, sign-up call to action.
2. **Sign up / Log in** — email and password.
3. **Dashboard** — awareness score, engagement rate, follower growth chart, quick actions.
4. **Brand Awareness Audit** — short guided questionnaire (profile completeness, posting consistency, branding, reviews, discoverability) producing a score out of 100 with strengths, gaps, and AI recommendations.
5. **Engagement Analysis** — log posts with reach, likes, comments, shares; see engagement rate per post, best-performing formats, and best posting times.
6. **Growth Tracking** — monthly snapshots per platform (followers, reach, leads) with trend charts and period-over-period change.
7. **Content Planner** — calendar of planned posts with platform, caption, hashtags, status (idea / drafted / scheduled / posted). AI generates a themed content plan for a chosen period.
8. **Strategy & Paid Ads** — AI-built marketing strategy from the business profile (goals, audience, budget) plus ad campaign suggestions: platform, audience targeting, budget split, sample ad copy, and expected outcome notes.
9. **Business Profile** — name, industry, location, audience, goals, monthly budget, platforms used. Feeds every AI feature.

## Design direction

Warm, confident Filipino-modern identity — deep indigo with a gold accent, generous whitespace, editorial headings, soft cards, clear numbers. Mobile-first, since owners will use it on their phones. Fully themed, no generic purple-gradient look.

## Technical notes

- Lovable Cloud for accounts, database, and server logic. Tables: `profiles`, `businesses`, `audits`, `posts`, `growth_snapshots`, `content_plans`, `strategies`, `ad_campaigns` — all row-level-secured to the owning user, with grants.
- Email and password auth enabled; protected pages behind an authenticated route group.
- AI features run server-side through Lovable AI (`openai/gpt-6-astra`), streaming, with structured output for audits, content plans, strategies, and ad plans. Gateway errors surfaced in the UI.
- Charts with Recharts; forms with react-hook-form plus zod.
- Per-page titles and descriptions for search and sharing.

## Out of scope for v1

Live social platform syncing, real ad spending or platform ad publishing, team members, and payments.
