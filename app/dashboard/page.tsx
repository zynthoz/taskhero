'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import Link from 'next/link'
import { getTasks } from '../tasks/actions'
import { Task } from '@/types/task'
import { createClient } from '@/lib/supabase/client'
import { StreakDisplay } from '@/components/streaks/streak-display'
import { StreakCalendar } from '@/components/streaks/streak-calendar'
import { TodayProgressChart } from '@/components/tasks/today-progress-chart'
import { StreakProtectionIndicator } from '@/components/streaks/streak-protection-indicator'
import { UsernameModal } from '@/components/social/username-modal'
import { MotivationalQuote } from '@/components/dashboard/motivational-quote'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [userData, setUserData] = useState({
    level: 1,
    currentXp: 0,
    totalXp: 0,
    gold: 0,
    currentStreak: 0,
    longestStreak: 0,
    userId: '',
    username: '',
    avatarId: undefined as string | undefined,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    loadTasks()
    loadUserData()

    // Listen for task updates from other pages (create/complete/delete)
    try {
      const bc = new BroadcastChannel('tasks')
      bc.onmessage = (e) => {
        if (e.data?.type === 'update') {
          loadTasks()
        }
      }
      return () => bc.close()
    } catch (err) {
      // BroadcastChannel might not be available in all environments
      return
    }
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('level, current_xp, total_xp, gold, current_streak, longest_streak, username, avatar_id')
        .eq('id', authUser.id)
        .single()
      
      if (data) {
        setUserData({
          level: data.level || 1,
          currentXp: data.current_xp || 0,
          totalXp: data.total_xp || 0,
          gold: data.gold || 0,
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          userId: authUser.id,
          username: data.username || '',
          avatarId: data.avatar_id || undefined,
        })
        setProfileLoaded(true)
        
        // Show username modal if user doesn't have a username
        if (!data.username) {
          setShowUsernameModal(true)
        }
      } else {
        setProfileLoaded(true)
      }
    }
  }

  const handleUsernameSuccess = async (username: string) => {
    setShowUsernameModal(false)
    setUserData(prev => ({ ...prev, username }))
  }

  const loadTasks = async () => {
    setIsLoading(true)
    const result = await getTasks()
    if (result.success && result.data) {
      setTasks(result.data)
    }
    setIsLoading(false)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0a0a0a]">
        <div className="text-neutral-900 dark:text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Today's Progress — shows ALL active (non-completed) tasks as workable today
  // Completed today = tasks completed today (by completed_at timestamp)
  // In Progress = tasks with 'in-progress' status
  // Pending = tasks with 'pending' status (shown as remaining work)
  // Overdue = tasks past their due date
  
  const todayDate = new Date()
  const isSameLocalDate = (dateStr?: string | null) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return (
      d.getFullYear() === todayDate.getFullYear() &&
      d.getMonth() === todayDate.getMonth() &&
      d.getDate() === todayDate.getDate()
    )
  }

  // All non-completed tasks are "today's tasks" (available to work on)
  // Plus tasks that were completed today
  const todayTasks = tasks.filter(t => {
    // Include all incomplete tasks (pending, in-progress, overdue)
    if (t.status !== 'completed') return true
    
    // Include tasks completed today
    if (t.status === 'completed' && isSameLocalDate(t.completed_at)) return true
    
    return false
  })

  // Count tasks completed TODAY (not all-time completed)
  const todayCompleted = tasks.filter(t => t.status === 'completed' && isSameLocalDate(t.completed_at)).length
  const todayInProgress = tasks.filter(t => t.status === 'in-progress').length
  const todayOverdue = tasks.filter(t => t.status === 'overdue').length
  const todayPending = tasks.filter(t => t.status === 'pending').length
  
  // Total for the radial chart = all incomplete + completed today
  const todayTotal = todayPending + todayInProgress + todayOverdue + todayCompleted
  
  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5)
  
  // Calculate total XP and Gold earned
  const totalXpEarned = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.xp_reward, 0)
  const totalGoldEarned = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.gold_reward, 0)

  // User data for sidebar
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

  return (
    <>
      <UsernameModal 
        isOpen={showUsernameModal} 
        onSuccess={handleUsernameSuccess}
      />
      
      <ThreeColumnLayout
        leftSidebar={<LeftSidebar user={sidebarUserData} loading={!profileLoaded} />}
        rightSidebar={<RightSidebar />}
      >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Motivational Quote */}
      <div className="mb-6">
        <MotivationalQuote />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 stat-card card-purple-tint">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Total Tasks</div>
          <div className="text-3xl font-bold text-neutral-900 dark:text-white">{totalTasks}</div>
          <div className="absolute top-2 right-2 text-2xl opacity-100">📋</div>
        </Card>
        
        <Card className="p-4 stat-card card-green-tint">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Completed</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
          <div className="absolute top-2 right-2 text-2xl opacity-100">✅</div>
        </Card>
        
        <Card className="p-4 stat-card" style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.03) 100%)',
          borderColor: 'rgba(249, 115, 22, 0.2)'
        }}>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Current Streak</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userData.currentStreak} 🔥</div>
          <div className="absolute top-2 right-2 text-2xl opacity-100">📈</div>
        </Card>
        
        <Card className="p-4 stat-card card-purple-tint">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Level</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Lv {userData.level}</div>
          <div className="absolute top-2 right-2 text-2xl opacity-100">⭐</div>
        </Card>
      </div>

      {/* Streak Protection Indicator */}
      {userData.userId && (
        <div className="mb-6">
          <StreakProtectionIndicator userId={userData.userId} />
        </div>
      )}

      {/* Progress & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Progress Chart */}
        <TodayProgressChart
          completed={todayCompleted}
          inProgress={todayInProgress}
          overdue={todayOverdue}
          pending={todayPending}
        />

        {/* Streak Display */}
        {userData.userId && (
          <StreakDisplay
            currentStreak={userData.currentStreak}
            longestStreak={userData.longestStreak}
          />
        )}
      </div>

      {/* Streak Calendar & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Streak Calendar */}
        {userData.userId && (
          <StreakCalendar userId={userData.userId} />
        )}

        {/* Recent Tasks */}
        <Card className="p-3 w-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-neutral-900 dark:text-white">Recent Tasks</h3>
            <Link href="/tasks">
              <button className="text-[9px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                View all →
              </button>
            </Link>
          </div>
          
          {recentTasks.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-1">📋</div>
              <p className="text-[10px] text-neutral-500 mb-2">No tasks yet</p>
              <Link href="/tasks">
                <button className="px-3 py-1.5 bg-white text-black text-[10px] font-medium rounded hover:bg-neutral-200 transition-colors">
                  + Create Task
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-2 rounded border ${
                    task.status === 'completed' 
                      ? 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800' 
                      : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {task.status === 'completed' ? (
                      <span className="text-neutral-900 dark:text-white text-[10px]">✓</span>
                    ) : (
                      <span className="w-3 h-3 border border-neutral-400 dark:border-neutral-600 rounded-sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-medium truncate ${
                        task.status === 'completed' ? 'text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'
                      }`}>
                        {task.title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[9px] text-neutral-500">
                    <span>💰{task.gold_reward}</span>
                    <span>⭐{task.xp_reward}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Overdue Warning */}
      {overdueTasks > 0 && (
        <Card className="p-4 bg-red-950/20 border-red-900/50 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="text-sm font-semibold text-red-400">
                {overdueTasks} {overdueTasks === 1 ? 'task is' : 'tasks are'} overdue
              </div>
              <div className="text-xs text-red-300">Review and update your overdue tasks</div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/tasks">
            <button className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">📝</div>
              <div className="text-xs font-medium text-neutral-900 dark:text-white">Create Task</div>
            </button>
          </Link>
          
          <Link href="/goals">
            <button className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">🎯</div>
              <div className="text-xs font-medium text-neutral-900 dark:text-white">Set Goal</div>
            </button>
          </Link>
          
          <Link href="/shop">
            <button className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">🏪</div>
              <div className="text-xs font-medium text-neutral-900 dark:text-white">Visit Shop</div>
            </button>
          </Link>
          
          <Link href="/achievements">
            <button className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">🏆</div>
              <div className="text-xs font-medium text-neutral-900 dark:text-white">Achievements</div>
            </button>
          </Link>
        </div>
      </Card>
      </ThreeColumnLayout>
    </>
  )
}
