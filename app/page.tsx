import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const LATTE_STAGES = [
  { stage: 'Look', desc: "Donor is on your radar. Brief surfaces who they are and what they care about." },
  { stage: 'Anticipate', desc: "Early alignment signals. Brief identifies values overlap and warm intro framing." },
  { stage: 'Think', desc: "Relationship is forming. Brief surfaces language that activates and language to avoid." },
  { stage: 'Talk', desc: "Active cultivation underway. Brief grounds conversation in donor values, not org talking points." },
  { stage: 'Evaluate', desc: "Donor is close to a decision. Brief informs how to frame the ask." },
]

const BRIEF_FEATURES = [
  'Values map — top causes, values signals, alignment strength',
  'Community affiliations — board roles, organizations, tenure',
  'Institutional financial signals — 990 assets, revenue trend, 5-year trajectory (via ProPublica)',
  'Language that activates — phrases this donor responds to',
  'Language to avoid — what reads transactional and shuts them down',
  'L.A.T.T.E. recommendation — stage, rationale, next move, suggested opener',
  'Source citations — every claim linked to a source',
  'Confidence score and limitations — honest about what couldn\'t be verified',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-xl text-[#1E3A5F]">Signal</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log in</Link>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }), 'bg-[#C8922A] hover:bg-[#b07f24] text-white')}>Get started free</Link>
        </div>
      </nav>

      {/* Founding Member Banner */}
      <div className="bg-[#1E3A5F] text-white py-3 px-6 text-center text-sm">
        <span className="font-medium">Founding Member pricing ends May 27 — or when 25 members claim it.</span>
        {' '}Lock in $99/mo before it goes to $199.{' '}
        <Link href="/pricing" className="underline font-semibold text-[#C8922A]">Claim your spot →</Link>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-[#1E3A5F] leading-tight mb-6">
          Stop screening for capacity.<br />Start screening for values.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Signal generates AI-powered donor briefs that tell you why a prospect gives — not just whether they can. Know the values, the language, and the next move before you walk in the room.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'bg-[#C8922A] hover:bg-[#b07f24] text-white text-base px-8')}>Generate your free brief →</Link>
          <a href="#how-it-works" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base px-8')}>See how it works</a>
        </div>
        <p className="text-sm text-gray-500 mt-4">No credit card required. One free brief, yours to keep.</p>
      </section>

      {/* The Gap */}
      <section className="bg-gray-50 border-y border-gray-100 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-[#1E3A5F] mb-3">The gap Signal closes</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Wealth screening tells fundraisers who has money. Signal tells them who shares their mission — and how to start the right conversation.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-12 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Enter a donor name', desc: 'Add their name, organization, and any context you already have.' },
            { step: '2', title: 'Signal researches', desc: 'Values, affiliations, public language, and 990 financial signals — all synthesized in under 90 seconds.' },
            { step: '3', title: 'Receive your brief', desc: 'A structured brief with a L.A.T.T.E. cultivation recommendation lands in your dashboard and inbox.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-[#1E3A5F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{step}</div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's in a Brief */}
      <section className="bg-gray-50 border-y border-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-10 text-center">What's in a brief</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {BRIEF_FEATURES.map((f, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-[#C8922A] font-bold mt-0.5">→</span>
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-10 text-center">Who it's for</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-xl p-8">
            <h3 className="font-bold text-xl mb-2 text-[#1E3A5F]">Fundraising Consultant</h3>
            <p className="text-gray-600 leading-relaxed">Manages 3–6 nonprofit clients. Runs cultivation on multiple portfolios. Needs research speed without a research team.</p>
            <p className="mt-4 text-sm italic text-gray-500">"It does the research so I can do the relationship."</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-8">
            <h3 className="font-bold text-xl mb-2 text-[#1E3A5F]">Major Gift Officer</h3>
            <p className="text-gray-600 leading-relaxed">Manages 30–80 relationships personally. Has capacity data. Needs the values layer to have the right conversation.</p>
            <p className="mt-4 text-sm italic text-gray-500">"Knows the language before she picks up the phone."</p>
          </div>
        </div>
      </section>

      {/* L.A.T.T.E. Framework */}
      <section className="bg-[#1E3A5F] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 text-center">Every brief tells you exactly where the relationship stands</h2>
          <p className="text-center text-blue-200 mb-10 text-sm">From Jacqueline V. Twillie's book <em>Don't Leave Money on the Table</em></p>
          <div className="space-y-4">
            {LATTE_STAGES.map(({ stage, desc }) => (
              <div key={stage} className="flex gap-4 items-start border-b border-blue-800 pb-4 last:border-0">
                <Badge className="bg-[#C8922A] text-white min-w-[100px] justify-center text-sm py-1">{stage}</Badge>
                <p className="text-blue-100 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4 text-center">Start free. Upgrade when Signal earns it.</h2>
        <p className="text-center text-gray-500 mb-12">Founding Member pricing locks in for 12 months. Cap: 25 members or May 27, 2026.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { tier: 'Free', price: '$0', briefs: '1 brief, one time', cta: 'Start free — no card', href: '/signup', highlight: false },
            { tier: 'Solo', price: '$99/mo', was: '$199/mo', briefs: '10 briefs/mo', cta: 'Claim Founding Member', href: '/pricing', highlight: false },
            { tier: 'Consulting', price: '$249/mo', was: '$499/mo', briefs: '30 briefs/mo', cta: 'Claim Founding Member', href: '/pricing', highlight: true },
            { tier: 'Org', price: '$999/mo', was: '$1,500/mo', briefs: 'Unlimited', cta: 'Claim Founding Member', href: '/pricing', highlight: false },
          ].map(({ tier, price, was, briefs, cta, href, highlight }) => (
            <div key={tier} className={`border rounded-xl p-6 flex flex-col ${highlight ? 'border-[#C8922A] shadow-lg' : 'border-gray-200'}`}>
              {highlight && <Badge className="bg-[#C8922A] text-white self-start mb-3 text-xs">Most popular</Badge>}
              <h3 className="font-bold text-lg text-[#1E3A5F]">{tier}</h3>
              <div className="my-3">
                <span className="text-2xl font-bold">{price}</span>
                {was && <span className="text-sm text-gray-400 line-through ml-2">{was}</span>}
              </div>
              <p className="text-sm text-gray-500 mb-6">{briefs}</p>
              <Link href={href} className={cn(buttonVariants({ variant: highlight ? 'default' : 'outline', size: 'sm' }), 'mt-auto', highlight ? 'bg-[#C8922A] hover:bg-[#b07f24] text-white' : '')}>{cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Signal · signal.jacquelinetwillie.com</p>
        <p>© 2026 Jacqueline V. Twillie</p>
        <div className="flex gap-4 justify-center mt-2">
          <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-700">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
