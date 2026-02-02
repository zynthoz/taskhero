'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Task,
  getDifficultyDisplay,
  getPriorityColor,
  getCategoryColor,
  formatDueDate,
  getDueDateColor,
} from '@/types/task'
import { SubtaskList } from './subtask-list'
import { getSubtasks, createSubtask, toggleSubtask, deleteTask } from '@/app/tasks/actions'

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  onEdit?: (task: Task) => void
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)
  const [subtaskCount, setSubtaskCount] = useState(0)
  const [completedSubtaskCount, setCompletedSubtaskCount] = useState(0)

  const isCompleted = task.status === 'completed'
  const isOverdue = task.status === 'overdue'

  // Load subtask count when component mounts (for parent tasks only)
  useEffect(() => {
    if (!task.parent_task_id) {
      quickLoadSubtaskCount()
    }
  }, [task.id])

  // Load subtasks when details dialog opens
  useEffect(() => {
    if (showDetails && !task.parent_task_id) {
      loadSubtasks()
    }
  }, [showDetails, task.parent_task_id])

  const quickLoadSubtaskCount = async () => {
    try {
      const result = await getSubtasks(task.id)
      if (result.success && result.data) {
        setSubtaskCount(result.data.length)
        setCompletedSubtaskCount(result.data.filter(st => st.status === 'completed').length)
      }
    } catch (error) {
      console.error('Error loading subtask count:', error)
    }
  }

  const loadSubtasks = async () => {
    setLoadingSubtasks(true)
    try {
      const result = await getSubtasks(task.id)
      if (result.success && result.data) {
        setSubtasks(result.data)
        setSubtaskCount(result.data.length)
        setCompletedSubtaskCount(result.data.filter(st => st.status === 'completed').length)
      }
    } catch (error) {
      console.error('Error loading subtasks:', error)
    } finally {
      setLoadingSubtasks(false)
    }
  }

  const handleAddSubtask = async (title: string) => {
    const result = await createSubtask(task.id, title)
    if (result.success && result.data) {
      setSubtasks(prev => [...prev, result.data!])
      setSubtaskCount(prev => prev + 1)
    }
  }

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubtask(subtaskId)
    // Reload subtasks to get updated status
    await loadSubtasks()
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    const subtaskToDelete = subtasks.find(st => st.id === subtaskId)
    await deleteTask(subtaskId)
    setSubtasks(prev => prev.filter(st => st.id !== subtaskId))
    setSubtaskCount(prev => prev - 1)
    if (subtaskToDelete?.status === 'completed') {
      setCompletedSubtaskCount(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (isCompleted) return
    
    setIsCompleting(true)
    try {
      await onComplete(task.id)
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting task:', error)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card 
        className={`group relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isCompleted 
            ? 'bg-neutral-900 border-neutral-800 opacity-60' 
            : isOverdue
            ? 'bg-neutral-900 border-red-900/50'
            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
        }`}
        onClick={() => setShowDetails(true)}
      >
        <div className="p-3 space-y-2">
          {/* Header with checkbox and difficulty */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleComplete}
              disabled={isCompleting || isCompleted}
              className="mt-0.5 border-neutral-700 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-1 min-w-0">
              <h3 
                className={`font-medium text-sm ${
                  isCompleted 
                    ? 'line-through text-neutral-500' 
                    : 'text-white'
                }`}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-neutral-500">
              {getDifficultyDisplay(task.difficulty)}
            </div>
          </div>

          {/* Tags & Category */}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
              {task.category}
            </span>
            
            {task.due_date && (
              <span className={`px-2 py-0.5 text-[10px] rounded border ${
                isOverdue ? 'bg-red-950/50 text-red-400 border-red-900' :
                'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}>
                {formatDueDate(task.due_date)}
              </span>
            )}
            
            {task.is_recurring && (
              <span className="px-2 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
                🔄 Recurring
              </span>
            )}

            {/* Show subtask count if there are subtasks and this is not a subtask itself */}
            {!task.parent_task_id && subtaskCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
                ✓ {completedSubtaskCount}/{subtaskCount}
              </span>
            )}
          </div>

          {/* Rewards */}
          {!isCompleted && (
            <div className="flex items-center gap-3 pt-1 border-t border-neutral-800 text-[11px]">
              <div className="flex items-center gap-1 text-neutral-400">
                <span>💰</span>
                <span>{task.gold_reward}</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-400">
                <span>⭐</span>
                <span>{task.xp_reward}</span>
              </div>
            </div>
          )}

          {/* Action Buttons (shown on hover) */}
          <div 
            className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && !isCompleted && (
              <button
                onClick={() => onEdit(task)}
                className="flex-1 px-2 py-1 text-[11px] bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded border border-neutral-700"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 px-2 py-1 text-[11px] bg-neutral-800 text-red-400 hover:bg-red-950/50 rounded border border-neutral-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-white text-black px-2 py-0.5 rounded text-[10px] font-medium">
            ✓ Done
          </div>
        )}

        {/* Overdue badge */}
        {isOverdue && !isCompleted && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-medium">
            Overdue
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-neutral-950 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Task?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 border-neutral-800 text-neutral-300 hover:bg-neutral-900"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-neutral-950 border-neutral-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
              {task.title}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Task Details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Description */}
            {task.description && (
              <div>
                <h4 className="font-medium text-neutral-300 mb-2 text-sm">Description</h4>
                <p className="text-neutral-400 text-sm">{task.description}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="font-medium text-neutral-300 mb-1 text-xs">Category</h4>
                <span className="px-2 py-1 text-xs bg-neutral-900 text-neutral-300 rounded border border-neutral-800 inline-block capitalize">
                  {task.category === 'main' ? 'Main Quest' : task.category === 'side' ? 'Side Quest' : 'Daily Task'}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium text-neutral-300 mb-1 text-xs">Priority</h4>
                <span className="px-2 py-1 text-xs bg-neutral-900 text-neutral-300 rounded border border-neutral-800 inline-block">
                  {task.priority} - {task.priority === 1 ? 'Lowest' : task.priority === 2 ? 'Low' : task.priority === 3 ? 'Normal' : task.priority === 4 ? 'High' : 'Urgent'}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-neutral-300 mb-1 text-xs">Status</h4>
                <span className={`px-2 py-1 text-xs rounded border inline-block ${
                  isCompleted ? 'bg-neutral-900 text-white border-neutral-700' :
                  isOverdue ? 'bg-red-950/50 text-red-400 border-red-900' :
                  'bg-neutral-900 text-neutral-300 border-neutral-800'
                }`}>
                  {task.status}
                </span>
              </div>

              {task.due_date && (
                <div>
                  <h4 className="font-medium text-neutral-300 mb-1 text-xs">Due Date</h4>
                  <span className="px-2 py-1 text-xs bg-neutral-900 text-neutral-300 rounded border border-neutral-800 inline-block">
                    {formatDueDate(task.due_date)}
                  </span>
                </div>
              )}
            </div>

            {/* Rewards */}
            <div>
              <h4 className="font-medium text-neutral-300 mb-2 text-sm">Rewards</h4>
              <div className="flex gap-4 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <span className="text-white font-medium">{task.gold_reward} Gold</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="text-white font-medium">{task.xp_reward} XP</span>
                </div>
              </div>
            </div>

            {/* Subtasks - only show for parent tasks (not subtasks themselves) */}
            {!task.parent_task_id && (
              <div>
                <h4 className="font-medium text-neutral-300 mb-2 text-sm">Subtasks</h4>
                {loadingSubtasks ? (
                  <div className="text-sm text-neutral-500 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    Loading subtasks...
                  </div>
                ) : (
                  <SubtaskList
                    parentTaskId={task.id}
                    subtasks={subtasks}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                  />
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-neutral-500 space-y-1 pt-2 border-t border-neutral-800">
              <div>Created: {new Date(task.created_at).toLocaleString()}</div>
              {task.completed_at && (
                <div>Completed: {new Date(task.completed_at).toLocaleString()}</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-800">
              {!isCompleted && (
                <Button
                  onClick={() => {
                    handleComplete()
                    setShowDetails(false)
                  }}
                  className="flex-1 bg-white text-black hover:bg-neutral-200"
                  disabled={isCompleting}
                >
                  Complete Task
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
                className="flex-1 border-neutral-800 text-neutral-300 hover:bg-neutral-900"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
