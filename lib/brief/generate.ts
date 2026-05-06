import { searchOrganization, buildFinancialSignals } from './propublica'
import { searchDonorNews } from './tavily'
import { generateBrief as claudeGenerate } from './claude'
import type { BriefJson } from '@/types/brief'

export async function generateBrief(
  donorName: string,
  organization: string,
  contextNotes: string | null
): Promise<BriefJson> {
  // Run ProPublica + Tavily in parallel
  const [org, newsContext] = await Promise.all([
    searchOrganization(organization),
    searchDonorNews(donorName, organization),
  ])

  const financialSignals = buildFinancialSignals(org)
  const financialContext = JSON.stringify(financialSignals, null, 2)

  const brief = await claudeGenerate(
    donorName,
    organization,
    contextNotes,
    newsContext,
    financialContext
  )

  // Always override foundation_financial_signals with our ProPublica data
  brief.foundation_financial_signals = financialSignals as BriefJson['foundation_financial_signals']

  return brief
}
