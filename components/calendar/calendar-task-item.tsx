'use client'

import { Task, getTaskColor, TaskColorId } from '@/types/task'
import { cn } from '@/lib/utils'

interface CalendarTaskItemProps {
  task: Task
  onClick?: (task: Task) => void
  compact?: boolean
  showTime?: boolean
}

// Get color classes based on task's selected color
function getTaskColorClasses(colorId: TaskColorId | undefined) {
  const color = getTaskColor(colorId)
  
  // Map color IDs to tailwind classes
  const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    gray: {
      bg: 'bg-neutral-500/20 dark:bg-neutral-500/30',
      border: 'border-l-neutral-500',
      text: 'text-neutral-700 dark:text-neutral-300',
      dot: 'bg-neutral-500',
    },
    red: {
      bg: 'bg-red-500/20 dark:bg-red-500/30',
      border: 'border-l-red-500',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-500',
    },
    orange: {
      bg: 'bg-orange-500/20 dark:bg-orange-500/30',
      border: 'border-l-orange-500',
      text: 'text-orange-700 dark:text-orange-300',
      dot: 'bg-orange-500',
    },
    amber: {
      bg: 'bg-amber-500/20 dark:bg-amber-500/30',
      border: 'border-l-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    yellow: {
      bg: 'bg-yellow-500/20 dark:bg-yellow-500/30',
      border: 'border-l-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-300',
      dot: 'bg-yellow-500',
    },
    lime: {
      bg: 'bg-lime-500/20 dark:bg-lime-500/30',
      border: 'border-l-lime-500',
      text: 'text-lime-700 dark:text-lime-300',
      dot: 'bg-lime-500',
    },
    green: {
      bg: 'bg-green-500/20 dark:bg-green-500/30',
      border: 'border-l-green-500',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
    },
    emerald: {
      bg: 'bg-emerald-500/20 dark:bg-emerald-500/30',
      border: 'border-l-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    teal: {
      bg: 'bg-teal-500/20 dark:bg-teal-500/30',
      border: 'border-l-teal-500',
      text: 'text-teal-700 dark:text-teal-300',
      dot: 'bg-teal-500',
    },
    cyan: {
      bg: 'bg-cyan-500/20 dark:bg-cyan-500/30',
      border: 'border-l-cyan-500',
      text: 'text-cyan-700 dark:text-cyan-300',
      dot: 'bg-cyan-500',
    },
    sky: {
      bg: 'bg-sky-500/20 dark:bg-sky-500/30',
      border: 'border-l-sky-500',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
    blue: {
      bg: 'bg-blue-500/20 dark:bg-blue-500/30',
      border: 'border-l-blue-500',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    indigo: {
      bg: 'bg-indigo-500/20 dark:bg-indigo-500/30',
      border: 'border-l-indigo-500',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500',
    },
    violet: {
      bg: 'bg-violet-500/20 dark:bg-violet-500/30',
      border: 'border-l-violet-500',
      text: 'text-violet-700 dark:text-violet-300',
      dot: 'bg-violet-500',
    },
    purple: {
      bg: 'bg-purple-500/20 dark:bg-purple-500/30',
      border: 'border-l-purple-500',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    fuchsia: {
      bg: 'bg-fuchsia-500/20 dark:bg-fuchsia-500/30',
      border: 'border-l-fuchsia-500',
      text: 'text-fuchsia-700 dark:text-fuchsia-300',
      dot: 'bg-fuchsia-500',
    },
    pink: {
      bg: 'bg-pink-500/20 dark:bg-pink-500/30',
      border: 'border-l-pink-500',
      text: 'text-pink-700 dark:text-pink-300',
      dot: 'bg-pink-500',
    },
    rose: {
      bg: 'bg-rose-500/20 dark:bg-rose-500/30',
      border: 'border-l-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
  }
  
  return colorMap[color.id] || colorMap.gray
}

export function CalendarTaskItem({ 
  task, 
  onClick, 
  compact = false,
  showTime = false,
}: CalendarTaskItemProps) {
  const isCompleted = task.status === 'completed'
  const isOverdue = task.status === 'overdue'
  
  // Use task's selected color
  const colors = getTaskColorClasses(task.color)
  
  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(task)}
        className={cn(
          'w-full text-left px-1.5 py-0.5 rounded text-xs truncate transition-colors',
          colors.bg,
          isCompleted && 'opacity-50 line-through',
          isOverdue && !isCompleted && 'ring-1 ring-red-500/50',
          'hover:ring-2 hover:ring-[var(--accent-color)]/50'
        )}
        title={task.title}
      >
        <span className={cn('font-medium', colors.text)}>
          {task.title}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick?.(task)}
      className={cn(
        'w-full text-left px-2 py-1.5 rounded-md border-l-2 transition-all',
        colors.bg,
        colors.border,
        isCompleted && 'opacity-50',
        isOverdue && !isCompleted && 'ring-1 ring-red-500/50',
        'hover:ring-2 hover:ring-[var(--accent-color)]/50 hover:scale-[1.02]'
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />
        <span className={cn(
          'text-sm font-medium truncate text-neutral-900 dark:text-white',
          isCompleted && 'line-through'
        )}>
          {task.title}
        </span>
      </div>
      
      {showTime && task.due_date && (
        <div className="mt-0.5 ml-4 text-xs text-neutral-500 dark:text-neutral-400">
          {formatTime(task.due_date)}
        </div>
      )}
      
      {/* Difficulty indicator */}
      <div className="mt-1 ml-4 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={cn(
              'text-[8px]',
              i < task.difficulty ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600'
            )}
          >
            ⚔️
          </span>
        ))}
      </div>
    </button>
  )
}

// Export color function for use elsewhere
export { getTaskColorClasses }
