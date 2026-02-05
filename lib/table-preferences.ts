import { Task } from '@/types/task'

export interface TablePreferences {
  columns: ColumnVisibility
  rowsPerPage: number
  sortField: keyof Task | null
  sortDirection: 'asc' | 'desc' | null
}

export interface ColumnVisibility {
  title: boolean
  priority: boolean
  difficulty: boolean
  status: boolean
  due_date: boolean
  xp_reward: boolean
  gold_reward: boolean
  created_at: boolean
}

const STORAGE_KEY = 'impeto_table_preferences'

export const loadTablePreferences = (): TablePreferences | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load table preferences:', error)
    return null
  }
}

export const saveTablePreferences = (preferences: TablePreferences): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error('Failed to save table preferences:', error)
  }
}

export const getDefaultPreferences = (): TablePreferences => ({
  columns: {
    title: true,
    priority: true,
    difficulty: true,
    status: true,
    due_date: true,
    xp_reward: true,
    gold_reward: true,
    created_at: false,
  },
  rowsPerPage: 25,
  sortField: 'created_at',
  sortDirection: 'desc',
})
