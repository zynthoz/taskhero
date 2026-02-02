'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { 
  CreateTaskInput, 
  UpdateTaskInput, 
  Task,
  calculateTaskRewards,
  getTaskStatus,
} from '@/types/task'

export async function createTask(input: CreateTaskInput): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Calculate rewards based on difficulty
    const rewards = calculateTaskRewards(input.difficulty)

    // Prepare task data
    const taskData = {
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      category: input.category,
      priority: input.priority,
      difficulty: input.difficulty,
      status: 'pending' as const,
      due_date: input.due_date || null,
      is_recurring: input.is_recurring || false,
      recurrence_pattern: input.recurrence_pattern || null,
      xp_reward: rewards.xp,
      gold_reward: rewards.gold,
      parent_task_id: input.parent_task_id || null,
    }

    // Insert task into database
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Unexpected error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function getTasks(): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return { success: false, error: error.message }
    }

    // Update status for tasks that may be overdue
    const tasksWithStatus = (data as Task[]).map(task => ({
      ...task,
      status: getTaskStatus(task.status, task.due_date, task.completed_at)
    }))

    return { success: true, data: tasksWithStatus }
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function updateTask(
  taskId: string, 
  input: UpdateTaskInput
): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // If difficulty is being updated, recalculate rewards
    let updateData: any = { ...input }
    
    if (input.difficulty) {
      const rewards = calculateTaskRewards(input.difficulty)
      updateData.xp_reward = rewards.xp
      updateData.gold_reward = rewards.gold
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Unexpected error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function completeTask(taskId: string): Promise<{ 
  success: boolean
  data?: { task: Task; xpGained: number; goldGained: number }
  error?: string 
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the task first
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.status === 'completed') {
      return { success: false, error: 'Task already completed' }
    }

    // Update task to completed
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error completing task:', updateError)
      return { success: false, error: updateError.message }
    }

    // Award XP and gold to user
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('current_xp, total_xp, gold, level, total_tasks_completed, current_streak')
      .eq('id', user.id)
      .single()

    if (userFetchError) {
      console.error('Error fetching user data:', userFetchError)
      return { success: false, error: userFetchError.message }
    }

    // Calculate streak multiplier (1.0x - 2.0x based on streak)
    const currentStreak = userData.current_streak || 0
    let streakMultiplier = 1.0
    if (currentStreak >= 30) {
      streakMultiplier = 2.0 // 2x XP for 30+ day streak
    } else if (currentStreak >= 14) {
      streakMultiplier = 1.5 // 1.5x XP for 14+ day streak
    } else if (currentStreak >= 7) {
      streakMultiplier = 1.2 // 1.2x XP for 7+ day streak
    }

    // Apply streak multiplier to XP
    const baseXP = task.xp_reward
    const bonusXP = Math.floor(baseXP * (streakMultiplier - 1.0))
    const totalXP = baseXP + bonusXP

    const newCurrentXP = (userData.current_xp || 0) + totalXP
    const newTotalXP = (userData.total_xp || 0) + totalXP
    const newGold = (userData.gold || 0) + task.gold_reward
    const newTasksCompleted = (userData.total_tasks_completed || 0) + 1

    // Simple level calculation: 100 XP per level
    const XP_PER_LEVEL = 100
    const oldLevel = userData.level || 1
    const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1
    const xpForCurrentLevel = newCurrentXP % XP_PER_LEVEL

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        current_xp: xpForCurrentLevel,
        total_xp: newTotalXP,
        gold: newGold,
        level: newLevel,
        total_tasks_completed: newTasksCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('Error updating user rewards:', userUpdateError)
      return { success: false, error: userUpdateError.message }
    }

    // Log gold transaction for task completion
    await supabase.rpc('log_gold_transaction', {
      p_user_id: user.id,
      p_amount: task.gold_reward,
      p_transaction_type: 'task_reward',
      p_reference_id: taskId,
      p_reference_type: 'task',
      p_description: `Completed: ${task.title}`,
      p_metadata: {
        difficulty: task.difficulty,
        base_gold: task.gold_reward,
        xp_gained: totalXP,
        streak_multiplier: streakMultiplier,
      },
    })

    // Log level up if level increased
    if (newLevel > oldLevel) {
      await supabase
        .from('level_history')
        .insert({
          user_id: user.id,
          previous_level: oldLevel,
          new_level: newLevel,
          total_xp_at_levelup: newTotalXP,
        })
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { 
      success: true, 
      data: {
        task: updatedTask as Task,
        xpGained: totalXP,
        goldGained: task.gold_reward,
      }
    }
  } catch (error) {
    console.error('Unexpected error completing task:', error)
    return { success: false, error: 'Failed to complete task' }
  }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting task:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function toggleTaskStatus(
  taskId: string,
  newStatus: 'pending' | 'in-progress'
): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling task status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Unexpected error toggling task status:', error)
    return { success: false, error: 'Failed to toggle task status' }
  }
}

