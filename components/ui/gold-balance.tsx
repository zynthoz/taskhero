'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-provider'

interface GoldBalanceProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GoldBalance({ showLabel = true, size = 'md', className = '' }: GoldBalanceProps) {
  const { user } = useAuth()
  const [gold, setGold] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadGold = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('gold')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setGold(data.gold)
      }
    }

    loadGold()

    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel('gold-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          const newGold = payload.new.gold
          if (newGold !== gold) {
            setIsAnimating(true)
            setGold(newGold)
            setTimeout(() => setIsAnimating(false), 600)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  }

  const iconSizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={iconSizeClasses[size]}>🪙</span>
      <div className="flex flex-col">
        <span 
          className={`font-semibold text-amber-400 ${sizeClasses[size]} ${
            isAnimating ? 'scale-110 transition-transform duration-300' : 'transition-transform duration-300'
          }`}
        >
          {gold.toLocaleString()}
        </span>
        {showLabel && (
          <span className="text-xs text-neutral-500">Gold</span>
        )}
      </div>
    </div>
  )
}
