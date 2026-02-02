// Task-related TypeScript types and interfaces

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled'
export type TaskCategory = 'main' | 'side' | 'daily'
export type TaskPriority = 1 | 2 | 3 | 4 | 5
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  difficulty: TaskDifficulty
  status: TaskStatus
  due_date: string | null
  is_recurring: boolean
  recurrence_pattern: RecurrencePattern | null
  xp_reward: number
  gold_reward: number
  folder_id: string | null
  parent_task_id: string | null // For subtasks
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number // e.g., every 2 days, every 3 weeks
  days_of_week?: number[] // For weekly: [0=Sunday, 1=Monday, ..., 6=Saturday]
  day_of_month?: number // For monthly: 1-31
  end_date?: string | null
}

export interface CreateTaskInput {
  title: string
  description?: string
  category: TaskCategory
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
  category?: TaskCategory
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

// Helper to get difficulty display (sword icons)
export function getDifficultyDisplay(difficulty: TaskDifficulty): string {
  return '⚔️'.repeat(difficulty)
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

// Helper to get category color
export function getCategoryColor(category: TaskCategory): string {
  const colors = {
    main: 'bg-red-500/10 text-red-400 border-red-500/20',
    side: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    daily: 'bg-green-500/10 text-green-400 border-green-500/20',
  }
  return colors[category]
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
