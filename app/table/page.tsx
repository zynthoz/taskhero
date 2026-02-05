'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { TasksDataTable } from '@/components/table/tasks-data-table'
import { getTasks } from '@/app/tasks/actions'
import { Task } from '@/types/task'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'

export default function TableViewPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
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
          currentXp: data.xp || 0,
          xpForNextLevel: data.xp_for_next_level,
          currentStreak: data.current_streak || 0,
          totalPoints: data.total_points || 0,
          rank: data.rank || 'Unranked',
          avatarId: data.avatar_id,
          gold: data.gold || 0,
        })
      }
      setProfileLoaded(true)
    }
    
    fetchUserData()
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [user])

  const loadTasks = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const result = await getTasks()
      if (result.success && result.data) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskUpdate = () => {
    loadTasks()
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={userData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
      expandedMain={false}
    >
      <div className="h-[calc(90dvh-2rem)] flex flex-col overflow-hidden">
        <TasksDataTable 
          tasks={tasks} 
          isLoading={isLoading}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </ThreeColumnLayout>
  )
}
