'use client'

import { useState, useRef } from 'react'
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
  TaskPriority, 
  TaskDifficulty,
  TaskColorId,
  TASK_COLORS,
  RecurrencePattern,
  calculateTaskRewards,
  getDifficultyDisplay,
} from '@/types/task'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, formatFileSize } from '@/types/folder'
import { cn } from '@/lib/utils'

// Pending attachment types for creation
interface PendingFileAttachment {
  type: 'file'
  file: File
}

interface PendingChecklistAttachment {
  type: 'checklist'
  items: string[]
}

interface PendingLinkAttachment {
  type: 'link'
  url: string
  title?: string
  description?: string
}

type PendingAttachment = PendingFileAttachment | PendingChecklistAttachment | PendingLinkAttachment

interface CreateTaskFormProps {
  onSubmit: (task: CreateTaskInput, attachments?: PendingAttachment[]) => Promise<void>
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
    color: 'gray',
    priority: 3,
    difficulty: 3,
    due_date: '',
    is_recurring: false,
  })
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  
  // Attachment states
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [attachmentTab, setAttachmentTab] = useState<'file' | 'checklist' | 'link'>('checklist')
  const [checklistItems, setChecklistItems] = useState<string[]>([''])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
      }, pendingAttachments.length > 0 ? pendingAttachments : undefined)
      console.log('Task created successfully')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        color: 'gray',
        priority: 3,
        difficulty: 3,
        due_date: '',
        is_recurring: false,
      })
      setRecurrenceType('daily')
      setRecurrenceInterval(1)
      setSelectedDays([])
      setPendingAttachments([])
      setChecklistItems([''])
      setLinkUrl('')
      setLinkTitle('')
      
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

  // Attachment handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) addFileAttachment(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) addFileAttachment(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addFileAttachment = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`)
      return
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('File type not supported')
      return
    }
    setPendingAttachments(prev => [...prev, { type: 'file', file }])
  }

  const addChecklistAttachment = () => {
    const validItems = checklistItems.filter(item => item.trim())
    if (validItems.length === 0) {
      alert('Add at least one checklist item')
      return
    }
    setPendingAttachments(prev => [...prev, { type: 'checklist', items: validItems }])
    setChecklistItems([''])
  }

  const addLinkAttachment = () => {
    if (!linkUrl.trim()) {
      alert('URL is required')
      return
    }
    setPendingAttachments(prev => [...prev, { 
      type: 'link', 
      url: linkUrl.trim(), 
      title: linkTitle.trim() || undefined 
    }])
    setLinkUrl('')
    setLinkTitle('')
  }

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleChecklistItemChange = (index: number, value: string) => {
    const newItems = [...checklistItems]
    newItems[index] = value
    setChecklistItems(newItems)
  }

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, ''])
  }

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index))
    }
  }

  const defaultTrigger = (
    <Button variant="primary" className="w-full">
      <span className="mr-2">+</span>
      New Task
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900 dark:text-white">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Add a new task with attachments
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Task Details */}
            <div className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Task Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task name..."
                  className="h-10"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details about this task..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-md text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TASK_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.id as TaskColorId })}
                      className={cn(
                        'w-6 h-6 rounded-full transition-all',
                        color.bg,
                        formData.color === color.id
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-neutral-900 dark:ring-white scale-110'
                          : 'hover:scale-110'
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Difficulty & Rewards */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Difficulty
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, difficulty: level as TaskDifficulty })}
                        className={`flex-1 py-2 px-2 rounded-lg border transition-all text-sm ${
                          formData.difficulty === level
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white'
                            : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                        }`}
                      >
                        {getDifficultyDisplay(level as TaskDifficulty)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>💰</span>
                      <span className="text-neutral-900 dark:text-white font-medium">{rewards.gold} Gold</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>⭐</span>
                      <span className="text-neutral-900 dark:text-white font-medium">{rewards.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Due Date (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  min={getMinDateTime()}
                  className="h-10"
                />
                
                {/* Quick date buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickDate(24)}
                    className="flex-1 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(72)}
                    className="flex-1 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                  >
                    In 3 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(168)}
                    className="flex-1 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                  >
                    Next week
                  </button>
                  {formData.due_date && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, due_date: '' })}
                      className="py-1.5 px-3 text-xs bg-white dark:bg-neutral-900 text-red-500 dark:text-red-400 rounded border border-neutral-300 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-900 transition-colors"
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
                  />
                  <label
                    htmlFor="recurring"
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Recurring task
                  </label>
                </div>

                {/* Recurrence Options */}
                {formData.is_recurring && (
                  <div className="ml-6 space-y-2 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          Repeats
                        </label>
                        <Select value={recurrenceType} onValueChange={(val: 'daily' | 'weekly' | 'monthly') => setRecurrenceType(val)}>
                          <SelectTrigger className="text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          Every
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>

                    {/* Weekly Day Selection */}
                    {recurrenceType === 'weekly' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
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
                                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white'
                                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Attachments */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Attachments
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  Add files, checklists, or links to have everything ready when you work on this task
                </p>
              </div>

              {/* Attachment Tabs */}
              <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                {[
                  { id: 'checklist' as const, label: 'Checklist', icon: '✅' },
                  { id: 'link' as const, label: 'Link', icon: '🔗' },
                  { id: 'file' as const, label: 'File', icon: '📎' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAttachmentTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-colors',
                      attachmentTab === tab.id
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    )}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Attachment Input Area */}
              <div className="min-h-[150px]">
                {/* File Upload */}
                {attachmentTab === 'file' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleFileDrop}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors h-[150px] flex flex-col items-center justify-center',
                      dragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="text-3xl mb-2">📁</span>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Drop file or click to upload
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Max: {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </div>
                )}

                {/* Checklist */}
                {attachmentTab === 'checklist' && (
                  <div className="space-y-2">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-neutral-400 text-sm">☐</span>
                        <Input
                          placeholder={`Item ${index + 1}`}
                          value={item}
                          onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addChecklistItem()
                            }
                          }}
                          className="flex-1 h-9 bg-neutral-100 dark:bg-neutral-800"
                        />
                        {checklistItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addChecklistItem}
                        className="text-neutral-600 dark:text-neutral-400"
                      >
                        + Add item
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addChecklistAttachment}
                        disabled={checklistItems.every(i => !i.trim())}
                      >
                        Add Checklist
                      </Button>
                    </div>
                  </div>
                )}

                {/* Link */}
                {attachmentTab === 'link' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        URL *
                      </label>
                      <Input
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="h-9 bg-neutral-100 dark:bg-neutral-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Title (optional)
                      </label>
                      <Input
                        placeholder="Link title"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        className="h-9 bg-neutral-100 dark:bg-neutral-800"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLinkAttachment}
                      disabled={!linkUrl.trim()}
                    >
                      Add Link
                    </Button>
                  </div>
                )}
              </div>

              {/* Pending Attachments List */}
              {pendingAttachments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Added Attachments ({pendingAttachments.length})
                  </label>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                    {pendingAttachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm"
                      >
                        <span>
                          {attachment.type === 'file' && '📎'}
                          {attachment.type === 'checklist' && '✅'}
                          {attachment.type === 'link' && '🔗'}
                        </span>
                        <span className="flex-1 truncate text-neutral-900 dark:text-white">
                          {attachment.type === 'file' && attachment.file.name}
                          {attachment.type === 'checklist' && `Checklist (${attachment.items.length} items)`}
                          {attachment.type === 'link' && (attachment.title || attachment.url)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 h-10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 h-10"
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

export type { PendingAttachment, PendingFileAttachment, PendingChecklistAttachment, PendingLinkAttachment }
