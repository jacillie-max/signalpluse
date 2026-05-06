import { tavily } from '@tavily/core'

function getClient() {
  return tavily({ apiKey: process.env.TAVILY_API_KEY! })
}

export async function searchDonorNews(donorName: string, organization: string): Promise<string> {
  try {
    const query = `${donorName} ${organization} philanthropy giving foundation board`
    const result = await getClient().search(query, {
      searchDepth: 'advanced',
      maxResults: 8,
      includeAnswer: true,
      days: 365,
    })

    const snippets = result.results
      .map(r => `[${r.title}] (${r.url})\n${r.content}`)
      .join('\n\n')

    return snippets || 'No recent news found.'
  } catch {
    return 'News search unavailable.'
  }
}

export async function searchDonorSources(donorName: string, organization: string): Promise<{ url: string; title: string }[]> {
  try {
    const result = await getClient().search(`${donorName} ${organization} philanthropist donor`, {
      searchDepth: 'advanced',
      maxResults: 10,
      days: 365,
    })
    return result.results.map(r => ({ url: r.url, title: r.title }))
  } catch {
    return []
  }
}
