import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { FOUNDING_CAP, FOUNDING_DEADLINE } from '@/types/brief'

// Service-role client for webhook — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
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

    await supabaseAdmin
      .from('signal_subscriptions')
      .update({
        tier,
        stripe_subscription_id: session.subscription as string,
        is_founding_member: isFoundingMember,
        briefs_used_this_period: 0,
        period_reset_date: periodResetDate.toISOString(),
      })
      .eq('user_id', userId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await supabaseAdmin
      .from('signal_subscriptions')
      .update({ tier: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
