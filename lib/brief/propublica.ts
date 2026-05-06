const PROPUBLICA_BASE = 'https://projects.propublica.org/nonprofits/api/v2'

export interface ProPublicaOrg {
  ein: string
  name: string
  city: string
  state: string
  ntee_code: string
  subsection_code: number
  filings: ProPublicaFiling[]
}

export interface ProPublicaFiling {
  tax_prd_yr: number
  totrevenue: number
  totfuncexpns: number
  totassetsend: number
  totliabend: number
  pct_compnsatncurrofcr: number
  totcntrbgfts: number
}

export async function searchOrganization(name: string): Promise<ProPublicaOrg | null> {
  try {
    const encoded = encodeURIComponent(name)
    const res = await fetch(`${PROPUBLICA_BASE}/organizations/search.json?q=${encoded}`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.organizations || data.organizations.length === 0) return null
    const best = data.organizations[0]
    return getOrganization(best.ein)
  } catch {
    return null
  }
}

export async function getOrganization(ein: string): Promise<ProPublicaOrg | null> {
  try {
    const cleanEin = ein.replace('-', '')
    const res = await fetch(`${PROPUBLICA_BASE}/organizations/${cleanEin}.json`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.organization ?? null
  } catch {
    return null
  }
}

export function buildFinancialSignals(org: ProPublicaOrg | null) {
  if (!org || !org.filings || org.filings.length === 0) {
    return { data_available: false }
  }

  const sorted = [...org.filings].sort((a, b) => b.tax_prd_yr - a.tax_prd_yr)
  const latest = sorted[0]
  const fiveYear = sorted.slice(0, 5).map(f => ({
    year: f.tax_prd_yr,
    total_revenue: f.totrevenue,
  }))

  const revenues = fiveYear.map(f => f.total_revenue).filter(Boolean)
  let asset_trend: 'growing' | 'stable' | 'declining' = 'stable'
  if (revenues.length >= 2) {
    const first = revenues[revenues.length - 1]
    const last = revenues[0]
    const change = (last - first) / (first || 1)
    if (change > 0.1) asset_trend = 'growing'
    else if (change < -0.1) asset_trend = 'declining'
  }

  const assets = latest.totassetsend
  let capacity_band = '$10K-$50K'
  if (assets > 10_000_000) capacity_band = '$250K+'
  else if (assets > 1_000_000) capacity_band = '$50K-$250K'

  return {
    data_available: true,
    ein: org.ein,
    total_assets_latest: latest.totassetsend,
    total_revenue_latest: latest.totrevenue,
    total_contributions_latest: latest.totcntrbgfts,
    asset_trend,
    five_year_revenue: fiveYear,
    capacity_band,
    data_note:
      'Derived from IRS Form 990 via ProPublica Nonprofit Explorer. Reflects organizational financials, not individual donor net worth.',
  }
}
