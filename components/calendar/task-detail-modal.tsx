'use client'

import { useState, useEffect } from 'react'
import { Task, getTaskColor } from '@/types/task'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AttachmentList } from '@/components/attachments'
import { FilePreviewModal } from '@/components/attachments/file-preview-modal'
import { getTaskAttachments, AttachmentWithSignedUrl } from '@/app/attachments/actions'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onComplete?: (taskId: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onComplete,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentWithSignedUrl[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentWithSignedUrl | null>(null)
  
  // Load attachments when modal opens
  useEffect(() => {
    if (isOpen && task) {
      loadAttachments()
    }
  }, [isOpen, task?.id])
  
  const loadAttachments = async () => {
    if (!task) return
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
  
  if (!task) return null
  
  const color = getTaskColor(task.color)
  const isCompleted = task.status === 'completed'
  const isOverdue = task.status === 'overdue'
  
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  
  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(task.id)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        {/* Header with color indicator */}
        <DialogHeader className="pb-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: color.hex }}
            />
            <DialogTitle className={cn(
              'text-lg font-semibold text-neutral-900 dark:text-white',
              isCompleted && 'line-through opacity-60'
            )}>
              {task.title}
            </DialogTitle>
          </div>
          
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              isCompleted && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              isOverdue && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              !isCompleted && !isOverdue && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            )}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            
            {task.is_recurring && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                🔄 Recurring
              </span>
            )}
          </div>
        </DialogHeader>
        
        {/* Content - Scrollable */}
        <div className="space-y-4 py-2 overflow-y-auto flex-1">
          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Description
              </h4>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {task.description}
              </p>
            </div>
          )}
          
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                Due Date
              </div>
              <div className={cn(
                'font-medium',
                isOverdue && 'text-red-600 dark:text-red-400',
                !isOverdue && 'text-neutral-900 dark:text-white'
              )}>
                {formatDateTime(task.due_date)}
              </div>
            </div>
            
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                Priority
              </div>
              <div className="font-medium text-neutral-900 dark:text-white">
                {['Lowest', 'Low', 'Normal', 'High', 'Urgent'][task.priority - 1]}
              </div>
            </div>
            
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                Difficulty
              </div>
              <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-0.5">
                {Array.from({ length: task.difficulty }).map((_, i) => (
                  <span key={i} className="text-sm">⚔️</span>
                ))}
              </div>
            </div>
            
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                Rewards
              </div>
              <div className="font-medium text-neutral-900 dark:text-white text-xs">
                <span className="text-purple-600 dark:text-purple-400">{task.xp_reward} XP</span>
                {' · '}
                <span className="text-yellow-600 dark:text-yellow-400">{task.gold_reward} 🪙</span>
              </div>
            </div>
          </div>
          
          {/* Recurrence pattern */}
          {task.is_recurring && task.recurrence_pattern && (
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                Repeats
              </div>
              <div className="font-medium text-neutral-900 dark:text-white capitalize text-sm">
                {task.recurrence_pattern.type}
                {task.recurrence_pattern.interval > 1 && ` every ${task.recurrence_pattern.interval}`}
              </div>
            </div>
          )}
          
          {/* Attachments */}
          <div>
            <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Attachments
            </h4>
            {loadingAttachments ? (
              <div className="text-xs text-neutral-500 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                Loading attachments...
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-xs text-neutral-500 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                No attachments
              </div>
            ) : (
              <AttachmentList
                attachments={attachments}
                onPreviewFile={setPreviewAttachment}
                readOnly={true}
              />
            )}
          </div>
        </div>
        
        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
              >
                Edit
              </Button>
            )}
            
            {!isCompleted && onComplete && (
              <Button
                size="sm"
                onClick={() => {
                  onComplete(task.id)
                  onClose()
                }}
                variant="primary"
              >
                Complete ✓
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* File Preview Modal */}
      <FilePreviewModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </Dialog>
  )
}
