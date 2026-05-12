import Link from 'next/link'
import type { SignalBrief, LatteStage } from '@/types/brief'
import { LATTE_COLORS, LATTE_PRIORITY, truncateNextMove } from '@/lib/latte'

function LatteChip({ stage }: { stage: LatteStage }) {
  const c = LATTE_COLORS[stage]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {stage}
    </span>
  )
}

export function NextMovesPanel({ briefs }: { briefs: SignalBrief[] }) {
  const actionable = briefs
    .filter(b => b.latte_stage && b.next_move)
    .sort((a, b) => {
      const stageDiff =
        LATTE_PRIORITY[b.latte_stage as LatteStage] -
        LATTE_PRIORITY[a.latte_stage as LatteStage]
      if (stageDiff !== 0) return stageDiff
      // Tiebreak: most recent first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 3)

  if (actionable.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Your next moves</h2>
        <p className="text-xs text-gray-400 mt-0.5">Most advanced relationships first</p>
      </div>

      <div className="divide-y divide-gray-100">
        {actionable.map(brief => {
          const stage = brief.latte_stage as LatteStage
          const c = LATTE_COLORS[stage]
          return (
            <Link
              key={brief.id}
              href={`/brief/${brief.id}`}
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
            >
              {/* Stage accent bar */}
              <div className={`w-1 self-stretch rounded-full shrink-0 ${c.bg} border ${c.border}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <LatteChip stage={stage} />
                  <span className="font-semibold text-gray-900 text-sm">{brief.donor_name}</span>
                  {brief.organization && (
                    <span className="text-xs text-gray-400">· {brief.organization}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {truncateNextMove(brief.next_move!)}
                </p>
              </div>

              <span className="text-xs text-[#1E3A5F] font-medium shrink-0 mt-1 group-hover:underline">
                Open →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
