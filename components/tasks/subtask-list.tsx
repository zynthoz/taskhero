'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Task } from '@/types/task'

interface SubtaskListProps {
  parentTaskId: string
  subtasks: Task[]
  onToggleSubtask: (subtaskId: string) => Promise<void>
  onAddSubtask: (title: string) => Promise<void>
  onDeleteSubtask: (subtaskId: string) => Promise<void>
}

export function SubtaskList({
  parentTaskId,
  subtasks,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newSubtaskTitle.trim()) return

    setIsAdding(true)
    try {
      await onAddSubtask(newSubtaskTitle)
      setNewSubtaskTitle('')
    } catch (error) {
      console.error('Error adding subtask:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const completedCount = subtasks.filter(st => st.status === 'completed').length
  const totalCount = subtasks.length

  return (
    <div className="mt-4 space-y-2">
      {/* Progress Header */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
          <span>Subtasks</span>
          <span className="text-neutral-600">•</span>
          <span>{completedCount}/{totalCount}</span>
        </div>
      )}

      {/* Subtask List */}
      <div className="space-y-1.5">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded border border-neutral-800 hover:border-neutral-700 transition-colors group"
          >
            <Checkbox
              checked={subtask.status === 'completed'}
              onCheckedChange={() => onToggleSubtask(subtask.id)}
              className="border-neutral-600"
            />
            <span
              className={`flex-1 text-sm ${
                subtask.status === 'completed'
                  ? 'text-neutral-500 line-through'
                  : 'text-white'
              }`}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => onDeleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-xs text-neutral-500 hover:text-red-400 transition-all"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="+ Add subtask..."
          className="flex-1 h-8 text-sm bg-neutral-800 border-neutral-700 focus:border-neutral-600"
          disabled={isAdding}
        />
        {newSubtaskTitle.trim() && (
          <Button
            type="submit"
            size="sm"
            disabled={isAdding}
            className="h-8 px-3 bg-white text-black hover:bg-neutral-200"
          >
            Add
          </Button>
        )}
      </form>
    </div>
  )
}
