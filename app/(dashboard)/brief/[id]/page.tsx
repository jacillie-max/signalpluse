import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BriefDetail } from '@/components/brief/BriefDetail'
import type { SignalBrief } from '@/types/brief'

export default async function BriefDetailPage({ params }: PageProps<'/brief/[id]'>) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: brief }] = await Promise.all([
    supabase.from('signal_briefs').select('*').eq('id', id).eq('user_id', user.id).single(),
  ])

  if (!brief) notFound()

  const b = brief as SignalBrief

  // Brief not yet generated
  if (!b.brief_json) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1E3A5F] border-t-[#C8922A] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-600">Your brief is still generating…</p>
          <p className="text-sm text-gray-400 mt-2">We'll email you when it's ready.</p>
        </div>
      </div>
    )
  }

  const json = b.brief_json
  const score = json.confidence_score

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="no-print bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1E3A5F]">Signal</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
      </header>

      {/* Low confidence banner */}
      {score < 0.50 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">
          Low confidence brief — verify key claims before your meeting.
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-10">
        <BriefDetail brief={b} />
      </main>
    </div>
  )
}
