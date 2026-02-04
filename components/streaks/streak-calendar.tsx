'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns'

interface StreakCalendarProps {
  userId: string
}

interface ActivityData {
  date: string
  taskCount: number
  hasActivity: boolean
}

export function StreakCalendar({ userId }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivityData()
  }, [userId, currentDate])

  const loadActivityData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    // Fetch completed tasks for the month
    const { data: tasks } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', monthStart.toISOString())
      .lte('completed_at', monthEnd.toISOString())
    
    // Group by date
    const activityMap = new Map<string, number>()
    tasks?.forEach(task => {
      if (task.completed_at) {
        const date = task.completed_at.split('T')[0]
        activityMap.set(date, (activityMap.get(date) || 0) + 1)
      }
    })
    
    // Create activity data for all days in month
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const data = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      taskCount: activityMap.get(format(day, 'yyyy-MM-dd')) || 0,
      hasActivity: activityMap.has(format(day, 'yyyy-MM-dd')),
    }))
    
    setActivityData(data)
    setLoading(false)
  }

  const getDayColor = (taskCount: number) => {
    if (taskCount === 0) return 'bg-neutral-200 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800'
    if (taskCount === 1) return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800/50'
    if (taskCount <= 3) return 'bg-green-200 dark:bg-green-800/40 border-green-400 dark:border-green-700/60'
    if (taskCount <= 5) return 'bg-green-300 dark:bg-green-700/50 border-green-500 dark:border-green-600/70'
    return 'bg-green-400 dark:bg-green-600/60 border-green-600 dark:border-green-500/80'
  }

  const monthStart = startOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentDate) })
  
  // Get starting day of week (0 = Sunday, 1 = Monday, etc.)
  const startingDayOfWeek = monthStart.getDay()
  
  // Create empty cells for days before month starts
  const emptyCells = Array(startingDayOfWeek).fill(null)

  const totalTasksThisMonth = activityData.reduce((sum, day) => sum + day.taskCount, 0)
  const activeDays = activityData.filter(day => day.hasActivity).length

  return (
    <Card className="p-3 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-semibold text-neutral-900 dark:text-white">Activity</h3>
          <div className="flex items-center gap-1 text-[9px] text-neutral-500 dark:text-neutral-600">
            <span>{activeDays}d</span>
            <span>•</span>
            <span>{totalTasksThisMonth}t</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="h-5 w-5 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            ←
          </Button>
          <div className="text-[10px] text-neutral-500 min-w-[60px] text-center">
            {format(currentDate, 'MMM yy')}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="h-5 w-5 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            disabled={isSameMonth(currentDate, new Date())}
          >
            →
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-[1px] mb-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[8px] text-neutral-500 dark:text-neutral-700 font-medium h-3 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-[1px]">
          {/* Empty cells before month starts */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="w-full aspect-square" />
          ))}
          
          {/* Actual month days */}
          {monthDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayData = activityData.find(d => d.date === dateStr)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div
                key={index}
                className={`
                  w-full aspect-square rounded-[2px] border
                  ${getDayColor(dayData?.taskCount || 0)}
                  ${isToday ? 'ring-1 ring-blue-500' : ''}
                  transition-all duration-100 hover:brightness-125 hover:z-10
                  group relative cursor-pointer
                `}
                title={`${format(day, 'MMM d')}: ${dayData?.taskCount || 0} tasks`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-[10px] rounded py-1 px-2 whitespace-nowrap z-20 pointer-events-none shadow-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="font-medium">{format(day, 'MMM d, yyyy')}</div>
                  <div className="text-neutral-500 dark:text-neutral-400">{dayData?.taskCount || 0} task{dayData?.taskCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-[8px] text-neutral-500 dark:text-neutral-600 mt-1.5 pt-1.5 border-t border-neutral-200 dark:border-neutral-800/50">
        <span>Less</span>
        <div className="w-2 h-2 rounded-[2px] bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800" />
        <div className="w-2 h-2 rounded-[2px] bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800/50" />
        <div className="w-2 h-2 rounded-[2px] bg-green-200 dark:bg-green-800/40 border border-green-400 dark:border-green-700/60" />
        <div className="w-2 h-2 rounded-[2px] bg-green-300 dark:bg-green-700/50 border border-green-500 dark:border-green-600/70" />
        <div className="w-2 h-2 rounded-[2px] bg-green-400 dark:bg-green-600/60 border border-green-600 dark:border-green-500/80" />
        <span>More</span>
      </div>
    </Card>
  )
}
