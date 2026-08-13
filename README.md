# Signal

Signal (bnedsignal.com) is **donor values intelligence** for development professionals.
It generates research-backed donor briefs that surface what a prospect *values* —
their causes, public commitments, and alignment with your mission. Signal is values
intelligence, **not** wealth screening.

**Status: beta.** Pricing is intentionally hidden (`app/pricing-hidden`, unlinked)
until the beta milestone is reached.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) on Vercel
- [Supabase](https://supabase.com) — auth + database
- [Stripe](https://stripe.com) — checkout + webhooks (pricing hidden during beta)
- Anthropic Claude, Tavily, and ProPublica APIs power brief generation

## Main routes

| Route | Purpose |
|---|---|
| `/login`, `/signup`, `/reset-password`, `/update-password` | Auth (`app/(auth)`) |
| `/onboarding` | Values onboarding flow |
| `/dashboard` | Briefs list + next moves (`app/(dashboard)/dashboard`) |
| `/brief/new` | Create a new donor brief |
| `/brief/[id]` | View a generated brief |
| `POST /api/briefs/generate` | Brief generation pipeline |
| `POST /api/stripe/webhook` | Stripe webhook handler |
| `POST /api/checkout` | Stripe checkout session |

## Environment variables

Names only — values live in Vercel / `.env.local`, never in git:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `ANTHROPIC_API_KEY`
- `TAVILY_API_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_SOLO`
- `STRIPE_PRICE_ORG`
- `STRIPE_PRICE_CONSULTING`

## Local development

```bash
npm install
# create .env.local with the vars listed above
npm run dev        # http://localhost:3000
```

Verify before pushing:

```bash
npx tsc --noEmit   # run `npx next typegen` first on a fresh checkout
npm run build
```

> **Note:** this repo pins a Next.js version with breaking changes — read the
> guides in `node_modules/next/dist/docs/` before writing code (see `AGENTS.md`).
> Deploys are human-only; see the deploy protocol in `CLAUDE.md`.
