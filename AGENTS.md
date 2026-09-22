<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->


# Hiraya Marketing Engineering Standards

## Core rule
Do not make assumptions about the production environment. Inspect the repository and current configuration before modifying infrastructure, authentication, Supabase, Stripe, AI integrations, or deployment settings.

## Coding style
- Write clean, readable, maintainable TypeScript.
- Prefer simple solutions over unnecessary abstraction.
- Reuse existing components, utilities, hooks, and patterns before introducing new ones.
- Keep changes focused; do not remove working functionality unless explicitly requested.
- Never hardcode secrets, API keys, tokens, passwords, or private credentials.
- Avoid `any`; prefer explicit types, generics, or `unknown`.
- Handle nullable values explicitly.
- Do not suppress type errors without a documented reason.

## Naming conventions
- React components and types/interfaces: `PascalCase`.
- Functions, variables, and utility files: `camelCase`.
- True global constants: `UPPER_SNAKE_CASE`.
- Hooks: `useSomething`.
- Boolean values should use descriptive prefixes such as `is`, `has`, or `can`.
- Use descriptive names that communicate intent rather than implementation details.

## Frameworks and patterns
- Use React + TypeScript with TanStack Start and Vite.
- Use the existing Tailwind/UI component system rather than introducing a competing styling approach.
- Use Supabase for application data and authentication.
- Use Stripe for billing and subscriptions.
- Keep privileged AI integrations server-side.
- Prefer functional React components and focused components with clear responsibilities.
- Avoid unnecessary React effects and duplicated state.

## Supabase
- Reuse the existing Supabase client configuration; do not create duplicate clients.
- Respect Row Level Security.
- Validate authorization server-side for protected operations.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Never place server secrets in `VITE_` environment variables.
- Browser-safe Supabase configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Server-only secrets include `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.

## Authentication and entitlements
- Never rely on client-side authorization alone.
- Validate authenticated users on server-side operations.
- Check subscription entitlements before protected AI or premium operations.
- Handle expired sessions gracefully.
- Do not expose one user's private data to another user.

## Stripe
- Keep Stripe secret keys server-side.
- Verify webhook signatures.
- Treat verified Stripe webhook events as authoritative for subscription state.
- Keep subscription tiers synchronized across Stripe, Supabase, entitlements, and UI.
- Current paid plans are Starter (₱199/month), Growth (₱459/month), and Pro (₱1,099/month); Free is ₱0/month.
- Never use false business identity, location, or verification information.

## AI
- Keep AI API keys server-side.
- Validate user input before sending it to external AI services.
- Provide loading, timeout, error, and appropriate retry states.
- Do not fabricate business metrics, customer information, or unsupported claims.
- Clearly separate AI-generated suggestions from verified application data.

## UI/UX
- Maintain Hiraya Marketing's minimalist, welcoming visual identity.
- Use consistent spacing, typography, controls, cards, forms, and navigation.
- Build responsive interfaces for desktop and mobile.
- Use semantic HTML, accessible labels, keyboard-friendly controls, and clear error states.
- Keep product language clear, friendly, practical, and professional.
- Preferred positioning: “From vision to visibility.”
- Avoid guaranteed-sales claims, misleading AI claims, and unnecessary buzzwords.

## Error handling
- Never silently swallow errors.
- Give users useful, non-technical error messages.
- Log technical details only where appropriate and safe.
- Never expose secrets, tokens, stack traces, or internal implementation details to users.
- Important asynchronous flows should handle loading, empty, success, and error states.

## Validation before completion
For every meaningful code change:
1. Check TypeScript/build errors.
2. Run linting when available.
3. Run the production build when available.
4. Verify the affected functionality.
5. Check responsive behavior for UI changes.
6. Review the diff for accidental changes and exposed secrets.
7. Confirm existing functionality was not unintentionally broken.

Do not claim a test, build, deployment, or integration check passed unless it was actually run and verified.

## Git and Lovable synchronization
- Use focused conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, or `chore:`.
- Never commit secrets or credential-bearing `.env` files.
- Never force-push, rebase, amend, or squash commits that have already been pushed to the Lovable-connected branch.
- Keep `main` in a working state because commits pushed to the connected branch sync back to Lovable.
- Before changing deployment or infrastructure, inspect the existing configuration and preserve the current Lovable integration.

## Change reporting
When completing a task, report:
- What changed.
- Which files/components were affected.
- What was actually tested.
- What remains for the user to configure, if anything.
- Any known limitation or blocker.