export async function getSubtasks(parentTaskId: string): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('parent_task_id', parentTaskId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching subtasks:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Task[] }
  } catch (error) {
    console.error('Unexpected error fetching subtasks:', error)
    return { success: false, error: 'Failed to fetch subtasks' }
  }
}

export async function createSubtask(
  parentTaskId: string,
  title: string
): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get parent task to inherit some properties
    const { data: parentTask, error: parentError } = await supabase
      .from('tasks')
      .select('category, priority')
      .eq('id', parentTaskId)
      .eq('user_id', user.id)
      .single()

    if (parentError || !parentTask) {
      return { success: false, error: 'Parent task not found' }
    }

    // Subtasks have minimal rewards (difficulty 1)
    const rewards = calculateTaskRewards(1)

    const subtaskData = {
      user_id: user.id,
      title,
      description: null,
      category: parentTask.category,
      priority: parentTask.priority,
      difficulty: 1,
      status: 'pending' as const,
      due_date: null,
      is_recurring: false,
      recurrence_pattern: null,
      xp_reward: rewards.xp,
      gold_reward: rewards.gold,
      parent_task_id: parentTaskId,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(subtaskData)
      .select()
      .single()

    if (error) {
      console.error('Error creating subtask:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Unexpected error creating subtask:', error)
    return { success: false, error: 'Failed to create subtask' }
  }
}

export async function toggleSubtask(subtaskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current subtask status
    const { data: subtask, error: fetchError } = await supabase
      .from('tasks')
      .select('status, parent_task_id')
      .eq('id', subtaskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !subtask) {
      return { success: false, error: 'Subtask not found' }
    }

    // Make sure this is actually a subtask
    if (!subtask.parent_task_id) {
      return { success: false, error: 'Not a subtask' }
    }

    const newStatus = subtask.status === 'completed' ? 'pending' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subtaskId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error toggling subtask:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error toggling subtask:', error)
    return { success: false, error: 'Failed to toggle subtask' }
  }
}

export async function updateOverdueTasks(): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, updated: 0, error: 'Not authenticated' }
    }

    // Get all pending/in-progress tasks with due dates
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, due_date, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in-progress'])
      .not('due_date', 'is', null)

    if (fetchError) {
      console.error('Error fetching tasks for overdue check:', fetchError)
      return { success: false, updated: 0, error: fetchError.message }
    }

    if (!tasks || tasks.length === 0) {
      return { success: true, updated: 0 }
    }

    // Check which tasks are overdue
    const now = new Date()
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date!)
      return dueDate < now && task.status !== 'overdue'
    })

    if (overdueTasks.length === 0) {
      return { success: true, updated: 0 }
    }

    // Update tasks to overdue status
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'overdue', updated_at: new Date().toISOString() })
      .in('id', overdueTasks.map(t => t.id))

    if (updateError) {
      console.error('Error updating overdue tasks:', updateError)
      return { success: false, updated: 0, error: updateError.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    
    return { success: true, updated: overdueTasks.length }
  } catch (error) {
    console.error('Unexpected error updating overdue tasks:', error)
    return { success: false, updated: 0, error: 'Failed to update overdue tasks' }
  }
}
