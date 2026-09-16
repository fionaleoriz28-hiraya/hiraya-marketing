# Finish the Hiraya Marketing pages

Seven pages are still placeholders. This builds them all on the accounts, saved data and AI setup that already exist, keeping the sage/cream/peach look and Outfit + Figtree type.

## Brand Awareness Audit

- A short guided questionnaire: profile completeness, posting consistency, consistent branding, customer reviews, and how easy the business is to find.
- Answers turn into a score out of 100 shown as a big number with a friendly band (Needs work / Getting there / Strong).
- AI then writes a plain-language summary, strengths, gaps and 4-6 recommendations with effort labels.
- Each finished audit is saved, and past audits are listed with their date and score so progress is visible.

## Engagement Analysis

- Add a post: title, platform, format, date, reach, likes, comments, shares.
- Each post shows its engagement rate; a table lists all posts, newest first, with delete.
- Summary cards: average engagement rate, total reach, best performing post.
- Simple charts for engagement by format and by platform, plus a note on which days performed best.

## Growth Tracking

- Add a monthly snapshot per platform: month, platform, followers, reach, leads.
- Trend chart of followers over months, with reach and leads toggles.
- Cards showing change versus the previous month for followers, reach and leads.
- Editable list of past snapshots.

## Content Planner

- Month calendar of planned posts, each showing platform and status (idea / drafted / scheduled / posted).
- Add or edit a post by hand: date, platform, theme, caption, hashtags, status.
- "Generate a plan" asks for a period and an optional focus, then AI fills the calendar with captions and hashtags; the owner reviews and can edit or delete any item.
- Tapping a day opens its posts for editing.

## Strategy & Paid Ads

- Two sections on one page.
- Strategy: an optional notes box, then AI builds a 90-day plan (positioning, content pillars, channel plans, monthly actions, KPIs). Saved and reloadable; previous strategies listed.
- Paid ads: budget and objective inputs, then AI proposes 2-4 campaigns with platform, objective, budget split, targeting, sample ad copy and expected outcome. Each can be saved to the campaign list with a status.

## Assistant + Live Agent

- Chat panel: ask marketing questions, answers use the business profile for context. History is saved so it is there on return.
- Suggested starter questions for first-time use.
- "Talk to a live agent" opens a short form (topic, preferred time, contact, details); saved requests appear as a list with status so the owner knows it was received.

## Dashboard

- Replaces the shortcut grid with real numbers: latest audit score, average engagement rate, follower trend chart, upcoming planned posts.
- Empty states that point to the right page when there is no data yet.
- Keeps the quick links below the numbers, plus the prompt to fill in the business profile.

## Technical notes

- Data lives in the existing tables (`audits`, `posts`, `growth_snapshots`, `content_items`, `strategies`, `ad_campaigns`, `assistant_messages`, `agent_requests`), all already row-level-secured per user; writes set `user_id` from the session.
- React Query per table with shared hooks in `src/lib/`; forms with react-hook-form + zod; charts with Recharts using the theme chart tokens.
- AI calls reuse the existing server functions in `src/lib/ai.functions.ts` (`analyzeAudit`, `generateContentPlan`, `generateStrategy`, `generateAdPlan`, `askAssistant`) behind `requireSupabaseAuth`; gateway failures surface through `friendlyError` toasts.
- Each route keeps its own title/description metadata.
- After building, run the app and check sign-up, each page's save flow and one AI call end to end, then fix any build or runtime errors.

## Out of scope

Live social account syncing, real ad publishing, real-time human chat, team members, payments.
