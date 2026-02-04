'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  unlocked_at: string
}

interface UserStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  total_xp: number
  current_xp: number
  level: number
  gold: number
  current_streak: number
  longest_streak: number
  tasks_completed: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const [userData, setUserData] = useState({
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: undefined as number | undefined,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
    avatarId: undefined as string | undefined,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get user data
    const { data: userInfo } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single()

    // Get tasks data
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)

    // Get achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select(`
        unlocked_at,
        achievement:achievements(id, name, description, icon, category)
      `)
      .eq('user_id', user?.id)
      .order('unlocked_at', { ascending: false })

    if (userInfo && tasks) {
      const completedTasks = tasks.filter(t => t.status === 'completed').length
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length
      const overdueTasks = tasks.filter(t => t.status === 'overdue').length

      setStats({
        total_tasks: tasks.length,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        overdue_tasks: overdueTasks,
        total_xp: userInfo.total_xp || 0,
        current_xp: userInfo.current_xp || 0,
        level: userInfo.level || 1,
        gold: userInfo.gold || 0,
        current_streak: userInfo.current_streak || 0,
        longest_streak: userInfo.longest_streak || 0,
        tasks_completed: tasks.filter(t => t.status === 'completed').length,
      })

      setUserData({
        username: userInfo.username || user?.email?.split('@')[0] || 'Hero',
        title: 'Adventurer',
        level: userInfo.level || 1,
        currentXp: userInfo.current_xp || 0,
        xpForNextLevel: (userInfo.level || 1) * 100,
        currentStreak: userInfo.current_streak || 0,
        totalPoints: userInfo.total_xp || 0,
        rank: 'Unranked',
        avatarId: userInfo.avatar_id || undefined,
      })
      setProfileLoaded(true)
    }

    if (userAchievements) {
      const formattedAchievements = userAchievements.map((ua: any) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        unlocked_at: ua.unlocked_at,
      }))
      setAchievements(formattedAchievements)
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0a0a0a]">
        <div className="text-neutral-900 dark:text-white text-lg">Please log in to view profile</div>
      </div>
    )
  }

  const completionRate = stats 
    ? Math.round((stats.completed_tasks / Math.max(stats.total_tasks, 1)) * 100) 
    : 0

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
  ]

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={userData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Profile</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Your adventure statistics and achievements</p>
            </div>
            <Link href="/settings">
              <button className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-sm">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Card className="p-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
          </Card>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                {/* Power Level */}
                <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Hero Power Level</h2>
                    <div className="text-3xl font-bold text-purple-400">
                      {Math.floor(stats.total_xp / 10)}
                    </div>
                  </div>
                  <Progress value={(stats.current_xp / ((stats.level + 1) * 100)) * 100} className="h-2" />
                  <p className="text-xs text-neutral-400 mt-2">
                    Based on your total achievements and progress
                  </p>
                </Card>

                {/* Overall Stats */}
                <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Overall Statistics</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_tasks}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Total Tasks</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed_tasks}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">{stats.current_streak}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.level}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Level</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Completion Rate</span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                </Card>

                {/* Total Completed Card */}
                <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Tasks Completed</h2>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                      {stats.tasks_completed}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Total tasks completed
                    </p>
                  </div>
                </Card>

                {/* Streak Info */}
                <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Streak Progress</h2>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Current Streak</div>
                      <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-1">
                        🔥 {stats.current_streak} days
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">Longest Streak</div>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                        {stats.longest_streak} days
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Rewards */}
                <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Rewards Earned</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⭐</span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Total XP</span>
                      </div>
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_xp.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💰</span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Gold</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{stats.gold.toLocaleString()}</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                {achievements.length === 0 ? (
                  <Card className="p-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No achievements yet</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Complete tasks and reach milestones to unlock achievements
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <Card key={achievement.id} className="p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{achievement.name}</h3>
                              <Badge className="text-xs bg-purple-600/20 text-purple-400 border-purple-600/50">
                                {achievement.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-neutral-400 mb-2">{achievement.description}</p>
                            <p className="text-xs text-neutral-500">
                              Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ThreeColumnLayout>
  )
}
