'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { ItemPlaceholderSmall } from '@/components/placeholders'
import { CreateGoalDialog } from '@/components/goals/create-goal-dialog'
import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

interface Milestone {
  name: string
  value: number
  completed: boolean
}

interface Goal {
  id: string
  title: string
  description: string
  goal_type: 'campaign' | 'habit_tracker' | 'milestone'
  current_progress: number
  target_progress: number
  status: 'active' | 'completed' | 'abandoned' | 'paused'
  milestone_checkpoints?: Milestone[]
  habit_start_date?: string
  completion_xp: number
  completion_gold: number
  created_at: string
  target_date?: string
}

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userData, setUserData] = useState({
    username: '',
    title: 'Novice Adventurer',
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
    loadGoals()
    loadUserData()
  }, [user])

  useEffect(() => {
    if (!user) setProfileLoaded(true)
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('username, title, level, current_xp, total_xp, gold, current_streak, avatar_id')
      .eq('id', user.id)
      .single()
    
    if (data) {
      const xpForNextLevel = (data.level || 1) * 100
      setUserData({
        username: data.username || user.email?.split('@')[0] || 'Hero',
        title: data.title || 'Novice Adventurer',
        level: data.level || 1,
        currentXp: data.current_xp || 0,
        xpForNextLevel,
        currentStreak: data.current_streak || 0,
        totalPoints: data.total_xp || 0,
        rank: 'Unranked',
        avatarId: data.avatar_id || undefined,
      })
      setProfileLoaded(true)
    } else {
      setProfileLoaded(true)
    }
  }

  const loadGoals = async () => {
    if (!user) return
    
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) {
      setGoals(data)
    }
    setIsLoading(false)
  }

  const calculateTimeRemaining = (habitStartDate: string) => {
    const start = new Date(habitStartDate)
    const now = new Date()
    
    const days = differenceInDays(now, start)
    const hours = differenceInHours(now, start) % 24
    const minutes = differenceInMinutes(now, start) % 60
    
    return { days, hours, minutes }
  }

  const renderGoalCard = (goal: Goal) => {
    const progressPercentage = goal.target_progress 
      ? Math.min((goal.current_progress / goal.target_progress) * 100, 100)
      : 0

    const isCompleted = goal.status === 'completed'
    const isHabitTracker = goal.goal_type === 'habit_tracker'

    return (
      <Card 
        key={goal.id} 
        className={`p-4 md:p-6 bg-neutral-900 border-neutral-800 ${isCompleted ? 'opacity-75' : ''}`}
      >
        {/* Goal Header */}
        <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-0.5 md:mb-1 truncate">{goal.title}</h3>
            {goal.description && (
              <p className="text-neutral-400 text-xs md:text-sm line-clamp-2">{goal.description}</p>
            )}
          </div>
          <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium shrink-0 ${
            isCompleted ? 'bg-green-900/20 text-green-500' :
            goal.status === 'paused' ? 'bg-neutral-800 text-neutral-400' :
            'bg-blue-900/20 text-blue-500'
          }`}>
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </div>
        </div>

        {/* Habit Tracker Timer */}
        {isHabitTracker && goal.habit_start_date && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="text-center">
              {(() => {
                const time = calculateTimeRemaining(goal.habit_start_date)
                return (
                  <>
                    <div className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                      {time.days} <span className="text-sm md:text-lg text-neutral-400">days</span>{' '}
                      {time.hours} <span className="text-sm md:text-lg text-neutral-400">hrs</span>{' '}
                      {time.minutes} <span className="text-sm md:text-lg text-neutral-400">min</span>
                    </div>
                    <div className="text-neutral-500 text-xs md:text-sm">Time since start</div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Progress Visualization */}
        <div className="mb-4 md:mb-6">
          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <span className="text-neutral-400 text-xs md:text-sm">Progress</span>
            <span className="text-neutral-400 text-xs md:text-sm">
              {goal.current_progress} / {goal.target_progress}
            </span>
          </div>
          <div className="h-2 md:h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(59, 130, 246))',
                width: `${progressPercentage}%`
              }}
            />
          </div>
        </div>

        {/* Milestone Checkpoints */}
        {goal.milestone_checkpoints && goal.milestone_checkpoints.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h4 className="text-neutral-400 text-xs md:text-sm font-medium mb-2 md:mb-3">Milestones</h4>
            <div className="space-y-1.5 md:space-y-2">
              {goal.milestone_checkpoints.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 md:p-3 rounded-lg border ${
                    milestone.completed 
                      ? 'bg-green-900/10 border-green-900/30' 
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      milestone.completed 
                        ? 'bg-green-600 text-white' 
                        : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {milestone.completed ? '✓' : index + 1}
                    </div>
                    <span className={milestone.completed ? 'text-green-400' : 'text-white'}>
                      {milestone.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ItemPlaceholderSmall />
                    <span className="text-neutral-400 text-sm">Day {milestone.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 md:pt-4 border-t border-neutral-800 gap-2 sm:gap-0">
          <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
            {goal.completion_xp > 0 && (
              <span className="text-blue-400">+{goal.completion_xp} XP</span>
            )}
            {goal.completion_gold > 0 && (
              <span className="text-amber-400">+{goal.completion_gold} Gold</span>
            )}
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {!isCompleted && (
              <>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="text-xs h-7 md:h-8 px-2 md:px-3"
                  onClick={() => updateGoalProgress(goal.id, goal.current_progress + 1)}
                >
                  +1
                </Button>
                {goal.status === 'active' ? (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="text-xs h-7 md:h-8 px-2 md:px-3"
                    onClick={() => pauseGoal(goal.id)}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="text-xs h-7 md:h-8 px-2 md:px-3"
                    onClick={() => resumeGoal(goal.id)}
                  >
                    Resume
                  </Button>
                )}
                <Button 
                  variant="primary" 
                  size="sm"
                  className="text-xs h-7 md:h-8 px-2 md:px-3"
                  onClick={() => completeGoal(goal.id)}
                >
                  Complete
                </Button>
              </>
            )}
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => deleteGoal(goal.id)}
              className="text-xs h-7 md:h-8 px-2 md:px-3 text-red-400 hover:text-red-300"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    const supabase = createClient()
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    // Check if goal is completed
    const isCompleted = newProgress >= goal.target_progress
    
    const updateData: any = { 
      current_progress: newProgress,
      updated_at: new Date().toISOString()
    }

    if (isCompleted && goal.status !== 'completed') {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
      
      // Award completion rewards
      const { data: userData } = await supabase
        .from('users')
        .select('current_xp, total_xp, gold, level')
        .eq('id', user?.id)
        .single()
      
      if (userData) {
        const newXp = userData.current_xp + goal.completion_xp
        const newTotalXp = userData.total_xp + goal.completion_xp
        const newGold = userData.gold + goal.completion_gold
        
        await supabase
          .from('users')
          .update({
            current_xp: newXp,
            total_xp: newTotalXp,
            gold: newGold
          })
          .eq('id', user?.id)
      }
    }

    // Update milestone checkpoints if applicable
    if (goal.milestone_checkpoints) {
      const updatedMilestones = goal.milestone_checkpoints.map(m => ({
        ...m,
        completed: newProgress >= m.value
      }))
      updateData.milestone_checkpoints = updatedMilestones
    }

    const { error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
    
    if (!error) {
      loadGoals()
      loadUserData()
    }
  }

  const completeGoal = async (goalId: string) => {
    const supabase = createClient()
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    // Award completion rewards
    const { data: userData } = await supabase
      .from('users')
      .select('current_xp, total_xp, gold')
      .eq('id', user?.id)
      .single()
    
    if (userData) {
      const newXp = userData.current_xp + goal.completion_xp
      const newTotalXp = userData.total_xp + goal.completion_xp
      const newGold = userData.gold + goal.completion_gold
      
      await supabase
        .from('users')
        .update({
          current_xp: newXp,
          total_xp: newTotalXp,
          gold: newGold
        })
        .eq('id', user?.id)
    }

    const { error } = await supabase
      .from('goals')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        current_progress: goal.target_progress
      })
      .eq('id', goalId)
    
    if (!error) {
      loadGoals()
      loadUserData()
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
    
    if (!error) {
      loadGoals()
    }
  }

  const pauseGoal = async (goalId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('goals')
      .update({ status: 'paused' })
      .eq('id', goalId)
    
    if (!error) {
      loadGoals()
    }
  }

  const resumeGoal = async (goalId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('goals')
      .update({ status: 'active' })
      .eq('id', goalId)
    
    if (!error) {
      loadGoals()
    }
  }

  if (isLoading) {
    return (
      <ThreeColumnLayout
        leftSidebar={<LeftSidebar user={userData} loading={!profileLoaded} />}
        rightSidebar={<RightSidebar />}
      >
        <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-white text-lg">Loading goals...</div>
        </div>
      </ThreeColumnLayout>
    )
  }

  return (
    <div>
      <CreateGoalDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={loadGoals}
      />
      
      <ThreeColumnLayout
        leftSidebar={<LeftSidebar user={userData} loading={!profileLoaded} />}
        rightSidebar={<RightSidebar />}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-white">Goals & Campaigns</h1>
            <Button variant="primary" size="sm" onClick={() => setIsCreateDialogOpen(true)}>+ New Goal</Button>
          </div>

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid gap-6">
            {goals.map(goal => renderGoalCard(goal))}
          </div>
        ) : (
          <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">No active campaigns</h3>
            <p className="text-neutral-400 mb-6">Set long-term goals and track your progress</p>
            <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>Create Your First Goal</Button>
          </Card>
        )}
        </div>
      </ThreeColumnLayout>
    </div>
  )
}
