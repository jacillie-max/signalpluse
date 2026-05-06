'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/brief/new`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('signal_subscriptions').upsert({
        user_id: user.id,
        tier: 'free',
        briefs_used_this_period: 0,
      })
    }

    toast.success('Check your email to confirm your account.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1E3A5F]">Signal</Link>
          <h1 className="text-xl font-semibold mt-4 text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">No credit card required. Your first brief is free.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onValueChange={setEmail}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onValueChange={setPassword}
                required
                minLength={8}
                placeholder="Min. 8 characters"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8922A] hover:bg-[#b07f24] text-white"
            >
              {loading ? 'Creating account…' : 'Create account — generate your free brief'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1E3A5F] font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
