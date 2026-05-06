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

    if (!donor_name || !organization) {
      return NextResponse.json({ error: 'donor_name and organization are required' }, { status: 400 })
    }

    // Check brief limit server-side
    const { data: sub } = await supabase
      .from('signal_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 403 })
    }

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

    // Write to Supabase
    const { error: writeError } = await supabase
      .from('signal_briefs')
      .update({
        brief_json: briefJson,
        confidence_score: briefJson.confidence_score,
      })
      .eq('id', brief_id)
      .eq('user_id', user.id)

    if (writeError) {
      console.error('Supabase write error:', writeError)
      return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
    }

    // Increment usage counter
    await supabase
      .from('signal_subscriptions')
      .update({ briefs_used_this_period: sub.briefs_used_this_period + 1 })
      .eq('user_id', user.id)

    // Send email notification
    await sendBriefReadyEmail(user.email!, donor_name, brief_id)

    return NextResponse.json({ brief_id, success: true })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json({ error: 'Brief generation failed' }, { status: 500 })
  }
}
