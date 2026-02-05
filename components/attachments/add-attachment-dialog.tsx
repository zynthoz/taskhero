'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, formatFileSize } from '@/types/folder'
import { cn } from '@/lib/utils'

type AttachmentTab = 'file' | 'checklist' | 'link'

interface AddAttachmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddFile: (file: File) => Promise<void>
  onAddChecklist: (items: string[]) => Promise<void>
  onAddLink: (url: string, title?: string, description?: string) => Promise<void>
}

export function AddAttachmentDialog({
  isOpen,
  onClose,
  onAddFile,
  onAddChecklist,
  onAddLink,
}: AddAttachmentDialogProps) {
  const [activeTab, setActiveTab] = useState<AttachmentTab>('checklist')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<string[]>([''])

  // Link state
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkDescription, setLinkDescription] = useState('')

  const resetForm = () => {
    setSelectedFile(null)
    setChecklistItems([''])
    setLinkUrl('')
    setLinkTitle('')
    setLinkDescription('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // File handling
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const validateAndSetFile = (file: File) => {
    setError('')
    
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`)
      return
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('File type not supported')
      return
    }
    
    setSelectedFile(file)
  }

  // Checklist handling
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

  // Submit handlers
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      if (activeTab === 'file' && selectedFile) {
        await onAddFile(selectedFile)
      } else if (activeTab === 'checklist') {
        const validItems = checklistItems.filter(item => item.trim())
        if (validItems.length === 0) {
          setError('Add at least one checklist item')
          setIsSubmitting(false)
          return
        }
        await onAddChecklist(validItems)
      } else if (activeTab === 'link') {
        if (!linkUrl.trim()) {
          setError('URL is required')
          setIsSubmitting(false)
          return
        }
        await onAddLink(linkUrl.trim(), linkTitle.trim() || undefined, linkDescription.trim() || undefined)
      }
      
      handleClose()
    } catch (err) {
      setError('Failed to add attachment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs: { id: AttachmentTab; label: string; icon: string }[] = [
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'link', label: 'Link', icon: '🔗' },
    { id: 'file', label: 'File', icon: '📎' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[480px] max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pr-8">
          <DialogTitle className="text-neutral-900 dark:text-white text-base sm:text-lg">
            Add Attachment
          </DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-neutral-400 text-sm">
            Attach files, checklists, or links to your quest
          </DialogDescription>
        </DialogHeader>

        {/* Tabs - mobile friendly with proper touch targets */}
        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 px-2 sm:px-3 rounded-md text-sm font-medium transition-colors min-h-[2.75rem] sm:min-h-0',
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white active:bg-white/50 dark:active:bg-neutral-600/50'
              )}
            >
              <span className="text-base sm:text-sm">{tab.icon}</span>
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 py-4">
          {/* File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors',
                  dragActive
                    ? 'border-[var(--accent-color,#9333ea)] bg-purple-50 dark:bg-purple-950/20'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 active:border-[var(--accent-color,#9333ea)]'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <span className="text-3xl sm:text-4xl">📄</span>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base break-all px-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                      className="min-h-[2.75rem] sm:min-h-0"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-3xl sm:text-4xl">📁</span>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                      Tap to upload file
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-500">
                      Max size: {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-neutral-400 flex-shrink-0">☐</span>
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
                    className="flex-1 bg-neutral-100 dark:bg-neutral-800 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
                  />
                  {checklistItems.length > 1 && (
                    <button
                      onClick={() => removeChecklistItem(index)}
                      className="p-2 sm:p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addChecklistItem}
                className="text-neutral-600 dark:text-neutral-400 min-h-[2.75rem] sm:min-h-0"
              >
                + Add item
              </Button>
            </div>
          )}

          {/* Link */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900 dark:text-white">
                  URL <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
                  type="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900 dark:text-white">
                  Title <span className="text-neutral-500">(optional)</span>
                </label>
                <Input
                  placeholder="Link title"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900 dark:text-white">
                  Description <span className="text-neutral-500">(optional)</span>
                </label>
                <Input
                  placeholder="Brief description"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 mt-3">{error}</p>
          )}
        </div>

        {/* Footer - mobile optimized */}
        <DialogFooter className="flex-shrink-0 flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="min-h-[2.75rem] sm:min-h-0 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (activeTab === 'file' && !selectedFile) ||
              (activeTab === 'checklist' && checklistItems.every(i => !i.trim())) ||
              (activeTab === 'link' && !linkUrl.trim())
            }
            className="bg-[var(--accent-color,#9333ea)] hover:bg-[var(--accent-color-hover,#7e22ce)] text-white min-h-[2.75rem] sm:min-h-0 w-full sm:w-auto"
          >
            {isSubmitting ? 'Adding...' : 'Add Attachment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
