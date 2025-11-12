'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function AcceptInvitationForm() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')
    if (tokenParam) setToken(tokenParam)
    if (emailParam) setEmail(emailParam)
  }, [searchParams])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    // If user is not logged in, sign them up first
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide email and password',
      })
      setLoading(false)
      return
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: authError.message,
      })
      setLoading(false)
      return
    }

    // Accept the invitation
    if (token && authData.user) {
      const { error: inviteError } = await supabase
        .from('organization_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token', token)
        .eq('email', email)

      if (inviteError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: inviteError.message,
        })
      } else {
        toast({
          title: 'Success',
          description: 'Invitation accepted! Redirecting to dashboard...',
        })
        router.push('/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleAccept} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Accepting...' : 'Accept Invitation'}
      </Button>
    </form>
  )
}

