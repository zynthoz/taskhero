'use server'

import { createClient } from '@/lib/supabase/server'
import { Task, getTaskStatus } from '@/types/task'

export interface CalendarTasksParams {
  startDate: string  // ISO date string
  endDate: string    // ISO date string
  status?: 'pending' | 'completed' | 'overdue'
}

export async function getCalendarTasks(
  params: CalendarTasksParams
): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Build query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .not('due_date', 'is', null)
      .gte('due_date', params.startDate)
      .lte('due_date', params.endDate)
      .order('due_date', { ascending: true })
    
    if (params.status) {
      query = query.eq('status', params.status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching calendar tasks:', error)
      return { success: false, error: error.message }
    }

    // Update status for tasks that may be overdue
    const tasksWithStatus = (data as Task[]).map(task => ({
      ...task,
      status: getTaskStatus(task.status, task.due_date, task.completed_at)
    }))

    return { success: true, data: tasksWithStatus }
  } catch (error) {
    console.error('Unexpected error fetching calendar tasks:', error)
    return { success: false, error: 'Failed to fetch calendar tasks' }
  }
}

export async function updateTaskDueDate(
  taskId: string,
  newDueDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({ due_date: newDueDate, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating task due date:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating task due date:', error)
    return { success: false, error: 'Failed to update task due date' }
  }
}
