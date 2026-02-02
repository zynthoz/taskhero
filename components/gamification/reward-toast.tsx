'use client'

import { useEffect, useState } from 'react'

interface RewardToastProps {
  xp: number
  gold: number
  streakMultiplier?: number
  show: boolean
  onClose: () => void
}

export function RewardToast({ xp, gold, streakMultiplier, show, onClose }: RewardToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const hasMultiplier = streakMultiplier && streakMultiplier > 1.0

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-down">
      <div className="bg-neutral-900 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-neutral-800 min-w-[280px] max-w-[320px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-white">Quest Complete!</span>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white">
            <span>⭐</span>
            <span className="font-semibold">+{xp} XP</span>
            {hasMultiplier && (
              <span className="text-xs bg-white/10 px-2 py-1 rounded border border-white/20 font-bold">
                {streakMultiplier}x 🔥
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white">
            <span>💰</span>
            <span className="font-semibold">+{gold} Gold</span>
          </div>
        </div>
      </div>
    </div>
  )
}
