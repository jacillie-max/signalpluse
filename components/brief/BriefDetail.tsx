'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  briefAgeDays,
  briefAgeLabel,
  getFreshnessLevel,
  getFreshnessReason,
} from '@/lib/brief-freshness'
import type { SignalBrief, BriefJson, BriefStatus, LatteStage } from '@/types/brief'

const STATUS_CONFIG: Record<BriefStatus, { label: string; emoji: string; active: string; ring: string }> = {
  contacted: { label: 'Contacted',  emoji: '📨', active: 'bg-blue-100 text-blue-800 border-blue-300',   ring: 'ring-blue-300' },
  met:        { label: 'Met',        emoji: '🤝', active: 'bg-purple-100 text-purple-800 border-purple-300', ring: 'ring-purple-300' },
  committed:  { label: 'Committed', emoji: '🎯', active: 'bg-green-100 text-green-800 border-green-300',  ring: 'ring-green-300' },
  passed:     { label: 'Passed',    emoji: '↩️', active: 'bg-gray-100 text-gray-600 border-gray-300',    ring: 'ring-gray-300' },
}

const LATTE_COLORS: Record<string, string> = {
  Look: 'bg-gray-100 text-gray-800',
  Anticipate: 'bg-blue-100 text-blue-800',
  Think: 'bg-purple-100 text-purple-800',
  Talk: 'bg-amber-100 text-amber-800',
  Evaluate: 'bg-green-100 text-green-800',
}

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 0.70) return <Badge className="bg-green-100 text-green-800">High confidence</Badge>
  if (score >= 0.50) return <Badge className="bg-yellow-100 text-yellow-800">Medium confidence</Badge>
  return <Badge className="bg-red-100 text-red-800">Low confidence — verify before use</Badge>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
      <h2 className="font-semibold text-[#1E3A5F] text-sm uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  )
}

