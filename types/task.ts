// Task-related TypeScript types and interfaces

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled'
export type TaskPriority = 1 | 2 | 3 | 4 | 5
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5

// Available task colors for user selection
export const TASK_COLORS = [
  { id: 'gray', name: 'Gray', bg: 'bg-neutral-500', text: 'text-neutral-600 dark:text-neutral-400', hex: '#737373' },
  { id: 'red', name: 'Red', bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', hex: '#ef4444' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', hex: '#f97316' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', hex: '#f59e0b' },
  { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', hex: '#eab308' },
  { id: 'lime', name: 'Lime', bg: 'bg-lime-500', text: 'text-lime-600 dark:text-lime-400', hex: '#84cc16' },
  { id: 'green', name: 'Green', bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', hex: '#22c55e' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', hex: '#10b981' },
  { id: 'teal', name: 'Teal', bg: 'bg-teal-500', text: 'text-teal-600 dark:text-teal-400', hex: '#14b8a6' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', hex: '#06b6d4' },
  { id: 'sky', name: 'Sky', bg: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', hex: '#0ea5e9' },
  { id: 'blue', name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', hex: '#3b82f6' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', hex: '#6366f1' },
  { id: 'violet', name: 'Violet', bg: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400', hex: '#8b5cf6' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', hex: '#a855f7' },
  { id: 'fuchsia', name: 'Fuchsia', bg: 'bg-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400', hex: '#d946ef' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400', hex: '#ec4899' },
  { id: 'rose', name: 'Rose', bg: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', hex: '#f43f5e' },
] as const

export type TaskColorId = typeof TASK_COLORS[number]['id']

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  color: TaskColorId
  priority: TaskPriority
  difficulty: TaskDifficulty
  status: TaskStatus
  due_date: string | null
  is_recurring: boolean
  recurrence_pattern: RecurrencePattern | null
  xp_reward: number
  gold_reward: number
  folder_id: string | null
  parent_task_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number
  days_of_week?: number[]
  day_of_month?: number
  end_date?: string | null
}

export interface CreateTaskInput {
  title: string
  description?: string
  color?: TaskColorId
  priority: TaskPriority
  difficulty: TaskDifficulty
  due_date?: string
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern
  folder_id?: string
  parent_task_id?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  color?: TaskColorId
  priority?: TaskPriority
  difficulty?: TaskDifficulty
  status?: TaskStatus
  due_date?: string
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern
  folder_id?: string
}

export interface TaskRewards {
  xp: number
  gold: number
}

// Helper function to calculate rewards based on difficulty
export function calculateTaskRewards(difficulty: TaskDifficulty): TaskRewards {
  const baseXP = 10
  const baseGold = 5
  
  const multipliers = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 3,
    5: 5,
  }
  
  const multiplier = multipliers[difficulty]
  
  return {
    xp: Math.floor(baseXP * multiplier),
    gold: Math.floor(baseGold * multiplier),
  }
}

// Helper function to determine task status based on due date
export function getTaskStatus(
  currentStatus: TaskStatus,
  dueDate: string | null,
  completedAt: string | null
): TaskStatus {
  if (completedAt) return 'completed'
  if (!dueDate) return currentStatus
  
  const now = new Date()
  const due = new Date(dueDate)
  
  if (due < now && currentStatus !== 'completed') {
    return 'overdue'
  }
  
  return currentStatus
}

// Helper to get difficulty display (number + sword icon)
export function getDifficultyDisplay(difficulty: TaskDifficulty): string {
  return `${difficulty}⚔️`
}

// Helper to get priority color
export function getPriorityColor(priority: TaskPriority): string {
  const colors = {
    1: 'text-gray-500 border-gray-500',
    2: 'text-blue-500 border-blue-500',
    3: 'text-yellow-500 border-yellow-500',
    4: 'text-orange-500 border-orange-500',
    5: 'text-red-500 border-red-500',
  }
  return colors[priority]
}

// Helper to get task color by ID
export function getTaskColor(colorId: TaskColorId | undefined) {
  const color = TASK_COLORS.find(c => c.id === colorId)
  return color || TASK_COLORS[0] // Default to gray
}

// Helper to format due date display
export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return 'No due date'
  
  const date = new Date(dueDate)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper to get urgency color based on due date
export function getDueDateColor(dueDate: string | null, status: TaskStatus): string {
  if (status === 'completed') return 'text-green-400'
  if (!dueDate) return 'text-gray-400'
  
  const date = new Date(dueDate)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-500' // Overdue
  if (diffDays === 0) return 'text-orange-500' // Due today
  if (diffDays <= 3) return 'text-yellow-500' // Due soon
  
  return 'text-gray-400'
}
