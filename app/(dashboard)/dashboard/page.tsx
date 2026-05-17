import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LockedDashboard from '@/components/LockedDashboard'
import { BriefsList } from '@/components/dashboard/BriefsList'
import type { SignalBrief, SignalSubscription, LatteStage } from '@/types/brief'

export default async function DashboardPage({
  searchParams,
}: PageProps<'/dashboard'>) {
  const { success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: sub }, { data: rawBriefs }] = await Promise.all([
    supabase
      .from('signal_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('signal_briefs')
      .select('id, donor_name, organization, created_at, confidence_score, status, brief_json')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const subscription = sub as SignalSubscription | null

  // Extract latte_stage + next_move from brief_json server-side
  const briefs: SignalBrief[] = (rawBriefs ?? []).map(b => {
    const latte = (b.brief_json as { latte_recommendation?: { current_stage?: string; next_move?: string } } | null)?.latte_recommendation
    return {
      ...b,
      brief_json: null, // strip full JSON — not needed in the list view
      latte_stage: (latte?.current_stage as LatteStage) ?? null,
      next_move: latte?.next_move ?? null,
    } as SignalBrief
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1E3A5F]">Signal</Link>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs font-medium border-0">
            Early access · Free
          </Badge>
          <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" size="sm" type="submit">Log out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-4 text-sm font-medium">
            Welcome to Signal. You're all set — generate your first brief below.
          </div>
        )}

        <BriefsList briefs={briefs} generateHref="/brief/new" />
        <LockedDashboard />
        <LockedDashboard />
      </main>
    </div>
  )
}
