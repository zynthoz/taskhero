'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-provider'

interface ActivePowerup {
  id: string
  user_id: string
  item_id: string
  effect_type: string
  effect_value: number
  activated_at: string
  expires_at: string
  items?: {
    name: string
    emoji: string
  }
}

export function ActivePowerups() {
  const { user } = useAuth()
  const supabase = createClient()
  const [powerups, setPowerups] = useState<ActivePowerup[]>([])
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      fetchPowerups()
      
      // Set up real-time subscription
      const channel = supabase
        .channel('active_powerups_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'active_powerups',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchPowerups()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimers()
    }, 1000)

    return () => clearInterval(interval)
  }, [powerups])

  const fetchPowerups = async () => {
    try {
      const { data, error } = await supabase
        .from('active_powerups')
        .select(`
          *,
          items (name, emoji)
        `)
        .eq('user_id', user?.id)
        .gt('expires_at', new Date().toISOString())
      
      if (error) {
        // Table doesn't exist yet - migrations not applied
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setPowerups([])
          return
        }
        // Only log unexpected errors
        console.error('Error fetching powerups:', error)
        return
      }
      setPowerups(data || [])
    } catch (error) {
      // Unexpected exception
      console.error('Unexpected error fetching powerups:', error)
    }
  }

  const updateTimers = () => {
    const now = new Date().getTime()
    const newTimers: Record<string, string> = {}

    powerups.forEach(powerup => {
      const expiresAt = new Date(powerup.expires_at).getTime()
      const diff = expiresAt - now

      if (diff <= 0) {
        fetchPowerups() // Refresh to remove expired
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 0) {
        newTimers[powerup.id] = `${hours}h ${minutes}m`
      } else if (minutes > 0) {
        newTimers[powerup.id] = `${minutes}m ${seconds}s`
      } else {
        newTimers[powerup.id] = `${seconds}s`
      }
    })

    setTimeRemaining(newTimers)
  }

  const formatEffectType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (powerups.length === 0) {
    return null
  }

  return (
    <Card className="p-4 bg-neutral-900 border-neutral-800">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>✨</span>
        <span>Active Power-ups</span>
      </h3>
      
      <div className="space-y-2">
        {powerups.map(powerup => (
          <div
            key={powerup.id}
            className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{powerup.items?.emoji || '✨'}</div>
              <div>
                <p className="text-sm font-medium text-white">
                  {powerup.items?.name || 'Unknown Item'}
                </p>
                <p className="text-xs text-neutral-400">
                  {formatEffectType(powerup.effect_type)}
                  {powerup.effect_value && ` (${powerup.effect_value}x)`}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold text-green-400">
                {timeRemaining[powerup.id] || 'Calculating...'}
              </div>
              <div className="text-xs text-neutral-500">remaining</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
