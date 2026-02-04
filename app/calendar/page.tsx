'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import { CalendarHeader } from '@/components/calendar/calendar-header'
import { MonthView } from '@/components/calendar/month-view'
import { TaskDetailModal } from '@/components/calendar/task-detail-modal'
import { Task } from '@/types/task'
import { getCalendarTasks } from './actions'
import { getDateRangeForView } from '@/lib/calendar-utils'
import { completeTask, deleteTask } from '@/app/tasks/actions'
import { createClient } from '@/lib/supabase/client'

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  
  // User data for sidebar
  const [userData, setUserData] = useState({
    username: 'Hero',
    title: 'Novice Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: undefined as number | undefined,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
    avatarId: undefined as string | undefined,
    gold: 0,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  
  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setUserData({
          username: data.username || 'Hero',
          title: data.title || 'Novice Adventurer',
          level: data.level || 1,
          currentXp: data.current_xp || 0,
          xpForNextLevel: data.xp_for_next_level || (data.level || 1) * 100,
          currentStreak: data.current_streak || 0,
          totalPoints: data.current_points || 0,
          rank: 'Unranked',
          avatarId: data.avatar_id,
          gold: data.gold || 0,
        })
        setProfileLoaded(true)
      } else {
        setProfileLoaded(true)
      }
    }
    
    fetchUserData()
  }, [user])
  
  // Fetch tasks for the current month
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const { startDate, endDate } = getDateRangeForView(currentDate, 'month')
      const result = await getCalendarTasks({ startDate, endDate })
      
      if (result.success && result.data) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch calendar tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentDate])
  
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])
  
  // Navigation handlers
  const handlePrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }
  
  const handleNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }
  
  const handleToday = () => {
    setCurrentDate(new Date())
  }
  
  // Task interaction handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }
  
  const handleTaskComplete = async (taskId: string) => {
    const result = await completeTask(taskId)
    if (result.success) {
      fetchTasks()
    }
  }
  
  const handleTaskDelete = async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result.success) {
      fetchTasks()
    }
  }

  // Render the calendar
  const renderCalendar = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading tasks...
            </p>
          </div>
        </div>
      )
    }
    
    return (
      <MonthView
        currentDate={currentDate}
        tasks={tasks}
        onTaskClick={handleTaskClick}
      />
    )
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={userData} loading={!profileLoaded} />}
      rightSidebar={null}
      expandedMain={true}
    >
      <div className="h-[calc(100vh-theme(spacing.4)-theme(spacing.8))] flex flex-col bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          onPreviousPeriod={handlePrevious}
          onNextPeriod={handleNext}
          onToday={handleToday}
        />
        
        <div className="flex-1 overflow-hidden">
          {renderCalendar()}
        </div>
      </div>
      
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setSelectedTask(null)
        }}
        onComplete={handleTaskComplete}
        onDelete={handleTaskDelete}
      />
    </ThreeColumnLayout>
  )
}
