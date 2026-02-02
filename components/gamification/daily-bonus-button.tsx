'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-provider'

export function DailyBonusButton() {
  const { user } = useAuth()
  const [canClaim, setCanClaim] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [reward, setReward] = useState<any>(null)

  useEffect(() => {
    checkDailyBonus()
  }, [user])

  const checkDailyBonus = async () => {
    if (!user) return

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    const { data } = await supabase
      .from('daily_bonuses')
      .select('*')
      .eq('user_id', user.id)
      .eq('bonus_date', today)
      .single()
    
    setCanClaim(!data)
  }

  const claimBonus = async () => {
    if (!user || !canClaim) return

    setIsClaiming(true)
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.rpc('claim_daily_bonus', {
        p_user_id: user.id
      })

      if (error) throw error

      if (data.success) {
        setReward(data)
        setShowReward(true)
        setCanClaim(false)
      }
    } catch (error) {
      console.error('Error claiming daily bonus:', error)
    } finally {
      setIsClaiming(false)
    }
  }

  if (!canClaim) return null

  return (
    <>
      <Button
        onClick={claimBonus}
        disabled={isClaiming}
        variant="primary"
        className="w-full animate-pulse"
        style={{ background: 'linear-gradient(to right, rgb(217, 119, 6), rgb(245, 158, 11))' }}
      >
        🎁 Claim Daily Bonus!
      </Button>

      {showReward && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <Card className="p-8 bg-neutral-900 border-neutral-700 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-2xl font-bold text-white">Daily Bonus Claimed!</h2>
              <div className="text-sm text-neutral-400">
                Login Streak: {reward.consecutive_days} {reward.consecutive_days === 1 ? 'day' : 'days'}
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-4">
                  <div className="text-3xl mb-2">🪙</div>
                  <div className="text-2xl font-bold text-amber-400">+{reward.gold_gained}</div>
                  <div className="text-xs text-neutral-500">Gold</div>
                </div>
                <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-blue-400">+{reward.xp_gained}</div>
                  <div className="text-xs text-neutral-500">XP</div>
                </div>
              </div>

              {reward.multiplier > 1 && (
                <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-3">
                  <div className="text-green-400 font-semibold">
                    🔥 {reward.multiplier}x Streak Bonus!
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Keep logging in daily to increase your bonus
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowReward(false)}
                variant="primary"
                className="w-full mt-4"
              >
                Awesome!
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
