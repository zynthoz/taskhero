'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { LevelHistory } from '@/components/gamification/level-history'
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

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userData, setUserData] = useState({
    level: 1,
    currentXp: 0,
    totalXp: 0,
    currentStreak: 0,
    username: '',
    xpForNextLevel: undefined as number | undefined,
    avatarId: undefined as string | undefined,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  const sidebarUserData = {
    username: userData.username || user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: userData.level,
    currentXp: userData.currentXp,
    xpForNextLevel: userData.level * 100,
    currentStreak: userData.currentStreak,
    totalPoints: userData.totalXp,
    rank: 'Unranked',
    avatarId: userData.avatarId,
  }

  useEffect(() => {
    if (user) {
      loadAchievements()
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('level, current_xp, total_xp, current_streak, username, avatar_id')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setUserData({
        level: data.level || 1,
        currentXp: data.current_xp || 0,
        totalXp: data.total_xp || 0,
        currentStreak: data.current_streak || 0,
        username: data.username || '',
        xpForNextLevel: (data.level || 1) * 100,
        avatarId: data.avatar_id || undefined,
      })
      setProfileLoaded(true)
    } else {
      setProfileLoaded(true)
    }
  }

  const loadAchievements = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Load all achievements
    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true })
    
    // Load user's achievement progress
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
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={sidebarUserData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Achievements</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {stats.unlocked}/{stats.total} unlocked • {stats.inProgress} in progress
          </p>
        </div>

        {/* Stats Overview */}
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

        {/* Category Tabs */}
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-1.5">{category.emoji}</span>
              {category.label}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">
            Loading achievements...
          </div>
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
                  className={`p-5 border-2 ${rarityColors[achievement.rarity]} ${
                    !isUnlocked ? 'opacity-60' : ''
                  } transition-all duration-200 hover:scale-[1.02]`}
                >
                  {isUnlocked && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      ✓ UNLOCKED
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-3">
                    <div className={`text-4xl ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
                      {achievement.emoji}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                        {achievement.name}
                      </h3>
                      <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${rarityTextColors[achievement.rarity]}`}>
                        {achievement.rarity}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!isUnlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        <span>Progress</span>
                        <span>{progress}/{achievement.requirement_value}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                    {achievement.reward_xp > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-blue-500 dark:text-blue-400">⚡</span>
                        <span className="text-neutral-600 dark:text-neutral-400">+{achievement.reward_xp} XP</span>
                      </div>
                    )}
                    {achievement.reward_gold > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 dark:text-amber-400">💰</span>
                        <span className="text-neutral-600 dark:text-neutral-400">+{achievement.reward_gold}</span>
                      </div>
                    )}
                    {isUnlocked && userAch?.unlocked_at && (
                      <div className="ml-auto text-neutral-500 text-[10px]">
                        {new Date(userAch.unlocked_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  )
}

