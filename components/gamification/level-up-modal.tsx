'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
  rewards?: {
    gold?: number
    item?: string
  }
}

export function LevelUpModal({ isOpen, onClose, newLevel, rewards }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-950 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold text-white">
            ⚔️ LEVEL UP! ⚔️
          </DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            Congratulations, Hero!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Level Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
              <div className="w-28 h-28 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800">
                <span className="text-5xl font-bold text-white">{newLevel}</span>
              </div>
            </div>
            {showConfetti && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-4xl animate-bounce">🎉</div>
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">
              Level {newLevel} Achieved!
            </h3>
            <p className="text-neutral-400">
              You're becoming a true hero!
            </p>
          </div>

          {/* Rewards Section */}
          {rewards && (rewards.gold || rewards.item) && (
            <div className="w-full space-y-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
              <h4 className="text-sm font-semibold text-neutral-300 text-center">
                Level-Up Rewards
              </h4>
              <div className="flex flex-col gap-2">
                {rewards.gold && (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span>💰</span>
                    <span className="font-bold">{rewards.gold} Gold</span>
                  </div>
                )}
                {rewards.item && (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span>🎁</span>
                    <span className="font-bold">{rewards.item}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Unlocked (optional) */}
          <div className="w-full space-y-3">
            <div className="text-center text-sm text-neutral-500">
              New abilities unlocked at level {newLevel}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800 text-neutral-300">
                ⚡ +5% XP Bonus
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800 text-neutral-300">
                💪 +10% Power
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Continue Your Journey
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
