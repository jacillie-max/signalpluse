import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TIER_LIMITS, FOUNDING_DEADLINE } from '@/types/brief'
import type { SignalBrief, SignalSubscription } from '@/types/brief'

function confidenceBadge(score: number | null) {
  if (!score) return null
  if (score >= 0.70) return <Badge className="bg-green-100 text-green-800 text-xs">High confidence</Badge>
  if (score >= 0.50) return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium confidence</Badge>
  return <Badge className="bg-red-100 text-red-800 text-xs">Low confidence</Badge>
}

export default async function DashboardPage({
  searchParams,
}: PageProps<'/dashboard'>) {
  const { success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: sub }, { data: briefs }] = await Promise.all([
    supabase.from('signal_subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('signal_briefs').select('id, donor_name, organization, created_at, confidence_score').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const subscription = sub as SignalSubscription | null
  const tier = subscription?.tier ?? 'free'
  const used = subscription?.briefs_used_this_period ?? 0
  const limit = TIER_LIMITS[tier]
  const isAtLimit = used >= limit
  const isFoundingDeadlinePast = new Date() > new Date(FOUNDING_DEADLINE)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1E3A5F]">Signal</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" size="sm" type="submit">Log out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-4 text-sm font-medium">
            Welcome to Signal. You're now a Founding Member.
          </div>
        )}

        {/* Usage counter */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          {tier === 'free' && isAtLimit ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-gray-900">Free brief used</p>
                <p className="text-sm text-gray-500 mt-0.5">Upgrade to continue generating briefs.</p>
              </div>
              {!isFoundingDeadlinePast && (
                <Link href="/pricing" className={cn(buttonVariants(), 'bg-[#C8922A] hover:bg-[#b07f24] text-white')}>View Founding Member pricing</Link>
              )}
            </div>
          ) : tier === 'org' ? (
            <p className="font-semibold text-gray-700">Unlimited briefs</p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">Briefs this month</p>
                <span className="text-sm text-gray-500">{used} / {limit === Infinity ? '∞' : limit}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#1E3A5F] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((used / (limit as number)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Upgrade banner for free tier */}
        {tier === 'free' && isAtLimit && !isFoundingDeadlinePast && (
          <div className="bg-[#1E3A5F] text-white rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm">Your free brief has been used. Founding Member access starts at $99/mo — lock in before May 27.</p>
            <Link href="/pricing" className={cn(buttonVariants({ size: 'sm' }), 'bg-[#C8922A] hover:bg-[#b07f24] text-white shrink-0')}>See Founding Member pricing</Link>
          </div>
        )}

        {/* Briefs list */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Your briefs</h2>
            {isAtLimit ? (
              <Button disabled className="opacity-50 cursor-not-allowed" title="Upgrade to generate more briefs">
                Generate new brief
              </Button>
            ) : (
              <Link href="/brief/new" className={cn(buttonVariants(), 'bg-[#1E3A5F] hover:bg-[#162d4a] text-white')}>Generate new brief</Link>
            )}
          </div>

          {!briefs || briefs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-500 mb-4">No briefs yet. Generate your first brief to get started.</p>
              {!isAtLimit && (
                <Link href="/brief/new" className={cn(buttonVariants(), 'bg-[#C8922A] hover:bg-[#b07f24] text-white')}>Generate your first brief</Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(briefs as SignalBrief[]).map(brief => (
                <Link key={brief.id} href={`/brief/${brief.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-[#1E3A5F]">{brief.donor_name}</p>
                    {brief.organization && (
                      <p className="text-sm text-gray-500">{brief.organization}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(brief.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {confidenceBadge(brief.confidence_score)}
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
