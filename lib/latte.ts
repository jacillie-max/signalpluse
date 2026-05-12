import type { LatteStage } from '@/types/brief'

export const LATTE_COLORS: Record<LatteStage, { bg: string; text: string; border: string }> = {
  Look:       { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-300' },
  Anticipate: { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  Think:      { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  Talk:       { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-400' },
  Evaluate:   { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-400' },
}

// Higher = closer to an ask = surface first in Next Moves
export const LATTE_PRIORITY: Record<LatteStage, number> = {
  Look: 1,
  Anticipate: 2,
  Think: 3,
  Talk: 4,
  Evaluate: 5,
}

/** Truncate next_move text at a sentence boundary, max ~120 chars */
export function truncateNextMove(text: string, max = 120): string {
  if (text.length <= max) return text
  // Try to cut at the last sentence end before max
  const cut = text.slice(0, max)
  const lastPeriod = cut.lastIndexOf('.')
  const lastComma = cut.lastIndexOf(',')
  const boundary = lastPeriod > 80 ? lastPeriod + 1 : lastComma > 80 ? lastComma + 1 : max
  return text.slice(0, boundary).trimEnd() + '…'
}
