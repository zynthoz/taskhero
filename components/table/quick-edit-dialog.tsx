'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Task, TaskPriority, TaskDifficulty, getDifficultyDisplay } from '@/types/task'
import { updateTask } from '@/app/tasks/actions'
import { useNotifications } from '@/lib/notifications'

interface QuickEditDialogProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onTaskUpdate: () => void
}

export function QuickEditDialog({ task, isOpen, onClose, onTaskUpdate }: QuickEditDialogProps) {
  const { success: showSuccess, error: showError } = useNotifications()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>(3)
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(1)
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDifficulty(task.difficulty)
      setDueDate(task.due_date || '')
    }
  }, [task])

  const handleSubmit = async () => {
    if (!task) return

    setIsSubmitting(true)
    try {
      await updateTask(task.id, {
        title,
        description: description || undefined,
        priority,
        difficulty,
        due_date: dueDate || undefined,
      })
      showSuccess('Quest updated successfully!')
      onTaskUpdate()
      onClose()
    } catch (error) {
      showError('Failed to update quest')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[500px] max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg">Quick Edit Quest</DialogTitle>
          <DialogDescription className="text-sm">
            Make quick changes to your quest
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quest Name</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 min-h-[5.5rem] sm:min-h-0 text-base sm:text-sm resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
            >
              <option value="1">1 - Lowest</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Normal</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Urgent</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level as TaskDifficulty)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border-2 transition-all active:scale-95 text-sm',
                    'min-h-[2.75rem] sm:min-h-0',
                    difficulty === level
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-neutral-200 dark:border-neutral-700'
                  )}
                >
                  {getDifficultyDisplay(level as TaskDifficulty)}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onPointerDown={(e) => {
                // Only attempt to open native picker on a trusted user gesture (avoid programmatic focus)
                if (!e.isTrusted) return
                try {
                  (e.target as any).showPicker?.()
                } catch {
                  // showPicker may throw NotAllowedError in some contexts; ignore silently
                }
              }}
              onKeyDown={(e) => {
                // Prevent manual typing while allowing navigation keys
                const allowed = ['Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace'];
                if (!allowed.includes(e.key)) e.preventDefault();
              }}
              className="min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[2.75rem] sm:min-h-0 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="bg-[var(--accent-color,#9333ea)] hover:bg-[var(--accent-color-hover,#7e22ce)] text-white min-h-[2.75rem] sm:min-h-0 w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
