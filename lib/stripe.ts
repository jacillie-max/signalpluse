import Stripe from 'stripe'

// Lazy init — Stripe key is optional until payments are configured
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to .env.local to enable payments.')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  })
}

export const STRIPE_PRICE_IDS: Record<string, string> = {
  solo: process.env.STRIPE_PRICE_SOLO ?? '',
  consulting: process.env.STRIPE_PRICE_CONSULTING ?? '',
  org: process.env.STRIPE_PRICE_ORG ?? '',
}

export const TIER_LABELS: Record<string, string> = {
  solo: 'Solo — Founding Member',
  consulting: 'Consulting — Founding Member',
  org: 'Org — Founding Member',
}
