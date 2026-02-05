'use client'

import { useState } from 'react'
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
import { 
  Folder, 
  CreateFolderInput, 
  FOLDER_ICONS, 
  FOLDER_COLORS 
} from '@/types/folder'
import { cn } from '@/lib/utils'

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreateFolderInput) => Promise<void>
  parentFolders?: Folder[]
}

export function CreateFolderDialog({ 
  isOpen, 
  onClose, 
  onSubmit,
  parentFolders = []
}: CreateFolderDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📁')
  const [selectedColor, setSelectedColor] = useState('#9333ea')
  const [parentFolderId, setParentFolderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Folder name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        color: selectedColor,
        parent_folder_id: parentFolderId,
      })
      
      // Reset form
      setName('')
      setDescription('')
      setSelectedIcon('📁')
      setSelectedColor('#9333ea')
      setParentFolderId(null)
      onClose()
    } catch (err) {
      setError('Failed to create folder')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setSelectedIcon('📁')
    setSelectedColor('#9333ea')
    setParentFolderId(null)
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[480px] max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pr-8">
          <DialogTitle className="text-neutral-900 dark:text-white flex items-center gap-2 text-base sm:text-lg">
            <span className="text-xl sm:text-2xl">{selectedIcon}</span>
            Create New Folder
          </DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-neutral-400 text-sm">
            Organize your quests into folders for better management
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4">
          {/* Folder Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">
              Folder Name
            </label>
            <Input
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">
              Description <span className="text-neutral-500">(optional)</span>
            </label>
            <Input
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">
              Icon
            </label>
            <div className="grid grid-cols-10 sm:grid-cols-10 gap-1.5">
              {FOLDER_ICONS.map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  title={label}
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-lg transition-all',
                    'hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95',
                    selectedIcon === icon
                      ? 'bg-neutral-200 dark:bg-neutral-700 ring-2 ring-[var(--accent-color,#9333ea)]'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {FOLDER_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-all active:scale-95',
                    'hover:scale-110',
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-neutral-900 dark:ring-white'
                      : ''
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Parent Folder (for nesting) */}
          {parentFolders.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-white">
                Parent Folder <span className="text-neutral-500">(optional)</span>
              </label>
              <select
                value={parentFolderId || ''}
                onChange={(e) => setParentFolderId(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white min-h-[2.75rem] sm:min-h-0 text-base sm:text-sm"
              >
                <option value="">No parent (root level)</option>
                {parentFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">
              Preview
            </label>
            <div 
              className="flex items-center gap-3 p-3 rounded-lg border-2"
              style={{ borderColor: selectedColor, backgroundColor: `${selectedColor}10` }}
            >
              <span className="text-2xl">{selectedIcon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900 dark:text-white truncate">
                  {name || 'Folder Name'}
                </p>
                {description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

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
            disabled={isSubmitting || !name.trim()}
            className="bg-[var(--accent-color,#9333ea)] hover:bg-[var(--accent-color-hover,#7e22ce)] text-white min-h-[2.75rem] sm:min-h-0 w-full sm:w-auto"
          >
            {isSubmitting ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
