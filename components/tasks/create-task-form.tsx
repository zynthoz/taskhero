'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CreateTaskInput, 
  TaskCategory, 
  TaskPriority, 
  TaskDifficulty,
  RecurrencePattern,
  calculateTaskRewards,
  getDifficultyDisplay,
} from '@/types/task'

interface CreateTaskFormProps {
  onSubmit: (task: CreateTaskInput) => Promise<void>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateTaskForm({ 
  onSubmit, 
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  trigger 
}: CreateTaskFormProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : uncontrolledOpen
  const setIsOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setUncontrolledOpen

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    category: 'side',
    priority: 3,
    difficulty: 3,
    due_date: '',
    is_recurring: false,
  })
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  
  console.log('CreateTaskForm render - isOpen:', isOpen, 'isControlled:', isControlled)

  const rewards = calculateTaskRewards(formData.difficulty)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    
    if (!formData.title.trim()) {
      alert('Please enter a quest title')
      return
    }

    // Validate due date (cannot be in the past)
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date)
      const now = new Date()
      if (dueDate < now) {
        alert('Due date cannot be in the past')
        return
      }
    }

    // Validate weekly recurrence
    if (formData.is_recurring && recurrenceType === 'weekly' && selectedDays.length === 0) {
      alert('Please select at least one day for weekly recurrence')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Build recurrence pattern if recurring
      let recurrencePattern: RecurrencePattern | undefined
      if (formData.is_recurring) {
        recurrencePattern = {
          type: recurrenceType,
          interval: recurrenceInterval,
        }
        
        if (recurrenceType === 'weekly' && selectedDays.length > 0) {
          recurrencePattern.days_of_week = selectedDays
        }
      }

      console.log('Calling onSubmit...')
      await onSubmit({
        ...formData,
        recurrence_pattern: recurrencePattern,
      })
      console.log('Task created successfully')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'side',
        priority: 3,
        difficulty: 3,
        due_date: '',
        is_recurring: false,
      })
      setRecurrenceType('daily')
      setRecurrenceInterval(1)
      setSelectedDays([])
      
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create quest. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to get minimum date-time (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5)
    return now.toISOString().slice(0, 16)
  }

  // Quick date buttons
  const setQuickDate = (hours: number) => {
    const date = new Date()
    date.setHours(date.getHours() + hours)
    setFormData({ ...formData, due_date: date.toISOString().slice(0, 16) })
  }

  const defaultTrigger = (
    <Button className="w-full bg-white text-black hover:bg-neutral-200">
      <span className="mr-2">+</span>
      New Task
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-950 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400">
            Add a new task to your quest board
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Task Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task name..."
              className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 h-9 text-sm"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this task..."
              className="w-full min-h-[60px] px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              rows={2}
            />
          </div>

          {/* Priority & Category Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  <SelectItem value="main">Main Quest</SelectItem>
                  <SelectItem value="side">Side Quest</SelectItem>
                  <SelectItem value="daily">Daily Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">
                Priority
              </label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) as TaskPriority })}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  <SelectItem value="1">1 - Lowest</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Normal</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty & Rewards */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Difficulty
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level as TaskDifficulty })}
                    className={`flex-1 py-1.5 px-2 rounded-lg border transition-all text-xs ${
                      formData.difficulty === level
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {getDifficultyDisplay(level as TaskDifficulty)}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs">
                  <span>💰</span>
                  <span className="text-white font-medium">{rewards.gold} Gold</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span>⭐</span>
                  <span className="text-white font-medium">{rewards.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Due Date (Optional)
            </label>
            <Input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              min={getMinDateTime()}
              className="bg-neutral-900 border-neutral-800 text-white h-9 text-sm"
            />
            
            {/* Quick date buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuickDate(24)}
                className="flex-1 py-1.5 text-xs bg-neutral-900 text-neutral-400 rounded border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(72)}
                className="flex-1 py-1.5 text-xs bg-neutral-900 text-neutral-400 rounded border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                In 3 days
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(168)}
                className="flex-1 py-1.5 text-xs bg-neutral-900 text-neutral-400 rounded border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                Next week
              </button>
              {formData.due_date && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, due_date: '' })}
                  className="py-1.5 px-3 text-xs bg-neutral-900 text-red-400 rounded border border-neutral-800 hover:border-red-900 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Recurring Task */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_recurring: checked as boolean })
                }
                className="border-neutral-800"
              />
              <label
                htmlFor="recurring"
                className="text-xs font-medium text-neutral-300 cursor-pointer"
              >
                Recurring task
              </label>
            </div>

            {/* Recurrence Options */}
            {formData.is_recurring && (
              <div className="ml-6 space-y-2 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-400">
                      Repeats
                    </label>
                    <Select value={recurrenceType} onValueChange={(val: 'daily' | 'weekly' | 'monthly') => setRecurrenceType(val)}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-400">
                      Every
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                      className="bg-neutral-800 border-neutral-700 text-white text-xs h-8"
                    />
                  </div>
                </div>

                {/* Weekly Day Selection */}
                {recurrenceType === 'weekly' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-400">
                      On days
                    </label>
                    <div className="flex gap-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDays(prev => 
                              prev.includes(idx) 
                                ? prev.filter(d => d !== idx)
                                : [...prev, idx].sort()
                            )
                          }}
                          className={`flex-1 py-1 text-xs rounded border transition-all ${
                            selectedDays.includes(idx)
                              ? 'bg-white text-black border-white'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-neutral-500">
                  {recurrenceType === 'daily' && `Repeats every ${recurrenceInterval} day${recurrenceInterval > 1 ? 's' : ''}`}
                  {recurrenceType === 'weekly' && selectedDays.length > 0 && 
                    `Repeats every ${recurrenceInterval} week${recurrenceInterval > 1 ? 's' : ''} on ${selectedDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`}
                  {recurrenceType === 'weekly' && selectedDays.length === 0 && 
                    'Select at least one day'}
                  {recurrenceType === 'monthly' && `Repeats every ${recurrenceInterval} month${recurrenceInterval > 1 ? 's' : ''}`}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-neutral-800 text-neutral-300 hover:bg-neutral-900 h-9 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-white text-black hover:bg-neutral-200 h-9 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
