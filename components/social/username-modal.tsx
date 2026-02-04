'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface UsernameModalProps {
  isOpen: boolean
  onSuccess: (username: string) => void
}

export function UsernameModal({ isOpen, onSuccess }: UsernameModalProps) {
  const [username, setUsername] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 20) return 'Username must be at most 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores'
    return null
  }

  const checkAvailability = async (value: string) => {
    const validationError = validateUsername(value)
    if (validationError) {
      setError(validationError)
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError('')
    
    const supabase = createClient()
    const { data, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', value)
      .single()

    setIsChecking(false)

    if (checkError && checkError.code === 'PGRST116') {
      // No rows returned - username is available
      setIsAvailable(true)
      setError('')
    } else if (data) {
      setIsAvailable(false)
      setError('Username is already taken')
    } else {
      setError('Error checking availability')
      setIsAvailable(null)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setIsAvailable(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!isAvailable) {
      await checkAvailability(username)
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id)

    setIsSubmitting(false)

    if (!updateError) {
      onSuccess(username)
    } else {
      setError('Failed to set username')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Choose Your Username</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Pick a unique username to compete on leaderboards and connect with friends
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-900 dark:text-white mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
              <Input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={() => username && checkAvailability(username)}
                placeholder="your_username"
                className="pl-8 bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
                maxLength={20}
                required
              />
            </div>
            
            {isChecking && (
              <p className="text-xs text-neutral-500 mt-2">Checking availability...</p>
            )}
            
            {isAvailable === true && (
              <p className="text-xs text-green-400 mt-2">✓ Username is available</p>
            )}
            
            {error && (
              <p className="text-xs text-red-400 mt-2">{error}</p>
            )}

            <p className="text-[10px] text-neutral-500 mt-2">
              3-20 characters • Letters, numbers, and underscores only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isChecking || !username || isAvailable === false}
          >
            {isSubmitting ? 'Setting username...' : isAvailable ? 'Claim Username' : 'Check Availability'}
          </Button>
        </form>
      </div>
    </div>
  )
}
