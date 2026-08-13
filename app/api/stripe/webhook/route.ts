import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { FOUNDING_CAP, FOUNDING_DEADLINE } from '@/types/brief'

// Lazy init — avoids module-level crash when env vars aren't present at build time
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.user_id
    const tier = session.metadata?.tier

    if (!userId || !tier) {
      // Not a session this app created — acknowledge so Stripe doesn't retry it forever
      console.error('checkout.session.completed missing user_id/tier metadata:', session.id)
      return NextResponse.json({ received: true })
    }

    // Idempotency: if this subscription is already applied, a replayed event
    // must not re-zero usage or shift the billing period
    const { data: existing, error: readError } = await supabaseAdmin
      .from('signal_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (readError) {
      console.error('Supabase read error:', readError)
      return NextResponse.json({ error: 'Database read failed' }, { status: 500 })
    }

    if (existing && existing.stripe_subscription_id === (session.subscription as string)) {
      return NextResponse.json({ received: true })
    }

    // Check founding member eligibility
    const { count } = await supabaseAdmin
      .from('signal_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_founding_member', true)

    const isFoundingMember =
      (count ?? 0) < FOUNDING_CAP && new Date() < new Date(FOUNDING_DEADLINE)

    const periodResetDate = new Date()
    periodResetDate.setMonth(periodResetDate.getMonth() + 1)

    const subscription = {
      tier,
      stripe_subscription_id: session.subscription as string,
      is_founding_member: isFoundingMember,
      briefs_used_this_period: 0,
      period_reset_date: periodResetDate.toISOString(),
    }

    // Insert if the user has no subscription row yet (paid before first brief),
    // otherwise update in place
    const { error: writeError } = existing
      ? await supabaseAdmin
          .from('signal_subscriptions')
          .update(subscription)
          .eq('user_id', userId)
      : await supabaseAdmin
          .from('signal_subscriptions')
          .insert({ user_id: userId, ...subscription })

    if (writeError) {
      console.error('Supabase write error:', writeError)
      return NextResponse.json({ error: 'Database write failed' }, { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const priceId = sub.items.data[0]?.price.id
    const tier = Object.keys(STRIPE_PRICE_IDS).find(
      t => STRIPE_PRICE_IDS[t] && STRIPE_PRICE_IDS[t] === priceId
    )

    if (!tier) {
      // Price doesn't map to a known tier — acknowledge so Stripe doesn't retry
      console.error('customer.subscription.updated with unknown price:', priceId, sub.id)
      return NextResponse.json({ received: true })
    }

    const { error: writeError } = await supabaseAdmin
      .from('signal_subscriptions')
      .update({ tier })
      .eq('stripe_subscription_id', sub.id)

    if (writeError) {
      console.error('Supabase write error:', writeError)
      return NextResponse.json({ error: 'Database write failed' }, { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const { error: writeError } = await supabaseAdmin
      .from('signal_subscriptions')
      .update({ tier: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)

    if (writeError) {
      console.error('Supabase write error:', writeError)
      return NextResponse.json({ error: 'Database write failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