export function BriefDetail({ brief }: { brief: SignalBrief }) {
  const [thumbs, setThumbs] = useState<'up' | 'down' | null>(brief.thumbs)
  const [status, setStatus] = useState<BriefStatus | null>(brief.status)
  const [financialOpen, setFinancialOpen] = useState(false)
  const supabase = createClient()
  const json = brief.brief_json as BriefJson

  async function handleThumb(val: 'up' | 'down') {
    const newVal = thumbs === val ? null : val
    setThumbs(newVal)
    await supabase.from('signal_briefs').update({ thumbs: newVal }).eq('id', brief.id)
    toast.success(newVal ? (newVal === 'up' ? 'Thanks for the feedback!' : "Noted — we'll keep improving.") : 'Feedback cleared.')
  }

  async function handleStatus(val: BriefStatus) {
    const newVal = status === val ? null : val
    setStatus(newVal)
    await supabase.from('signal_briefs').update({ status: newVal }).eq('id', brief.id)
    toast.success(newVal ? `Marked as ${STATUS_CONFIG[newVal].label.toLowerCase()}.` : 'Status cleared.')
  }

  return (
    <div>
      {/* Print-only header — hidden on screen, visible when printing */}
      <div className="print-only hidden mb-6 pb-4 border-b-2 border-[#1E3A5F]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold text-[#1E3A5F]">Signal</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Donor Intelligence Brief</p>
          </div>
          <p className="text-xs text-gray-400 text-right">
            Confidential — for internal use only<br />
            Generated {new Date(json.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A5F]">{json.donor_name}</h1>
            {json.organization && <p className="text-gray-500 text-lg">{json.organization}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Generated {new Date(json.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <ConfidenceBadge score={json.confidence_score} />
        </div>
      </div>

      {/* 1. L.A.T.T.E. Recommendation — the whole point, show first */}
      <div className="latte-print-card print-avoid-break bg-[#1E3A5F] text-white rounded-xl p-6 mb-5">
        <h2 className="font-semibold text-blue-300 text-sm uppercase tracking-wide mb-4">L.A.T.T.E. Cultivation Recommendation</h2>
        <div className="mb-4">
          <Badge className={`text-lg px-4 py-1 ${LATTE_COLORS[json.latte_recommendation.current_stage] ?? 'bg-gray-100 text-gray-800'}`}>
            {json.latte_recommendation.current_stage}
          </Badge>
        </div>
        <div className="latte-inner-box bg-[#162d4a] rounded-lg p-4 mb-4">
          <p className="text-xs text-blue-300 font-medium mb-1">Your next move</p>
          <p className="text-white text-sm leading-relaxed">{json.latte_recommendation.next_move}</p>
        </div>
        <div className="latte-inner-box bg-[#162d4a] rounded-lg p-4 mb-4">
          <p className="text-xs text-blue-300 font-medium mb-1">Suggested conversation opener</p>
          <blockquote className="text-blue-100 text-sm italic leading-relaxed border-l-2 border-[#C8922A] pl-3">
            {json.latte_recommendation.suggested_first_conversation}
          </blockquote>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed border-t border-[#162d4a] pt-4">{json.latte_recommendation.rationale}</p>
        <p className="text-xs text-blue-400 italic mt-3">L.A.T.T.E. framework from <em>Don&apos;t Leave Money on the Table</em> by Jacqueline V. Twillie</p>
      </div>

      {/* Freshness banner — only for aging/stale/outdated */}
      {(() => {
        const days = briefAgeDays(brief.created_at)
        const stage = json.latte_recommendation.current_stage as LatteStage
        const level = getFreshnessLevel(days, stage)
        if (level === 'fresh') return null

        const ageLabel = briefAgeLabel(days)
        const reason = getFreshnessReason(days, stage)

        const styles = {
          aging:    { banner: 'bg-gray-50 border-gray-200',             icon: '🕐', text: 'text-gray-600',  label: 'text-gray-700',  btn: 'text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-500' },
          stale:    { banner: 'bg-amber-50 border-amber-200',           icon: '⚠️', text: 'text-amber-700', label: 'text-amber-800', btn: 'text-amber-700 hover:text-amber-900 border-amber-300 hover:border-amber-500' },
          outdated: { banner: 'bg-orange-50 border-orange-200',         icon: '⚠️', text: 'text-orange-700',label: 'text-orange-800',btn: 'text-orange-700 hover:text-orange-900 border-orange-300 hover:border-orange-500' },
        }
        const s = styles[level]

        return (
          <div className={`border rounded-xl px-5 py-4 mb-5 flex items-start justify-between gap-4 flex-wrap ${s.banner}`}>
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-base mt-0.5 shrink-0">{s.icon}</span>
              <div>
                <p className={`text-sm font-medium ${s.label}`}>
                  This brief is {ageLabel}
                </p>
                <p className={`text-sm mt-0.5 ${s.text}`}>{reason}</p>
              </div>
            </div>
            <Link
              href={`/brief/new?from=${brief.id}`}
              className={`no-print inline-flex items-center gap-1.5 text-sm font-medium border rounded-lg px-3 py-1.5 transition-colors shrink-0 ${s.btn}`}
            >
              ↻ Refresh this brief
            </Link>
          </div>
        )
      })()}

      {/* Status tracker — loop closure */}
      <div className="no-print bg-white border border-gray-200 rounded-xl px-6 py-4 mb-5">
        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Track your progress</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(STATUS_CONFIG) as [BriefStatus, typeof STATUS_CONFIG[BriefStatus]][]).map(([key, cfg]) => {
            const isActive = status === key
            return (
              <button
                key={key}
                onClick={() => handleStatus(key)}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  isActive
                    ? `${cfg.active} ring-2 ${cfg.ring} ring-offset-1`
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700',
                ].join(' ')}
              >
                <span>{cfg.emoji}</span>
                {cfg.label}
                {isActive && (
                  <span className="ml-0.5 text-xs opacity-60">✓</span>
                )}
              </button>
            )
          })}
        </div>
        {status && (
          <p className="text-xs text-gray-400 mt-2">
            Click again to clear.
          </p>
        )}
      </div>

      {/* 2. Executive Summary */}
      <Section title="Executive Summary">
        <div className="border-l-4 border-[#C8922A] pl-4">
          <p className="text-gray-700 leading-relaxed">{json.executive_summary}</p>
        </div>
      </Section>

      {/* 3. Language Intelligence — high-value, surfaces before research sections */}
      <Section title="Language Intelligence">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Language That Activates</p>
            <div className="border-l-4 border-green-400 pl-4 space-y-2">
              {json.language_that_activates.map((l, i) => (
                <p key={i} className="text-sm text-gray-700">• {l}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">Language to Avoid</p>
            <div className="border-l-4 border-red-400 pl-4 space-y-2">
              {json.language_to_avoid.map((l, i) => (
                <p key={i} className="text-sm text-gray-700">• {l}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Values Map */}
      <Section title="Values Map">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Top Causes</p>
            <div className="flex flex-wrap gap-2">
              {json.values_map.top_causes.map(c => (
                <Badge key={c} variant="secondary" className="bg-blue-50 text-blue-800">{c}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Values Signals</p>
            <ul className="space-y-1">
              {json.values_map.values_signals.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-[#C8922A]">•</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-gray-500">Alignment Strength</p>
            <Badge className={
              json.values_map.alignment_strength === 'high' ? 'bg-green-100 text-green-800' :
              json.values_map.alignment_strength === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {json.values_map.alignment_strength}
            </Badge>
          </div>
        </div>
      </Section>

      {/* 5. Community Affiliations */}
      <Section title="Community Affiliations">
        {json.community_affiliations.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No public board affiliations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b">
                  <th className="text-left pb-2 font-medium">Organization</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-left pb-2 font-medium">Since</th>
                  <th className="text-left pb-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {json.community_affiliations.map((a, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-medium text-gray-900">{a.organization}</td>
                    <td className="py-2 pr-4 text-gray-600">{a.role}</td>
                    <td className="py-2 pr-4 text-gray-500">{a.since}</td>
                    <td className="py-2">
                      {a.source_url ? (
                        <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] hover:underline text-xs">View →</a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 6. Institutional Financial Signals — collapsed by default */}
      <div className="bg-white border border-gray-200 rounded-xl mb-5 overflow-hidden">
        <button
          onClick={() => setFinancialOpen(!financialOpen)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
        >
          <div>
            <h2 className="font-semibold text-[#1E3A5F] text-sm uppercase tracking-wide">Institutional Capacity Signals</h2>
            <p className="text-xs text-gray-400 mt-0.5">IRS Form 990 via ProPublica</p>
          </div>
          <span className="text-gray-400">{financialOpen ? '−' : 'View 990 financial data →'}</span>
        </button>
        {financialOpen && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            {!json.foundation_financial_signals.data_available ? (
              <p className="text-sm text-gray-600 italic leading-relaxed">
                No public 990 data found for this donor. This is common for individuals who give personally rather than through a named foundation. Capacity signals should be gathered through direct conversation or a dedicated wealth screening tool.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">EIN</p>
                    <p className="font-medium text-sm">{json.foundation_financial_signals.ein}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Assets (latest)</p>
                    <p className="font-medium text-sm">{json.foundation_financial_signals.total_assets_latest?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Revenue (latest)</p>
                    <p className="font-medium text-sm">{json.foundation_financial_signals.total_revenue_latest?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contributions (latest)</p>
                    <p className="font-medium text-sm">{json.foundation_financial_signals.total_contributions_latest?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Asset Trend</p>
                    <Badge className={
                      json.foundation_financial_signals.asset_trend === 'growing' ? 'bg-green-100 text-green-800' :
                      json.foundation_financial_signals.asset_trend === 'declining' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {json.foundation_financial_signals.asset_trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Capacity Band</p>
                    <Badge variant="outline">{json.foundation_financial_signals.capacity_band}</Badge>
                  </div>
                </div>
                {json.foundation_financial_signals.five_year_revenue && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">5-Year Revenue</p>
                    <div className="space-y-1">
                      {json.foundation_financial_signals.five_year_revenue.map(r => (
                        <div key={r.year} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500 w-12">{r.year}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-[#1E3A5F] h-2 rounded-full"
                              style={{
                                width: `${Math.min((r.total_revenue / Math.max(...json.foundation_financial_signals.five_year_revenue!.map(x => x.total_revenue))) * 100, 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-700 w-24 text-right">
                            {r.total_revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 italic">{json.foundation_financial_signals.data_note}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Giving History */}
      <Section title="Giving History Signals">
        <div className="space-y-3">
          {json.giving_history_signals.known_recipients.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Known Recipients</p>
              <ul className="space-y-1">
                {json.giving_history_signals.known_recipients.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-[#C8922A]">•</span>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500">Gift Pattern</p>
              <Badge variant="outline" className="mt-1">{json.giving_history_signals.gift_pattern}</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Capacity</p>
              <Badge variant="outline" className="mt-1">{json.giving_history_signals.estimated_capacity_band}</Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* 8. Sources */}
      <Section title="Sources">
        {json.sources.length < 2 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm mb-4">
            Limited sources — verify key claims before your meeting.
          </div>
        )}
        <div className="space-y-2">
          {json.sources.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{s.type}</Badge>
              <div className="min-w-0">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1E3A5F] hover:underline break-all">{s.url}</a>
                <p className="text-xs text-gray-400">Retrieved {s.retrieved_at}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Limitations */}
      <Section title="Limitations & What to Verify">
        <p className="text-sm text-gray-600 italic leading-relaxed">{json.limitations}</p>
      </Section>

      {/* Footer actions */}
      <div className="no-print flex items-center justify-between flex-wrap gap-4 pt-2 pb-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Was this brief useful?</span>
          <button
            onClick={() => handleThumb('up')}
            className={`text-xl transition-transform hover:scale-110 ${thumbs === 'up' ? 'opacity-100' : 'opacity-40'}`}
            title="Thumbs up"
          >👍</button>
          <button
            onClick={() => handleThumb('down')}
            className={`text-xl transition-transform hover:scale-110 ${thumbs === 'down' ? 'opacity-100' : 'opacity-40'}`}
            title="Thumbs down"
          >👎</button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </button>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
