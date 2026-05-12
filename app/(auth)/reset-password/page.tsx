'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1E3A5F]">Signal</Link>
          <h1 className="text-xl font-semibold mt-4 text-gray-900">Reset your password</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-3">
              <p className="text-gray-700">Check your email for a reset link.</p>
              <p className="text-sm text-gray-500">If you don't see it, check your spam folder.</p>
              <Link href="/login" className="text-[#1E3A5F] text-sm font-medium hover:underline">← Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C8922A] hover:bg-[#b07f24] text-white"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
              <p className="text-center text-sm">
                <Link href="/login" className="text-[#1E3A5F] hover:underline">← Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
