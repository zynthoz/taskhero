'use client'

import { useMemo, useState } from 'react'
import { Task, getTaskColor } from '@/types/task'
import { CalendarTaskItem } from './calendar-task-item'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MonthViewProps {
  currentDate: Date
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

interface DayCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  tasks: Task[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthDays(year: number, month: number): DayCell[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // Get the start of the calendar (might be previous month)
  const startDay = new Date(firstDayOfMonth)
  startDay.setDate(startDay.getDate() - startDay.getDay())
  
  // Get the end of the calendar (might be next month)
  const endDay = new Date(lastDayOfMonth)
  const daysToAdd = 6 - endDay.getDay()
  endDay.setDate(endDay.getDate() + daysToAdd)
  
  const days: DayCell[] = []
  const current = new Date(startDay)
  
  while (current <= endDay) {
    const dayOfWeek = current.getDay()
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.getTime() === today.getTime(),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      tasks: [],
    })
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function getTasksForDay(tasks: Task[], date: Date): Task[] {
  const dateStr = date.toISOString().split('T')[0]
  
  return tasks.filter(task => {
    if (!task.due_date) return false
    const taskDate = new Date(task.due_date).toISOString().split('T')[0]
    return taskDate === dateStr
  })
}

export function MonthView({ 
  currentDate, 
  tasks, 
  onTaskClick,
}: MonthViewProps) {
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: Date; tasks: Task[] } | null>(null)

  const days = useMemo(() => {
    const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())
    
    // Attach tasks to each day
    return monthDays.map(day => ({
      ...day,
      tasks: getTasksForDay(tasks, day.date),
    }))
  }, [currentDate, tasks])

  const handleShowAllTasks = (date: Date, dayTasks: Task[]) => {
    setSelectedDayTasks({ date, tasks: dayTasks })
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-700">
          {WEEKDAYS.map((day, index) => (
            <div 
              key={day}
              className={cn(
                'py-1 md:py-2 text-center text-[10px] md:text-xs font-medium uppercase tracking-wide',
                index === 0 || index === 6 
                  ? 'text-neutral-400 dark:text-neutral-500' 
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={cn(
          'flex-1 grid grid-cols-7 auto-rows-fr',
          'border-l border-t border-neutral-200 dark:border-neutral-700'
        )}>
          {days.map((day, index) => {
            const hasMoreTasks = day.tasks.length > 2
            const displayTasks = day.tasks.slice(0, 2)
            const remainingCount = day.tasks.length - 2

            return (
              <div
                key={index}
                className={cn(
                  'relative p-0.5 md:p-1 border-r border-b border-neutral-200 dark:border-neutral-700',
                  'transition-colors min-h-[60px] md:min-h-[80px]',
                  !day.isCurrentMonth && 'bg-neutral-50 dark:bg-neutral-900/50',
                  day.isWeekend && day.isCurrentMonth && 'bg-neutral-50/50 dark:bg-neutral-800/30',
                )}
              >
                {/* Date number */}
                <div className="flex items-start justify-between mb-0.5">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 text-[10px] md:text-xs rounded-full',
                      day.isToday && 'bg-[var(--accent-color)] text-white font-semibold',
                      !day.isToday && day.isCurrentMonth && 'text-neutral-700 dark:text-neutral-300',
                      !day.isToday && !day.isCurrentMonth && 'text-neutral-400 dark:text-neutral-500'
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Tasks - minimalist style */}
                <div className="space-y-0.5 overflow-hidden">
                  {displayTasks.map((task) => {
                    const color = getTaskColor(task.color)
                    const isCompleted = task.status === 'completed'
                    
                    return (
                      <button
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskClick?.(task)
                        }}
                        className={cn(
                          'w-full text-left px-0.5 md:px-1 py-0.5 rounded text-[8px] md:text-[10px] truncate transition-all',
                          'hover:ring-1 hover:ring-[var(--accent-color)]/50',
                          isCompleted && 'opacity-50 line-through'
                        )}
                        style={{ 
                          backgroundColor: `${color.hex}20`,
                          borderLeft: `2px solid ${color.hex}`,
                        }}
                        title={task.title}
                      >
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                          {task.title}
                        </span>
                      </button>
                    )
                  })}
                  
                  {hasMoreTasks && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowAllTasks(day.date, day.tasks)
                      }}
                      className={cn(
                        'w-full text-[8px] md:text-[10px] text-center py-0.5 rounded',
                        'text-neutral-500 dark:text-neutral-400 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10'
                      )}
                    >
                      +{remainingCount} more
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All Tasks Modal */}
      <Dialog open={!!selectedDayTasks} onOpenChange={() => setSelectedDayTasks(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white">
              Tasks for {selectedDayTasks?.date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {selectedDayTasks?.tasks.map((task) => {
              const color = getTaskColor(task.color)
              const isCompleted = task.status === 'completed'
              const isOverdue = task.status === 'overdue'
              
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedDayTasks(null)
                    onTaskClick?.(task)
                  }}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    'hover:shadow-md hover:scale-[1.02]',
                    'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
                    isCompleted && 'opacity-60'
                  )}
                  style={{ borderLeftColor: color.hex, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start gap-2">
                    <span 
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        'font-medium text-sm text-neutral-900 dark:text-white truncate',
                        isCompleted && 'line-through'
                      )}>
                        {task.title}
                      </h4>
                      {task.due_date && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {new Date(task.due_date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {isOverdue && !isCompleted && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                            Overdue
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                            Completed
                          </span>
                        )}
                        {task.is_recurring && (
                          <span className="text-[10px] text-neutral-400">🔄</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
