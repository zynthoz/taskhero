'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'

interface StreakProtectionIndicatorProps {
  userId: string
}

export function StreakProtectionIndicator({ userId }: StreakProtectionIndicatorProps) {
  const [protectionCount, setProtectionCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProtectionStatus()
  }, [userId])

  const loadProtectionStatus = async () => {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('active_powerups')
      .select('quantity')
      .eq('user_id', userId)
      .eq('effect_type', 'streak_protection')
    
    if (data && data.length > 0) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0)
      setProtectionCount(total)
    }
    
    setLoading(false)
  }

  if (loading || protectionCount === 0) {
    return null
  }

  return (
    <Card className="p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center border-2 border-blue-700">
          <span className="text-lg">🛡️</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-blue-300">
            Streak Protection Active
          </div>
          <div className="text-xs text-blue-400/70">
            {protectionCount} {protectionCount === 1 ? 'use' : 'uses'} remaining
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-2xl font-bold text-blue-300">
            {protectionCount}
          </div>
        </div>
      </div>
    </Card>
  )
}
