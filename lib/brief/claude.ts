import Anthropic from '@anthropic-ai/sdk'
import type { BriefJson } from '@/types/brief'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const SYSTEM_PROMPT = `You are Signal's donor intelligence engine. You generate structured donor briefs for fundraising professionals.

Your job is to synthesize research inputs into a JSON brief that answers: "Will this donor give, and why?" — not just whether they can.

You apply the L.A.T.T.E. framework from Jacqueline V. Twillie's book "Don't Leave Money on the Table":
- Look: Donor is on the radar; relationship hasn't started
- Anticipate: Early signals of alignment; no direct engagement yet
- Think: Donor is engaged but evaluating; relationship is forming
- Talk: Active cultivation conversation underway
- Evaluate: Donor is close to a decision; proposal is on the table

Quality standards:
- Never fabricate facts. If data is sparse, say so honestly.
- confidence_score: 0.0–1.0. Be conservative. Use 0.5–0.7 for typical briefs with moderate data. Only go above 0.8 with strong multi-source evidence.
- limitations field is ALWAYS populated. Never leave it empty.
- language_that_activates and language_to_avoid must be grounded in evidence from the research inputs.
- The suggested_first_conversation should be a natural, relationship-first opener — not a fundraising pitch.

Return ONLY valid JSON matching the schema. No markdown, no explanation, no preamble.`

export async function generateBrief(
  donorName: string,
  organization: string,
  contextNotes: string | null,
  newsContext: string,
  financialContext: string
): Promise<BriefJson> {
  const userPrompt = `Generate a donor intelligence brief for:

DONOR: ${donorName}
ORGANIZATION: ${organization}
${contextNotes ? `RELATIONSHIP CONTEXT (from fundraiser): ${contextNotes}` : ''}

NEWS & PUBLIC RESEARCH:
${newsContext}

FINANCIAL SIGNALS (IRS Form 990 via ProPublica):
${financialContext}

Return a JSON object matching this exact schema:
{
  "donor_name": string,
  "organization": string,
  "generated_at": ISO timestamp,
  "confidence_score": number (0.0–1.0),
  "executive_summary": string (exactly 3 sentences),
  "values_map": {
    "top_causes": string[],
    "values_signals": string[],
    "alignment_strength": "high" | "medium" | "low"
  },
  "community_affiliations": [
    { "organization": string, "role": string, "since": number, "source_url": string }
  ],
  "foundation_financial_signals": ${financialContext},
  "giving_history_signals": {
    "known_recipients": string[],
    "gift_pattern": "consistent_quarterly" | "episodic" | "major_only",
    "estimated_capacity_band": "$10K-$50K" | "$50K-$250K" | "$250K+"
  },
  "language_that_activates": string[],
  "language_to_avoid": string[],
  "latte_recommendation": {
    "current_stage": "Look" | "Anticipate" | "Think" | "Talk" | "Evaluate",
    "rationale": string,
    "next_move": string,
    "suggested_first_conversation": string (3 sentences max)
  },
  "sources": [
    { "url": string, "type": "990" | "news" | "board_listing" | "interview" | "social", "retrieved_at": string }
  ],
  "limitations": string (always populated — what could not be verified; what to ask directly)
}`

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(cleaned) as BriefJson

  // QA pass — enforce quality minimums
  if (!parsed.limitations || parsed.limitations.trim() === '') {
    parsed.limitations = 'Limited public data available. Verify values alignment and giving history directly in conversation.'
  }
  if (!parsed.executive_summary || parsed.executive_summary.trim() === '') {
    throw new Error('Brief failed QA: executive_summary is empty')
  }
  if (!parsed.latte_recommendation?.current_stage) {
    throw new Error('Brief failed QA: latte_recommendation incomplete')
  }

  return parsed
}
