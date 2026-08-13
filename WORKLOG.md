# WORKLOG — signalpluse

## 2026-08-12 — Parker

- Build health: fresh checkout failed `npx tsc --noEmit` with 3 `PageProps` errors — the Next 16 generated route types didn't exist yet. `npx next typegen` (also runs during `next build`) resolves it; no code change needed. Noted in README for future checkouts.
- Replaced the default create-next-app `README.md` with a real Signal README (product description, beta status, stack, routes, env var names, local dev).
- Pricing hidden check: `/pricing-hidden` was not linked anywhere, but `app/page.tsx` publicly displayed a full pricing table and linked to `/pricing` (a 404) in the Founding Member banner and three tier CTAs. Removed the banner and the pricing preview (replaced with a free-brief beta CTA). Removed the `/pricing` 404 redirect in `NewBriefForm` (kept the limit-reached toast). Pointed the Stripe checkout `cancel_url` at `/pricing-hidden` instead of the dead `/pricing`.
- Brief flow error state: `NewBriefForm` handled HTTP error statuses, but a thrown `fetch` (network failure) or non-JSON error body left the user stuck on the spinner with no feedback. Wrapped the request in try/catch with a toast, guarded `res.json()`, and moved `clearInterval` to `finally`.
- Verified: `npx tsc --noEmit` clean, `npm run build` green (12/12 pages).
- Next: footer links `/privacy` and `/terms` on the landing page are 404s (no such routes); Stripe webhook review still open on the backlog.
