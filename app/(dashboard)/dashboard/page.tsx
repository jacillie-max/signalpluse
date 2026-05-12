import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LATTE_COLORS } from '@/lib/latte'
import { NextMovesPanel } from '@/components/dashboard/NextMovesPanel'
import type { SignalBrief, SignalSubscription, LatteStage } from '@/types/brief'

function ConfidenceBadge({ score }: { score: number | null }) {
  if (!score) return null
  if (score >= 0.70) return <Badge className="bg-green-100 text-green-800 text-xs shrink-0">High</Badge>
  if (score >= 0.50) return <Badge className="bg-yellow-100 text-yellow-800 text-xs shrink-0">Medium</Badge>
  return <Badge className="bg-red-100 text-red-800 text-xs shrink-0">Low</Badge>
}

function LatteChip({ stage }: { stage: LatteStage }) {
  const c = LATTE_COLORS[stage]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${c.bg} ${c.text}`}>
      {stage}
    </span>
  )
}

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
      .select('id, donor_name, organization, created_at, confidence_score, brief_json')
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

        {/* Next moves panel — only renders when there are actionable briefs */}
        <NextMovesPanel briefs={briefs} />

        {/* Briefs list */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">Your briefs</h2>
              {briefs.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{briefs.length} brief{briefs.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            <Link
              href="/brief/new"
              className={cn(buttonVariants({ size: 'sm' }), 'bg-[#1E3A5F] hover:bg-[#162d4a] text-white')}
            >
              Generate new brief
            </Link>
          </div>

          {briefs.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="font-medium text-gray-900 mb-1">No briefs yet</p>
              <p className="text-sm text-gray-500 mb-6">Run a brief on any donor prospect to see their values, affiliations, and your best next move.</p>
              <Link
                href="/brief/new"
                className={cn(buttonVariants(), 'bg-[#C8922A] hover:bg-[#b07f24] text-white')}
              >
                Generate your first brief
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {briefs.map(brief => (
                <Link
                  key={brief.id}
                  href={`/brief/${brief.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  {/* Left: name + org + date */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-[#1E3A5F] truncate">
                      {brief.donor_name}
                    </p>
                    {brief.organization && (
                      <p className="text-sm text-gray-500 truncate">{brief.organization}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(brief.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Right: badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ConfidenceBadge score={brief.confidence_score} />
                    {brief.latte_stage && <LatteChip stage={brief.latte_stage as LatteStage} />}
                    <span className="text-gray-300 text-sm ml-1">→</span>
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
