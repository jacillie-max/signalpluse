'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const PROGRESS_MESSAGES = [
  'Searching public records and news sources…',
  'Analyzing values signals and community affiliations…',
  'Pulling IRS Form 990 data via ProPublica…',
  'Generating your L.A.T.T.E. cultivation recommendation…',
]

export default function NewBriefPage() {
  const [donorName, setDonorName] = useState('')
  const [organization, setOrganization] = useState('')
  const [contextNotes, setContextNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Create a brief row with a stable ID to poll against
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: briefRow, error: insertError } = await supabase
      .from('signal_briefs')
      .insert({
        user_id: user.id,
        donor_name: donorName,
        organization,
        context_notes: contextNotes || null,
      })
      .select('id')
      .single()

    if (insertError || !briefRow) {
      toast.error('Failed to start brief generation.')
      setLoading(false)
      return
    }

    // Rotate progress messages
    const interval = setInterval(() => {
      setProgressIndex(i => (i + 1) % PROGRESS_MESSAGES.length)
    }, 8000)

    // Call generation API
    const res = await fetch('/api/briefs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donor_name: donorName,
        organization,
        context_notes: contextNotes || null,
        brief_id: briefRow.id,
      }),
    })

    clearInterval(interval)

    if (!res.ok) {
      const err = await res.json()
      if (err.error === 'Brief limit reached') {
        toast.error("You've reached your brief limit. Upgrade to generate more.")
        router.push('/pricing')
      } else {
        toast.error(err.error ?? 'Brief generation failed. Please try again.')
      }
      setLoading(false)
      return
    }

    router.push(`/brief/${briefRow.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-[#1E3A5F] border-t-[#C8922A] rounded-full animate-spin mx-auto mb-8" />
          <p className="text-lg font-medium text-[#1E3A5F] mb-2 transition-all duration-500">
            {PROGRESS_MESSAGES[progressIndex]}
          </p>
          <p className="text-sm text-gray-500 mt-6">
            Briefs typically take 30–90 seconds. We'll email you when it's ready — you can close this tab.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1E3A5F]">Signal</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Generate a new brief</h1>
        <p className="text-gray-500 mb-8">Signal will research values, affiliations, financial signals, and generate a L.A.T.T.E. recommendation.</p>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="donor_name">Who are you researching? *</Label>
              <Input
                id="donor_name"
                value={donorName}
                onValueChange={setDonorName}
                required
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Their primary organization or foundation *</Label>
              <Input
                id="organization"
                value={organization}
                onValueChange={setOrganization}
                required
                placeholder="e.g. Smith Family Foundation or Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context_notes">
                What do you already know? <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="context_notes"
                value={contextNotes}
                onChange={e => setContextNotes(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Add context about your relationship, prior conversations, or anything Signal should know before generating."
              />
              <p className="text-xs text-gray-400 text-right">{contextNotes.length}/500</p>
            </div>

            <Button type="submit" className="w-full bg-[#C8922A] hover:bg-[#b07f24] text-white text-base py-6">
              Generate Brief
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
