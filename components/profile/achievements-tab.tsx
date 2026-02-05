'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'

interface Achievement {
  id: string
  name: string
  description: string
  category: 'tasks' | 'streaks' | 'social' | 'special'
  requirement_type: string
  requirement_value: number
  reward_xp: number
  reward_gold: number
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  sort_order: number
}

interface UserAchievement {
  id: string
  achievement_id: string
  progress: number
  is_unlocked: boolean
  unlocked_at: string | null
}

const rarityColors = {
  common: 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900',
  rare: 'border-blue-400/50 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-950/20',
  epic: 'border-purple-400/50 dark:border-purple-500/50 bg-purple-50 dark:bg-purple-950/20',
  legendary: 'border-amber-400/50 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/20',
}

const rarityTextColors = {
  common: 'text-neutral-600 dark:text-neutral-400',
  rare: 'text-blue-600 dark:text-blue-400',
  epic: 'text-purple-600 dark:text-purple-400',
  legendary: 'text-amber-600 dark:text-amber-400',
}

export default function ProfileAchievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadAchievements()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAchievements = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true })

    const { data: userAchievementsData } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user?.id)

    if (achievementsData) setAchievements(achievementsData)
    if (userAchievementsData) setUserAchievements(userAchievementsData)

    setLoading(false)
  }

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId)
  }

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory)

  const stats = {
    total: achievements.length,
    unlocked: userAchievements.filter(ua => ua.is_unlocked).length,
    inProgress: userAchievements.filter(ua => !ua.is_unlocked && ua.progress > 0).length,
  }

  const categories = [
    { id: 'all', label: 'All', emoji: '🏆' },
    { id: 'tasks', label: 'Tasks', emoji: '✅' },
    { id: 'streaks', label: 'Streaks', emoji: '🔥' },
    { id: 'special', label: 'Special', emoji: '⭐' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Achievements</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {stats.unlocked}/{stats.total} unlocked • {stats.inProgress} in progress
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{stats.total}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Total</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.unlocked}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Unlocked</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.inProgress}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">In Progress</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="text-xs px-2 py-1 h-auto md:text-sm md:px-3 md:py-1.5"
          >
            <span className="mr-1">{category.emoji}</span>
            <span>{category.label}</span>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">Loading achievements...</div>
      ) : filteredAchievements.length === 0 ? (
        <Card className="p-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No achievements in this category</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Try selecting a different category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const userAch = getUserAchievement(achievement.id)
            const isUnlocked = userAch?.is_unlocked || false
            const progress = userAch?.progress || 0
            const progressPercent = Math.min((progress / achievement.requirement_value) * 100, 100)

            return (
              <Card
                key={achievement.id}
                className={`p-5 border-2 ${rarityColors[achievement.rarity]} ${!isUnlocked ? 'opacity-60' : ''} transition-all duration-200 hover:scale-[1.02]`}
              >
                {isUnlocked && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">✓ UNLOCKED</div>
                )}

                <div className="flex items-start gap-4 mb-3">
                  <div className={`text-4xl ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>{achievement.emoji}</div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{achievement.name}</h3>
                    <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${rarityTextColors[achievement.rarity]}`}>{achievement.rarity}</p>
                  </div>
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{achievement.description}</p>

                {!isUnlocked && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      <span>Progress</span>
                      <span>{progress}/{achievement.requirement_value}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                  {achievement.reward_xp > 0 && (
                    <div className="flex items-center gap-1"><span className="text-blue-500 dark:text-blue-400">⚡</span><span className="text-neutral-600 dark:text-neutral-400">+{achievement.reward_xp} XP</span></div>
                  )}
                  {achievement.reward_gold > 0 && (
                    <div className="flex items-center gap-1"><span className="text-amber-500 dark:text-amber-400">💰</span><span className="text-neutral-600 dark:text-neutral-400">+{achievement.reward_gold}</span></div>
                  )}
                  {isUnlocked && userAch?.unlocked_at && (
                    <div className="ml-auto text-neutral-500 text-[10px]">{new Date(userAch.unlocked_at).toLocaleDateString()}</div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
