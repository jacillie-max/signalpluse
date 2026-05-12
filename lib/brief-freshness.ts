import type { LatteStage } from '@/types/brief'

export type FreshnessLevel = 'fresh' | 'aging' | 'stale' | 'outdated'

/** Days since a brief was generated */
export function briefAgeDays(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
}

/** Human-readable age: "3 weeks ago", "2 months ago", etc. */
export function briefAgeLabel(days: number): string {
  if (days < 1)  return 'today'
  if (days < 7)  return `${days} day${days === 1 ? '' : 's'} ago`
  if (days < 30) {
    const w = Math.round(days / 7)
    return `${w} week${w === 1 ? '' : 's'} ago`
  }
  if (days < 365) {
    const m = Math.round(days / 30)
    return `${m} month${m === 1 ? '' : 's'} ago`
  }
  const y = Math.round(days / 365)
  return `${y} year${y === 1 ? '' : 's'} ago`
}

// Stage-aware thresholds (days)
const THRESHOLDS: Record<'loose' | 'medium' | 'tight', [number, number, number]> = {
  //                     aging  stale  outdated
  loose:  [90,  150, 180],  // Look, Anticipate
  medium: [60,   90, 120],  // Think
  tight:  [30,   60,  90],  // Talk, Evaluate
}

function getThreshold(stage: LatteStage | null | undefined): [number, number, number] {
  if (!stage) return THRESHOLDS.loose
  if (stage === 'Talk' || stage === 'Evaluate') return THRESHOLDS.tight
  if (stage === 'Think') return THRESHOLDS.medium
  return THRESHOLDS.loose
}

export function getFreshnessLevel(
  days: number,
  stage: LatteStage | null | undefined,
): FreshnessLevel {
  const [aging, stale, outdated] = getThreshold(stage)
  if (days < aging)   return 'fresh'
  if (days < stale)   return 'aging'
  if (days < outdated) return 'stale'
  return 'outdated'
}

export function getFreshnessReason(
  days: number,
  stage: LatteStage | null | undefined,
): string {
  const isActiveCultivation = stage === 'Talk' || stage === 'Evaluate'
  const isYearPlus = days >= 365

  if (isActiveCultivation) {
    return "You're in active cultivation — fresh intel matters before your next meeting."
  }
  if (isYearPlus) {
    return "Annual 990 data has likely updated and board affiliations may have changed significantly."
  }
  if (days >= 90) {
    return "Board affiliations, news coverage, and giving patterns may have changed."
  }
  return "Recent news and board changes may not be reflected in this brief."
}
