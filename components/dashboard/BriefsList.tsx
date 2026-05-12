'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LATTE_COLORS, LATTE_PRIORITY } from '@/lib/latte'
import { NextMovesPanel } from '@/components/dashboard/NextMovesPanel'
import { briefAgeDays, getFreshnessLevel } from '@/lib/brief-freshness'
import type { SignalBrief, LatteStage, BriefStatus } from '@/types/brief'

const STATUS_BADGE: Record<BriefStatus, { label: string; className: string }> = {
  contacted: { label: 'Contacted',  className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  met:        { label: 'Met',        className: 'bg-purple-50 text-purple-700 border border-purple-200' },
  committed:  { label: 'Committed', className: 'bg-green-50 text-green-700 border border-green-200' },
  passed:     { label: 'Passed',    className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

function StatusBadge({ status }: { status: BriefStatus | null }) {
  if (!status) return null
  const cfg = STATUS_BADGE[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

const LATTE_STAGES: LatteStage[] = ['Look', 'Anticipate', 'Think', 'Talk', 'Evaluate']

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

function StageTab({
  stage,
  count,
  active,
  onClick,
}: {
  stage: LatteStage | 'all'
  count: number
  active: boolean
  onClick: () => void
}) {
  const color = stage !== 'all' ? LATTE_COLORS[stage] : null
  const activeStyle = active && color
    ? { borderBottomColor: color.hex, borderBottomWidth: '2px' }
    : active
    ? { borderBottomColor: '#1E3A5F', borderBottomWidth: '2px' }
    : {}

  return (
    <button
      onClick={onClick}
      style={activeStyle}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors whitespace-nowrap',
        active
          ? 'text-gray-900'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
      )}
    >
      {stage === 'all' ? 'All' : stage}
      <span
        className={cn(
          'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-medium',
          active
            ? stage !== 'all' && color
              ? `${color.bg} ${color.text}`
              : 'bg-[#1E3A5F]/10 text-[#1E3A5F]'
            : 'bg-gray-100 text-gray-500',
        )}
      >
        {count}
      </span>
    </button>
  )
}

export function BriefsList({ briefs, generateHref }: { briefs: SignalBrief[]; generateHref: string }) {
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<LatteStage | 'all'>('all')

  // Counts per stage from full array (unaffected by filters)
  const stageCounts = useMemo(() => {
    const counts: Record<LatteStage | 'all', number> = {
      all: briefs.length,
      Look: 0, Anticipate: 0, Think: 0, Talk: 0, Evaluate: 0,
    }
    for (const b of briefs) {
      if (b.latte_stage) counts[b.latte_stage]++
    }
    return counts
  }, [briefs])

  const filtered = useMemo(() => {
    let list = briefs
    if (stage !== 'all') {
      list = list.filter(b => b.latte_stage === stage)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        b =>
          b.donor_name.toLowerCase().includes(q) ||
          (b.organization ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [briefs, stage, search])

  const q = search.trim()

  function emptyMessage() {
    if (stage !== 'all' && !q) {
      return `No ${stage}-stage briefs yet.`
    }
    if (stage !== 'all' && q) {
      return `No results for "${q}" in ${stage}-stage briefs.`
    }
    return `No results for "${q}".`
  }

  return (
    <div>
      {/* Next Moves — only when not filtering by stage */}
      {stage === 'all' && <NextMovesPanel briefs={briefs} />}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Your briefs</h2>
            {briefs.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{briefs.length} brief{briefs.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <Link
            href={generateHref}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 py-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white transition-colors"
          >
            Generate new brief
          </Link>
        </div>

        {briefs.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-medium text-gray-900 mb-1">No briefs yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Run a brief on any donor prospect to see their values, affiliations, and your best next move.
            </p>
            <Link
              href={generateHref}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 py-2 bg-[#C8922A] hover:bg-[#b07f24] text-white transition-colors"
            >
              Generate your first brief
            </Link>
          </div>
        ) : (
          <>
            {/* Search + Stage filter bar */}
            <div className="px-6 pt-4 pb-0 space-y-3">
              {/* Search input */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or organization…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]/40 placeholder:text-gray-400 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Stage filter tabs */}
              <div className="flex gap-0 overflow-x-auto scrollbar-none -mx-1 px-1">
                <StageTab
                  stage="all"
                  count={stageCounts.all}
                  active={stage === 'all'}
                  onClick={() => setStage('all')}
                />
                {LATTE_STAGES.map(s => (
                  <StageTab
                    key={s}
                    stage={s}
                    count={stageCounts[s]}
                    active={stage === s}
                    onClick={() => setStage(s)}
                  />
                ))}
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-lg mb-1">🔎</p>
                <p className="text-sm text-gray-500">{emptyMessage()}</p>
                {(stage !== 'all' || q) && (
                  <button
                    onClick={() => { setSearch(''); setStage('all') }}
                    className="mt-3 text-xs text-[#1E3A5F] hover:underline font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 mt-2">
                {filtered.map(brief => (
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
                      {(() => {
                        const days = briefAgeDays(brief.created_at)
                        const level = getFreshnessLevel(days, brief.latte_stage ?? null)
                        const dateStr = new Date(brief.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                        return (
                          <p className="text-xs mt-0.5 flex items-center gap-1.5">
                            <span className="text-gray-400">{dateStr}</span>
                            {(level === 'stale' || level === 'outdated') && (
                              <span className="text-amber-500 font-medium">· ↻ refresh suggested</span>
                            )}
                          </p>
                        )
                      })()}
                    </div>

                    {/* Right: badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={brief.status} />
                      <ConfidenceBadge score={brief.confidence_score} />
                      {brief.latte_stage && <LatteChip stage={brief.latte_stage as LatteStage} />}
                      <span className="text-gray-300 text-sm ml-1">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
