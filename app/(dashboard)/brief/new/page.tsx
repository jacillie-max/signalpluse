import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NewBriefForm } from '@/components/brief/NewBriefForm'

export default async function NewBriefPage({
  searchParams,
}: PageProps<'/brief/new'>) {
  const { from } = await searchParams

  // Pre-fill if refreshing an existing brief
  let prefill: { donorName: string; organization: string; contextNotes: string } | null = null

  if (from) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('signal_briefs')
      .select('donor_name, organization, context_notes')
      .eq('id', from)
      .single()

    if (data) {
      prefill = {
        donorName: data.donor_name ?? '',
        organization: data.organization ?? '',
        contextNotes: data.context_notes ?? '',
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1E3A5F]">Signal</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">
          {prefill ? `Refresh ${prefill.donorName}'s brief` : 'Generate a new brief'}
        </h1>
        <p className="text-gray-500 mb-8">
          {prefill
            ? 'Signal will re-run research with your updated context and generate a fresh L.A.T.T.E. recommendation.'
            : 'Signal will research values, affiliations, financial signals, and generate a L.A.T.T.E. recommendation.'}
        </p>

        <NewBriefForm
          initialDonorName={prefill?.donorName}
          initialOrganization={prefill?.organization}
          initialContextNotes={prefill?.contextNotes}
          refreshingName={prefill?.donorName}
        />
      </main>
    </div>
  )
}
