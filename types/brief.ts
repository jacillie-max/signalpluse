export interface CommunityAffiliation {
  organization: string
  role: string
  since: number
  source_url: string
}

export interface FoundationFinancialSignals {
  data_available: boolean
  ein?: string
  total_assets_latest?: number
  total_revenue_latest?: number
  total_contributions_latest?: number
  asset_trend?: 'growing' | 'stable' | 'declining'
  five_year_revenue?: { year: number; total_revenue: number }[]
  capacity_band?: string
  data_note?: string
}

export interface GivingHistorySignals {
  known_recipients: string[]
  gift_pattern: 'consistent_quarterly' | 'episodic' | 'major_only'
  estimated_capacity_band: string
}

export interface LatteRecommendation {
  current_stage: 'Look' | 'Anticipate' | 'Think' | 'Talk' | 'Evaluate'
  rationale: string
  next_move: string
  suggested_first_conversation: string
}

export interface BriefSource {
  url: string
  type: '990' | 'news' | 'board_listing' | 'interview' | 'social'
  retrieved_at: string
}

export interface ValuesMap {
  top_causes: string[]
  values_signals: string[]
  alignment_strength: 'high' | 'medium' | 'low'
}

export interface BriefJson {
  donor_name: string
  organization: string
  generated_at: string
  confidence_score: number
  executive_summary: string
  values_map: ValuesMap
  community_affiliations: CommunityAffiliation[]
  foundation_financial_signals: FoundationFinancialSignals
  giving_history_signals: GivingHistorySignals
  language_that_activates: string[]
  language_to_avoid: string[]
  latte_recommendation: LatteRecommendation
  sources: BriefSource[]
  limitations: string
}

export type LatteStage = 'Look' | 'Anticipate' | 'Think' | 'Talk' | 'Evaluate'

export interface SignalBrief {
  id: string
  user_id: string
  donor_name: string
  organization: string | null
  context_notes: string | null
  brief_json: BriefJson | null
  confidence_score: number | null
  pdf_url: string | null
  thumbs: 'up' | 'down' | null
  created_at: string
  // Extracted from brief_json in dashboard query
  latte_stage?: LatteStage | null
  next_move?: string | null
}

export interface SignalSubscription {
  id: string
  user_id: string
  tier: 'free' | 'solo' | 'consulting' | 'org'
  stripe_subscription_id: string | null
  is_founding_member: boolean
  briefs_used_this_period: number
  period_reset_date: string | null
  created_at: string
}

export const TIER_LIMITS: Record<string, number> = {
  free: Infinity,
  solo: Infinity,
  consulting: Infinity,
  org: Infinity,
}

export const FOUNDING_CAP = 25
export const FOUNDING_DEADLINE = '2026-05-27'
