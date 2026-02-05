import { completeTask, deleteTask } from '@/app/tasks/actions'

export async function bulkCompleteTask(taskIds: string[]): Promise<void> {
  const promises = taskIds.map(id => completeTask(id))
  await Promise.all(promises)
}

export async function bulkDeleteTasks(taskIds: string[]): Promise<void> {
  const promises = taskIds.map(id => deleteTask(id))
  await Promise.all(promises)
}

export async function bulkMoveTasks(taskIds: string[], folderId: string | null): Promise<void> {
  // This would require a new updateTask action with folder_id parameter
  // For now, we'll implement a basic version
  const { updateTask } = await import('@/app/tasks/actions')
  const promises = taskIds.map(id => 
    updateTask(id, { folder_id: folderId || undefined })
  )
  await Promise.all(promises)
}
