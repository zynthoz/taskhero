'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import { CreateTaskForm } from '@/components/tasks/create-task-form'
import { TaskCard } from '@/components/tasks/task-card'
import { LevelUpModal } from '@/components/gamification/level-up-modal'
import { RewardToast } from '@/components/gamification/reward-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { createTask, getTasks, completeTask, deleteTask, updateOverdueTasks } from './actions'
import { Task, TaskPriority, TaskCategory, CreateTaskInput } from '@/types/task'
import { useLevelUp } from '@/hooks/use-level-up'
import { createClient } from '@/lib/supabase/client'
import { getStreakMultiplier } from '@/lib/streak-utils'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<TaskCategory | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [userLevel, setUserLevel] = useState<number>(1)
  const { isLevelUpModalOpen, levelUpData, checkForLevelUp, closeLevelUpModal } = useLevelUp()
  const [showRewardToast, setShowRewardToast] = useState(false)
  const [rewardData, setRewardData] = useState({ xp: 0, gold: 0, streakMultiplier: 1.0 })
  const [currentStreak, setCurrentStreak] = useState(0)

  // Mock user data - replace with real data from your auth system
  const mockUserData = {
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: userLevel,
    currentXp: 0,
    xpForNextLevel: 100,
    currentStreak: currentStreak,
    totalPoints: 0,
    rank: 'Unranked',
  }

  useEffect(() => {
    loadTasks()
    loadUserData()
    // Update overdue tasks on mount
    updateOverdueTasks()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select('level, current_streak')
        .eq('id', authUser.id)
        .single()
      
      if (userData) {
        setUserLevel(userData.level)
        setCurrentStreak(userData.current_streak || 0)
      }
    }
  }

  const loadTasks = async () => {
    setIsLoading(true)
    const result = await getTasks()
    
    if (result.success && result.data) {
      setTasks(result.data)
    } else {
      console.error('Failed to load tasks:', result.error)
    }
    
    setIsLoading(false)
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    console.log('handleCreateTask called with:', input)
    const result = await createTask(input)
    console.log('createTask result:', result)
    
    if (result.success && result.data) {
      setTasks([result.data, ...tasks])
      console.log('Quest accepted:', result.data.title)
    } else {
      console.error('Task creation failed:', result.error)
      throw new Error(result.error || 'Failed to create task')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    const oldLevel = userLevel
    const result = await completeTask(taskId)
    
    if (result.success && result.data) {
      setTasks(tasks.map(t => 
        t.id === taskId ? result.data!.task : t
      ))
      
      // Calculate and show reward toast with streak multiplier
      const streakMultiplier = getStreakMultiplier(currentStreak)
      setRewardData({ 
        xp: result.data.xpGained, 
        gold: result.data.goldGained,
        streakMultiplier
      })
      setShowRewardToast(true)
      
      // Fetch updated user data to check for level up
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('level, current_streak')
          .eq('id', authUser.id)
          .single()
        
        if (userData) {
          if (userData.level > oldLevel) {
            setUserLevel(userData.level)
            checkForLevelUp(oldLevel, userData.level)
          }
          setCurrentStreak(userData.current_streak || 0)
        }
      }
      
      console.log('Quest completed! XP:', result.data.xpGained, 'Gold:', result.data.goldGained)
    } else {
      console.error('Failed to complete task:', result.error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTask(taskId)
    
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== taskId))
      console.log('Quest deleted')
    } else {
      console.error('Failed to delete task:', result.error)
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter - search in title, description, and category
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(query)
      const matchesDescription = task.description?.toLowerCase().includes(query) || false
      const matchesCategory = task.category.toLowerCase().includes(query)
      
      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false
      }
    }
    
    // Category/Type filter
    if (filterType !== 'all' && task.category !== filterType) {
      return false
    }
    
    // Category filter (keeping for backward compatibility, though filterType handles this)
    if (filterCategory !== 'all' && task.category !== filterCategory) {
      return false
    }
    
    // Status filter
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false
    }
    
    return true
  })

  // Separate tasks by priority (excluding subtasks from main view)
  const parentTasks = filteredTasks.filter(t => !t.parent_task_id)
  const mainQuests = parentTasks.filter(t => t.category === 'main' && t.status !== 'completed')
  const sideQuests = parentTasks.filter(t => t.category === 'side' && t.status !== 'completed')
  const dailyTasks = parentTasks.filter(t => t.category === 'daily' && t.status !== 'completed')
  const completedTasks = parentTasks.filter(t => t.status === 'completed')

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={mockUserData} />}
      rightSidebar={<RightSidebar />}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Tasks</h1>
            <p className="text-sm text-neutral-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <button 
            onClick={() => setIsCreateFormOpen(true)}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4 bg-neutral-900 border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500"
          />
          
          <Select value={filterType} onValueChange={(v) => setFilterType(v as TaskCategory | 'all')}>
            <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="main">Main Quest</SelectItem>
              <SelectItem value="side">Side Quest</SelectItem>
              <SelectItem value="daily">Daily Task</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
            <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-neutral-900 border-neutral-800 text-center">
          <div className="text-2xl font-semibold text-white mb-1">{mainQuests.length}</div>
          <div className="text-xs text-neutral-400">Main Quests</div>
        </Card>
        <Card className="p-4 bg-neutral-900 border-neutral-800 text-center">
          <div className="text-2xl font-semibold text-white mb-1">{sideQuests.length}</div>
          <div className="text-xs text-neutral-400">Side Quests</div>
        </Card>
        <Card className="p-4 bg-neutral-900 border-neutral-800 text-center">
          <div className="text-2xl font-semibold text-white mb-1">{dailyTasks.length}</div>
          <div className="text-xs text-neutral-400">Daily Tasks</div>
        </Card>
        <Card className="p-4 bg-neutral-900 border-neutral-800 text-center">
          <div className="text-2xl font-semibold text-white mb-1">{completedTasks.length}</div>
          <div className="text-xs text-neutral-400">Completed</div>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-neutral-400">Loading tasks...</div>
        </div>
      ) : (
        <>
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Main Quests Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-lg">🔥</span>
                <h2 className="text-sm font-semibold text-white">Main Quests ({mainQuests.length})</h2>
              </div>
              <div className="space-y-2">
                {mainQuests.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    No main quests
                  </div>
                ) : (
                  mainQuests.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Side Quests Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-lg">✨</span>
                <h2 className="text-sm font-semibold text-white">Side Quests ({sideQuests.length})</h2>
              </div>
              <div className="space-y-2">
                {sideQuests.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    No side quests
                  </div>
                ) : (
                  sideQuests.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Daily Tasks Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-lg">⏰</span>
                <h2 className="text-sm font-semibold text-white">Daily Tasks ({dailyTasks.length})</h2>
              </div>
              <div className="space-y-2">
                {dailyTasks.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    No daily tasks
                  </div>
                ) : (
                  dailyTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-lg">✓</span>
                <h2 className="text-sm font-semibold text-white">Completed ({completedTasks.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTasks.length === 0 && !isLoading && (
            <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Tasks Found</h3>
                <p className="text-neutral-400 mb-6">
                  {searchQuery || filterType !== 'all' || filterCategory !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start your adventure by creating your first task!'}
                </p>
                {!searchQuery && filterType === 'all' && filterCategory === 'all' && (
                  <button 
                    onClick={() => setIsCreateFormOpen(true)}
                    className="px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    + Create Your First Task
                  </button>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Create Task Form Dialog */}
      <CreateTaskForm 
        onSubmit={handleCreateTask}
        isOpen={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
      />

      {/* Level Up Modal */}
      <LevelUpModal 
        isOpen={isLevelUpModalOpen}
        onClose={closeLevelUpModal}
        newLevel={levelUpData?.newLevel || 1}
        rewards={levelUpData?.rewards}
      />

      {/* Reward Toast */}
      <RewardToast 
        xp={rewardData.xp}
        gold={rewardData.gold}
        streakMultiplier={rewardData.streakMultiplier}
        show={showRewardToast}
        onClose={() => setShowRewardToast(false)}
      />
    </ThreeColumnLayout>
  )
}
