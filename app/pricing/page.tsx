'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FOUNDING_DEADLINE } from '@/types/brief'

const isFoundingDeadlinePast = new Date() > new Date(FOUNDING_DEADLINE)

const TIERS = [
  {
    key: 'free',
    name: 'Free — Early Access',
    price: '$0',
    briefs: 'Unlimited briefs during early access',
    cardRequired: false,
    cta: 'Get started — no card',
    href: '/signup',
    founding: false,
    highlight: true,
  },
  {
    key: 'solo',
    name: 'Solo',
    foundingPrice: '$99/mo',
    standardPrice: '$199/mo',
    briefs: '10 briefs/month',
    cardRequired: true,
    cta: 'Coming soon',
    founding: true,
    comingSoon: true,
  },
  {
    key: 'consulting',
    name: 'Consulting',
    foundingPrice: '$249/mo',
    standardPrice: '$499/mo',
    briefs: '30 briefs/month',
    cardRequired: true,
    cta: 'Coming soon',
    founding: true,
    popular: true,
    comingSoon: true,
  },
  {
    key: 'org',
    name: 'Org',
    foundingPrice: '$999/mo',
    standardPrice: '$1,500/mo',
    briefs: 'Unlimited',
    cardRequired: true,
    cta: 'Coming soon',
    founding: true,
    comingSoon: true,
  },
]

const FAQS = [
  {
    q: 'What is a brief?',
    a: 'A structured donor intelligence report covering values, affiliations, financial signals, language recommendations, and a L.A.T.T.E. cultivation recommendation.',
  },
  {
    q: 'What\'s the difference between Founding Member and standard pricing?',
    a: 'Founding Member rates are locked in for 12 months. After the cap (25 members) or May 27, prices move to standard rates.',
  },
  {
    q: 'Does the free brief expire?',
    a: 'No. Your free brief is yours to keep. There\'s no time limit.',
  },
  {
    q: 'Does Signal replace iWave or DonorSearch?',
    a: 'No — Signal is a values intelligence layer. Most users run Signal alongside their existing capacity screening tools.',
  },
  {
    q: 'What if Signal can\'t find data on my donor?',
    a: 'Signal always returns something useful. If 990 data isn\'t available (common for individual donors), the brief tells you that directly and recommends how to fill the gap.',
  },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleCheckout(tier: string) {
    setLoading(tier)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.assign(data.url)
    } else if (res.status === 401) {
      router.push('/signup')
    } else {
      toast.error('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold text-[#1E3A5F]">Signal</Link>
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log in</Link>
      </header>

      {/* Early access banner */}
      <div className="bg-[#1E3A5F] text-white py-3 px-6 text-center text-sm">
        Signal is free during early access — unlimited briefs, no card required.
      </div>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1E3A5F] mb-3">Signal Pricing</h1>
          <p className="text-xl text-gray-500">Free during early access. Paid plans coming soon.</p>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {TIERS.map(tier => (
            <div
              key={tier.key}
              className={`border rounded-xl p-6 flex flex-col relative ${
                'highlight' in tier && tier.highlight
                  ? 'border-[#1E3A5F] shadow-lg'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              {'popular' in tier && tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8922A] text-white text-xs px-3">
                  Most popular
                </Badge>
              )}
              {'highlight' in tier && tier.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E3A5F] text-white text-xs px-3">
                  Available now
                </Badge>
              )}
              <h2 className="font-bold text-lg text-[#1E3A5F] mb-2">{tier.name}</h2>
              <div className="mb-1">
                {'foundingPrice' in tier ? (
                  <span className="text-2xl font-bold text-gray-400">{tier.foundingPrice}</span>
                ) : (
                  <span className="text-2xl font-bold">{tier.price}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6 flex-1">{tier.briefs}</p>
              {tier.key === 'free' ? (
                <Link href={tier.href!} className={buttonVariants({ variant: 'default', size: 'sm', className: 'bg-[#1E3A5F] hover:bg-[#162d4a] text-white' })}>{tier.cta}</Link>
              ) : (
                <Button
                  size="sm"
                  disabled
                  className="bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  {tier.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">Common questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 font-medium text-gray-900 flex items-center justify-between hover:bg-gray-50"
                >
                  {faq.q}
                  <span className="text-gray-400 ml-4">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
