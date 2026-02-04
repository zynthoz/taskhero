'use client'

import { useMemo, useState } from 'react'
import { Task } from '@/types/task'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  currentDate: Date
  onDateSelect?: (date: Date) => void
  tasks?: Task[]
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getMonthDays(year: number, month: number) {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const startDay = new Date(firstDayOfMonth)
  startDay.setDate(startDay.getDate() - startDay.getDay())
  
  const endDay = new Date(lastDayOfMonth)
  endDay.setDate(endDay.getDate() + (6 - endDay.getDay()))
  
  const days: Date[] = []
  const current = new Date(startDay)
  
  while (current <= endDay) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

export function MiniCalendar({ 
  currentDate, 
  onDateSelect,
  tasks = [],
}: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(new Date(currentDate))
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentDateMidnight = new Date(currentDate)
  currentDateMidnight.setHours(0, 0, 0, 0)
  
  const days = useMemo(() => 
    getMonthDays(displayMonth.getFullYear(), displayMonth.getMonth()),
    [displayMonth]
  )
  
  // Create a set of dates that have tasks
  const datesWithTasks = useMemo(() => {
    const dateSet = new Set<string>()
    tasks.forEach(task => {
      if (task.due_date) {
        dateSet.add(new Date(task.due_date).toISOString().split('T')[0])
      }
    })
    return dateSet
  }, [tasks])
  
  const handlePrevMonth = () => {
    setDisplayMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }
  
  const handleNextMonth = () => {
    setDisplayMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }
  
  const formatMonthYear = () => {
    return displayMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 dark:text-neutral-400">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        
        <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
          {formatMonthYear()}
        </h4>
        
        <button
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 dark:text-neutral-400">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, index) => (
          <div 
            key={index}
            className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === displayMonth.getMonth()
          const dayMidnight = new Date(day)
          dayMidnight.setHours(0, 0, 0, 0)
          const isToday = dayMidnight.getTime() === today.getTime()
          const isSelected = dayMidnight.getTime() === currentDateMidnight.getTime()
          const dateKey = day.toISOString().split('T')[0]
          const hasTask = datesWithTasks.has(dateKey)
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                'relative aspect-square flex flex-col items-center justify-center rounded text-xs transition-colors',
                !isCurrentMonth && 'text-neutral-400 dark:text-neutral-600',
                isCurrentMonth && !isSelected && 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                isToday && !isSelected && 'font-bold text-[var(--accent-color)]',
                isSelected && 'bg-[var(--accent-color)] text-white font-medium'
              )}
            >
              {day.getDate()}
              
              {/* Task indicator dot */}
              {hasTask && (
                <span className={cn(
                  'absolute bottom-0.5 w-1 h-1 rounded-full',
                  isSelected ? 'bg-white' : 'bg-[var(--accent-color)]'
                )} />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Quick navigation */}
      <div className="mt-3 flex items-center justify-center">
        <button
          onClick={() => {
            setDisplayMonth(new Date())
            onDateSelect?.(new Date())
          }}
          className={cn(
            'text-xs px-3 py-1 rounded-full transition-colors',
            'text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10'
          )}
        >
          Today
        </button>
      </div>
    </div>
  )
}
