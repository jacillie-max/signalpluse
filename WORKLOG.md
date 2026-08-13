# WORKLOG — signalpluse

## 2026-08-12 — Parker

- Build health: fresh checkout failed `npx tsc --noEmit` with 3 `PageProps` errors — the Next 16 generated route types didn't exist yet. `npx next typegen` (also runs during `next build`) resolves it; no code change needed. Noted in README for future checkouts.
- Replaced the default create-next-app `README.md` with a real Signal README (product description, beta status, stack, routes, env var names, local dev).
- Pricing hidden check: `/pricing-hidden` was not linked anywhere, but `app/page.tsx` publicly displayed a full pricing table and linked to `/pricing` (a 404) in the Founding Member banner and three tier CTAs. Removed the banner and the pricing preview (replaced with a free-brief beta CTA). Removed the `/pricing` 404 redirect in `NewBriefForm` (kept the limit-reached toast). Pointed the Stripe checkout `cancel_url` at `/pricing-hidden` instead of the dead `/pricing`.
- Brief flow error state: `NewBriefForm` handled HTTP error statuses, but a thrown `fetch` (network failure) or non-JSON error body left the user stuck on the spinner with no feedback. Wrapped the request in try/catch with a toast, guarded `res.json()`, and moved `clearInterval` to `finally`.
- Verified: `npx tsc --noEmit` clean, `npm run build` green (12/12 pages).
- Next: footer links `/privacy` and `/terms` on the landing page are 404s (no such routes); Stripe webhook review still open on the backlog.

## 2026-08-12 — Gary (Security & Code Review)

- Stripe webhook (`app/api/stripe/webhook/route.ts`): DB write failures now
  return 500 so Stripe retries (before, a paying customer could silently stay
  on free); `checkout.session.completed` now inserts the subscription row when
  none exists (before, "sign up then pay immediately" lost the purchase);
  replayed events no longer re-zero usage or shift the billing period;
  foreign checkout sessions are acked instead of retried forever.
- Checkout (`app/api/checkout/route.ts`): tier validated as own string
  property (blocks prototype-chain keys); malformed JSON returns 400.
- Brief generation (`app/api/briefs/generate/route.ts`): type/length caps on
  inputs, UUID check on brief_id, and the update is confirmed to have written
  a row before usage is counted and the ready-email queued.
- Verified: `npx tsc --noEmit` clean, `npm run build` green.
- Flagged for Jacqueline (not fixed): confirm RLS is enabled on signal_briefs
  and signal_subscriptions in the Supabase dashboard; founding-member cap has
  a race needing a DB-side constraint; `customer.subscription.updated` events
  are unhandled (dashboard-made plan changes never reach the DB); consider an
  escapeHtml in `lib/email.ts` and prompt delimiters in `lib/brief/claude.ts`.
