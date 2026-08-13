import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBrief } from '@/lib/brief/generate'
import { sendBriefReadyEmail } from '@/lib/email'
import { TIER_LIMITS } from '@/types/brief'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { donor_name, organization, context_notes, brief_id } = await request.json()

    if (
      typeof donor_name !== 'string' || !donor_name.trim() || donor_name.length > 200 ||
      typeof organization !== 'string' || !organization.trim() || organization.length > 200
    ) {
      return NextResponse.json({ error: 'donor_name and organization are required' }, { status: 400 })
    }

    if (context_notes != null && (typeof context_notes !== 'string' || context_notes.length > 2000)) {
      return NextResponse.json({ error: 'context_notes must be a string of at most 2000 characters' }, { status: 400 })
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (typeof brief_id !== 'string' || !UUID_RE.test(brief_id)) {
      return NextResponse.json({ error: 'Invalid brief_id' }, { status: 400 })
    }

    // Ensure subscription exists — auto-create free if missing (e.g. email-confirmed users)
    let { data: sub } = await supabase
      .from('signal_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!sub) {
      const { data: newSub } = await supabase
        .from('signal_subscriptions')
        .upsert({ user_id: user.id, tier: 'free', briefs_used_this_period: 0 })
        .select()
        .single()
      sub = newSub
    }

    if (!sub) {
      return NextResponse.json({ error: 'Could not initialize subscription' }, { status: 500 })
    }

    // Check brief limit (currently Infinity for all tiers — product is free)
    const limit = TIER_LIMITS[sub.tier]
    if (sub.briefs_used_this_period >= limit) {
      return NextResponse.json({ error: 'Brief limit reached', tier: sub.tier }, { status: 403 })
    }

    // Generate the brief
    const briefJson = await generateBrief(donor_name, organization, context_notes ?? null)

    // Reject briefs below minimum confidence
    if (briefJson.confidence_score < 0.30) {
      return NextResponse.json(
        { error: 'Brief quality below minimum threshold. Please try again or provide more context.' },
        { status: 422 }
      )
    }

    // Write to Supabase — .select() confirms a row owned by this user was actually updated
    const { data: updated, error: writeError } = await supabase
      .from('signal_briefs')
      .update({
        brief_json: briefJson,
        confidence_score: briefJson.confidence_score,
      })
      .eq('id', brief_id)
      .eq('user_id', user.id)
      .select('id')

    if (writeError || !updated || updated.length === 0) {
      console.error('Supabase write error:', writeError ?? 'no matching brief row for this user')
      return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
    }

    // Increment usage counter
    await supabase
      .from('signal_subscriptions')
      .update({ briefs_used_this_period: sub.briefs_used_this_period + 1 })
      .eq('user_id', user.id)

    // Send email notification — include L.A.T.T.E. stage + next move as teaser
    const latteStage = briefJson.latte_recommendation?.current_stage ?? null
    const nextMove = briefJson.latte_recommendation?.next_move ?? null
    await sendBriefReadyEmail(user.email!, donor_name, brief_id, latteStage, nextMove)

    return NextResponse.json({ brief_id, success: true })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json({ error: 'Brief generation failed' }, { status: 500 })
  }
}
