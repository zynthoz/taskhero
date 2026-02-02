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

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState({
    level: 1,
    currentXp: 0,
    totalXp: 0,
    gold: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    loadTasks()
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('level, current_xp, total_xp, gold, current_streak')
        .eq('id', authUser.id)
        .single()
      
      if (data) {
        setUserData({
          level: data.level || 1,
          currentXp: data.current_xp || 0,
          totalXp: data.total_xp || 0,
          gold: data.gold || 0,
          currentStreak: data.current_streak || 0,
        })
      }
    }
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  const mainQuests = tasks.filter(t => t.category === 'main' && t.status !== 'completed').length
  const sideQuests = tasks.filter(t => t.category === 'side' && t.status !== 'completed').length
  const dailyTasks = tasks.filter(t => t.category === 'daily' && t.status !== 'completed').length
  
  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5)
  
  // Calculate total XP and Gold earned
  const totalXpEarned = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.xp_reward, 0)
  const totalGoldEarned = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.gold_reward, 0)
  
  // Category breakdown
  const categoryStats = {
    main: tasks.filter(t => t.category === 'main' && t.status === 'completed').length,
    side: tasks.filter(t => t.category === 'side' && t.status === 'completed').length,
    daily: tasks.filter(t => t.category === 'daily' && t.status === 'completed').length,
  }

  // Mock user data - you can replace this with real user data from database
  const mockUserData = {
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: userData.level,
    currentXp: userData.currentXp,
    xpForNextLevel: 100,
    currentStreak: userData.currentStreak,
    totalPoints: userData.totalXp,
    rank: 'Unranked',
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={mockUserData} />}
      rightSidebar={<RightSidebar />}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-neutral-900 border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Total Tasks</div>
          <div className="text-2xl font-semibold text-white">{totalTasks}</div>
        </Card>
        
        <Card className="p-4 bg-neutral-900 border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Completed</div>
          <div className="text-2xl font-semibold text-white">{completedTasks}</div>
        </Card>
        
        <Card className="p-4 bg-neutral-900 border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Pending</div>
          <div className="text-2xl font-semibold text-white">{pendingTasks}</div>
        </Card>
        
        <Card className="p-4 bg-neutral-900 border-neutral-800">
          <div className="text-xs text-neutral-400 mb-1">Completion Rate</div>
          <div className="text-2xl font-semibold text-white">{completionRate}%</div>
        </Card>
      </div>

      {/* Progress & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Task Progress */}
        <Card className="p-5 bg-neutral-900 border-neutral-800">
          <h3 className="text-sm font-semibold text-white mb-4">Task Progress</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-2">
                <span>Overall Completion</span>
                <span>{completedTasks}/{totalTasks}</span>
              </div>
              <Progress value={completionRate} className="h-2 bg-neutral-800" />
            </div>
            
            {overdueTasks > 0 && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                <div className="text-xs text-red-400 font-medium">
                  ⚠️ {overdueTasks} overdue {overdueTasks === 1 ? 'task' : 'tasks'}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <div className="text-xl font-semibold text-white">{mainQuests}</div>
                <div className="text-[10px] text-neutral-400">Main Quests</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-white">{sideQuests}</div>
                <div className="text-[10px] text-neutral-400">Side Quests</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-white">{dailyTasks}</div>
                <div className="text-[10px] text-neutral-400">Daily Tasks</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rewards Earned */}
        <Card className="p-5 bg-neutral-900 border-neutral-800">
          <h3 className="text-sm font-semibold text-white mb-4">Rewards Earned</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-sm text-neutral-400">Total XP</span>
              </div>
              <span className="text-xl font-semibold text-white">{totalXpEarned}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="text-sm text-neutral-400">Total Gold</span>
              </div>
              <span className="text-xl font-semibold text-white">{totalGoldEarned}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm text-neutral-400">Current Level</span>
              </div>
              <span className="text-xl font-semibold text-white">Lv {mockUserData.level}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-5 bg-neutral-900 border-neutral-800 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Completed by Category</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="text-center p-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="text-lg font-semibold text-white">{count}</div>
              <div className="text-[10px] text-neutral-400 capitalize">{category}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Tasks */}
      <Card className="p-5 bg-neutral-900 border-neutral-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Tasks</h3>
          <Link href="/tasks">
            <button className="text-xs text-neutral-400 hover:text-white transition-colors">
              View all →
            </button>
          </Link>
        </div>
        
        {recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm text-neutral-400 mb-4">No tasks yet</p>
            <Link href="/tasks">
              <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                + Create Your First Task
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map(task => (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  task.status === 'completed' 
                    ? 'bg-neutral-800/50 border-neutral-800' 
                    : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                } transition-colors`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {task.status === 'completed' ? (
                    <span className="text-white text-sm">✓</span>
                  ) : (
                    <span className="w-4 h-4 border-2 border-neutral-600 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      task.status === 'completed' ? 'text-neutral-500 line-through' : 'text-white'
                    }`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-500 capitalize">{task.category}</span>
                      <span className="text-neutral-700">•</span>
                      <span className="text-[10px] text-neutral-500">Priority {task.priority}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>💰 {task.gold_reward}</span>
                  <span>⭐ {task.xp_reward}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-5 bg-neutral-900 border-neutral-800">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/tasks">
            <button className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">📝</div>
              <div className="text-xs font-medium text-white">Create Task</div>
            </button>
          </Link>
          
          <Link href="/goals">
            <button className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">🎯</div>
              <div className="text-xs font-medium text-white">Set Goal</div>
            </button>
          </Link>
          
          <Link href="/shop">
            <button className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">🏪</div>
              <div className="text-xs font-medium text-white">Visit Shop</div>
            </button>
          </Link>
          
          <Link href="/achievements">
            <button className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors text-left">
              <div className="text-lg mb-1">🏆</div>
              <div className="text-xs font-medium text-white">Achievements</div>
            </button>
          </Link>
        </div>
      </Card>
    </ThreeColumnLayout>
  )
}
