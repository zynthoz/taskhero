'use client'

import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface TodayProgressChartProps {
  completed: number
  inProgress: number
  overdue: number
  pending: number
}

export function TodayProgressChart({ completed, inProgress, overdue, pending }: TodayProgressChartProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  // Total = all active tasks (pending, in-progress, overdue) + completed today
  const total = completed + inProgress + overdue + pending
  const completedPercent = total > 0 ? (completed / total) * 100 : 0
  const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0
  const overduePercent = total > 0 ? (overdue / total) * 100 : 0
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(completedPercent)
    }, 100)
    return () => clearTimeout(timer)
  }, [completedPercent])

  // Calculate circle properties
  const size = 160
  const strokeWidth = 16
  const center = size / 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate segment lengths
  const completedLength = (completedPercent / 100) * circumference
  const inProgressLength = (inProgressPercent / 100) * circumference
  const overdueLength = (overduePercent / 100) * circumference
  const pendingLength = (pendingPercent / 100) * circumference

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Today's Progress</h3>
      
      <div className="flex flex-col items-center">
        {/* Circular Chart */}
        <div className="relative mb-6">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              className="stroke-neutral-200 dark:stroke-neutral-800"
              strokeWidth={strokeWidth}
            />
            
            {/* Completed segment (green) */}
            {completed > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${completedLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* In Progress segment (yellow) */}
            {inProgress > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgb(234, 179, 8)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${inProgressLength} ${circumference}`}
                strokeDashoffset={-completedLength}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* Overdue segment (red) */}
            {overdue > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${overdueLength} ${circumference}`}
                strokeDashoffset={-(completedLength + inProgressLength)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* Pending segment (gray) */}
            {pending > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgb(115, 115, 115)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${pendingLength} ${circumference}`}
                strokeDashoffset={-(completedLength + inProgressLength + overdueLength)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-neutral-900 dark:text-white">
              {completed}/{total}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">completed</div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-neutral-100 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Completed</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{completed}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded bg-neutral-100 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">In Progress</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{inProgress}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded bg-neutral-100 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Overdue</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{overdue}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded bg-neutral-100 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-500" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Pending</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{pending}</span>
          </div>
        </div>

        {/* Completion message */}
        {total > 0 && completed === total && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800/50 rounded text-center">
            <div className="text-green-700 dark:text-green-400 font-semibold text-sm">🎉 All tasks complete!</div>
            <div className="text-xs text-green-600 dark:text-green-300 mt-1">Great work today!</div>
          </div>
        )}
        
        {total === 0 && (
          <div className="mt-4 p-3 bg-neutral-800/50 border border-neutral-700 rounded text-center">
            <div className="text-neutral-400 text-sm">No tasks for today</div>
            <div className="text-xs text-neutral-500 mt-1">Create a task to get started!</div>
          </div>
        )}
      </div>
    </Card>
  )
}
