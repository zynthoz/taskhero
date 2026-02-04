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
  getTaskColor,
  formatDueDate,
  getDueDateColor,
} from '@/types/task'
import { TaskAttachment } from '@/types/folder'
import { SubtaskList } from './subtask-list'
import { getSubtasks, createSubtask, toggleSubtask, deleteTask } from '@/app/tasks/actions'
import { 
  getTaskAttachments, 
  uploadFileAttachment, 
  createChecklistAttachment, 
  createLinkAttachment,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
  deleteAttachment,
  AttachmentWithSignedUrl
} from '@/app/attachments/actions'
import { AttachmentList, AddAttachmentDialog, FilePreviewModal } from '@/components/attachments'

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  onEdit?: (task: Task) => void
  onDragStart?: (e: React.DragEvent, task: Task) => void
  onDragEnd?: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onComplete, onDelete, onEdit, onDragStart, onDragEnd, isDragging }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)
  const [subtaskCount, setSubtaskCount] = useState(0)
  const [completedSubtaskCount, setCompletedSubtaskCount] = useState(0)
  
  // Attachment state
  const [attachments, setAttachments] = useState<AttachmentWithSignedUrl[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [showAddAttachment, setShowAddAttachment] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentWithSignedUrl | null>(null)

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

  // Load attachments when details dialog opens
  useEffect(() => {
    if (showDetails) {
      loadAttachments()
    }
  }, [showDetails])

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

  // Attachment handlers
  const loadAttachments = async () => {
    setLoadingAttachments(true)
    try {
      const result = await getTaskAttachments(task.id)
      if (result.success && result.data) {
        setAttachments(result.data)
      }
    } catch (error) {
      console.error('Error loading attachments:', error)
    } finally {
      setLoadingAttachments(false)
    }
  }

  const handleAddFile = async (file: File) => {
    const result = await uploadFileAttachment(task.id, file)
    if (result.success) {
      await loadAttachments()
    }
  }

  const handleAddChecklist = async (items: string[]) => {
    const result = await createChecklistAttachment({ 
      task_id: task.id, 
      checklist_items: items.map(text => ({ 
        id: crypto.randomUUID(), 
        text, 
        checked: false 
      }))
    })
    if (result.success) {
      await loadAttachments()
    }
  }

  const handleAddLink = async (url: string, title?: string, description?: string) => {
    const result = await createLinkAttachment({ 
      task_id: task.id, 
      link_url: url, 
      link_title: title, 
      link_description: description 
    })
    if (result.success) {
      await loadAttachments()
    }
  }

  const handleToggleChecklistItem = async (attachmentId: string, itemId: string, checked: boolean) => {
    await toggleChecklistItem(attachmentId, itemId, checked)
    await loadAttachments()
  }

  const handleAddChecklistItem = async (attachmentId: string, text: string) => {
    await addChecklistItem(attachmentId, text)
    await loadAttachments()
  }

  const handleDeleteChecklistItem = async (attachmentId: string, itemId: string) => {
    await deleteChecklistItem(attachmentId, itemId)
    await loadAttachments()
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    await deleteAttachment(attachmentId)
    await loadAttachments()
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
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e, task)}
        onDragEnd={onDragEnd}
        className={`group relative stat-card transition-all duration-200 hover:shadow-lg cursor-pointer hover-lift ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${
          isCompleted 
            ? 'opacity-75 card-green-tint' 
            : isOverdue
            ? 'border-red-400/30 card-red-tint'
            : 'hover:border-neutral-400 dark:hover:border-neutral-700'
        }`}
        onClick={() => setShowDetails(true)}
      >
        {/* Difficulty badge - top right */}
        <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 text-[10px] md:text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1 md:px-1.5 py-0.5 rounded">
          {getDifficultyDisplay(task.difficulty)}
        </div>

        <div className="p-3 md:p-4 pb-12 md:pb-14 pt-6 md:pt-8 space-y-2 md:space-y-3">
          {/* Header with checkbox */}
          <div className="flex items-start gap-2 md:gap-3">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleComplete}
              disabled={isCompleting || isCompleted}
              className="mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-1 min-w-0">
              <h3 
                className={`font-semibold text-sm md:text-base leading-tight ${
                  isCompleted 
                    ? 'line-through text-neutral-500' 
                    : 'text-neutral-900 dark:text-white'
                }`}
              >
                {task.title}
              </h3>
            </div>
          </div>

          {/* Tags & Status */}
          <div className="flex flex-wrap gap-1 md:gap-2">
            {task.due_date && !isCompleted && (
              <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 text-[9px] md:text-[11px] font-medium rounded shadow-sm ${
                isOverdue ? 'status-overdue' : 'bg-blue-500/10 text-blue-400 border border-blue-500/40'
              }`}>
                {formatDueDate(task.due_date)}
              </span>
            )}
            
            {task.is_recurring && (
              <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 text-[9px] md:text-[11px] font-medium bg-purple-500/10 text-purple-400 rounded border border-purple-500/40 shadow-sm">
                🔄 Recurring
              </span>
            )}

            {/* Show subtask count if there are subtasks and this is not a subtask itself */}
            {!task.parent_task_id && subtaskCount > 0 && (
              <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 text-[9px] md:text-[11px] font-medium bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/40 shadow-sm">
                ✓ {completedSubtaskCount}/{subtaskCount}
              </span>
            )}
          </div>



          {/* Action Buttons (shown on hover, always visible on mobile) */}
          <div 
            className="flex gap-1.5 md:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity pt-1 md:pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && !isCompleted && (
              <button
                onClick={() => onEdit(task)}
                className="flex-1 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded border border-neutral-300 dark:border-neutral-700"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs bg-neutral-100 dark:bg-neutral-800 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded border border-neutral-300 dark:border-neutral-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Bottom-left rewards */}
        {!isCompleted && (
          <div className="absolute left-2 md:left-3 bottom-2 md:bottom-3 flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span className="font-medium">{task.gold_reward}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="font-medium">{task.xp_reward}</span>
            </div>
          </div>
        )}

        {/* Overdue badge */}
        {isOverdue && !isCompleted && (
          <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 bg-red-600 text-white px-1.5 md:px-2 py-0.5 rounded text-[8px] md:text-[10px] font-medium">
            Overdue
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Delete Task?</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
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

      {/* Task Details Dialog - Two Column Layout */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              {task.title}
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Task Details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Task Info */}
            <div className="space-y-4">
              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2 text-sm">Description</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">{task.description}</p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-xs">Color</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${getTaskColor(task.color).bg}`} />
                  <span className="text-xs text-neutral-700 dark:text-neutral-300 capitalize">
                    {getTaskColor(task.color).name}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-xs">Priority</h4>
                <span className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-800 inline-block">
                  {task.priority} - {task.priority === 1 ? 'Lowest' : task.priority === 2 ? 'Low' : task.priority === 3 ? 'Normal' : task.priority === 4 ? 'High' : 'Urgent'}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-xs">Status</h4>
                <span className={`px-2 py-1 text-xs rounded border inline-block ${
                  isCompleted ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700' :
                  isOverdue ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-900' :
                  'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                }`}>
                  {task.status}
                </span>
              </div>

              {task.due_date && (
                <div>
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-xs">Due Date</h4>
                  <span className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-800 inline-block">
                    {formatDueDate(task.due_date)}
                  </span>
                </div>
              )}
            </div>

              {/* Rewards */}
              <div>
                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2 text-sm">Rewards</h4>
                <div className="flex gap-4 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{task.gold_reward} Gold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{task.xp_reward} XP</span>
                  </div>
                </div>
              </div>

              {/* Subtasks - only show for parent tasks (not subtasks themselves) */}
              {!task.parent_task_id && (
                <div>
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2 text-sm">Subtasks</h4>
                  {loadingSubtasks ? (
                    <div className="text-sm text-neutral-500 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
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
            </div>

            {/* Right Column - Attachments */}
            <div className="space-y-4">
              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                    Attachments {attachments.length > 0 && `(${attachments.length})`}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAttachment(true)}
                    className="text-xs h-7 px-2"
                  >
                    + Add
                  </Button>
                </div>
                {loadingAttachments ? (
                  <div className="text-sm text-neutral-500 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    Loading attachments...
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="text-sm text-neutral-500 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
                    No attachments yet. Add files, checklists, or links.
                  </div>
                ) : (
                  <AttachmentList
                    attachments={attachments}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    onAddChecklistItem={handleAddChecklistItem}
                    onDeleteChecklistItem={handleDeleteChecklistItem}
                    onDeleteAttachment={handleDeleteAttachment}
                    onPreviewFile={setPreviewAttachment}
                  />
                )}
              </div>

              {/* Timestamps */}
              <div className="text-xs text-neutral-500 space-y-1 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>Created: {new Date(task.created_at).toLocaleString()}</div>
                {task.completed_at && (
                  <div>Completed: {new Date(task.completed_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions - Full width at bottom */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {!isCompleted && (
              <Button
                onClick={() => {
                  handleComplete()
                  setShowDetails(false)
                }}
                variant="primary"
                className="flex-1"
                disabled={isCompleting}
              >
                Complete Task
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDetails(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Attachment Dialog */}
      <AddAttachmentDialog
        isOpen={showAddAttachment}
        onClose={() => setShowAddAttachment(false)}
        onAddFile={handleAddFile}
        onAddChecklist={handleAddChecklist}
        onAddLink={handleAddLink}
      />

      {/* File Preview Modal */}
      {previewAttachment && (
        <FilePreviewModal
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
          attachment={previewAttachment}
          onDelete={async () => {
            await handleDeleteAttachment(previewAttachment.id)
            setPreviewAttachment(null)
          }}
        />
      )}
    </>
  )
}
