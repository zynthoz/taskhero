'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getStreakMultiplier, getStreakTier } from '@/lib/streak-utils'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  lastActivityDate?: string
}

const streakMilestones = [
  { days: 3, label: 'Bronze', emoji: '🥉', color: 'text-amber-700' },
  { days: 7, label: 'Silver', emoji: '🥈', color: 'text-neutral-300' },
  { days: 14, label: 'Silver+', emoji: '🥈', color: 'text-neutral-200' },
  { days: 30, label: 'Gold', emoji: '🥇', color: 'text-amber-400' },
  { days: 50, label: 'Gold+', emoji: '🥇', color: 'text-amber-300' },
  { days: 100, label: 'Diamond', emoji: '💎', color: 'text-blue-300' },
]

export function StreakDisplay({ currentStreak, longestStreak, lastActivityDate }: StreakDisplayProps) {
  const multiplier = getStreakMultiplier(currentStreak)
  const tier = getStreakTier(currentStreak)
  
  // Find next milestone
  const nextMilestone = streakMilestones.find(m => m.days > currentStreak) || streakMilestones[streakMilestones.length - 1]
  const currentMilestone = streakMilestones.filter(m => m.days <= currentStreak).pop()
  
  // Progress to next milestone
  const prevMilestone = streakMilestones.filter(m => m.days <= currentStreak).slice(-2)[0]
  const start = prevMilestone?.days || 0
  const end = nextMilestone.days
  const progress = ((currentStreak - start) / (end - start)) * 100

  const isActive = lastActivityDate === new Date().toISOString().split('T')[0]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Streak Status</h3>
        {isActive && (
          <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50 rounded text-xs text-green-700 dark:text-green-400 font-semibold">
            ✓ Active Today
          </div>
        )}
      </div>

      {/* Current Streak Display */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-6xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">{currentStreak}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Current Streak</div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Longest</div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white">{longestStreak}</div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-neutral-800/50 rounded-lg border border-orange-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Multiplier</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{multiplier}x</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Milestone */}
      {currentMilestone && (
        <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentMilestone.emoji}</span>
              <div>
                <div className={`text-sm font-semibold ${currentMilestone.color}`}>
                  {currentMilestone.label} Tier
                </div>
                <div className="text-xs text-neutral-500">
                  {currentMilestone.days} day milestone reached
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress to Next Milestone */}
      {currentStreak < 100 && (
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
            <span>Next: {nextMilestone.label} ({nextMilestone.days} days)</span>
            <span>{currentStreak}/{nextMilestone.days}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2 mb-2" />
          <div className="text-xs text-neutral-500 text-center">
            {nextMilestone.days - currentStreak} days until next milestone
          </div>
        </div>
      )}

      {/* Milestone Grid */}
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Milestones</div>
        <div className="grid grid-cols-3 gap-2">
          {streakMilestones.map((milestone, index) => {
            const achieved = currentStreak >= milestone.days
            return (
              <div
                key={index}
                className={`p-2 rounded border text-center ${
                  achieved
                    ? 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-600'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-50'
                }`}
              >
                <div className="text-xl mb-1">{milestone.emoji}</div>
                <div className={`text-xs font-semibold ${achieved ? milestone.color : 'text-neutral-400 dark:text-neutral-600'}`}>
                  {milestone.days}d
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
