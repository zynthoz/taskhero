'use client'

import { useState, useEffect } from 'react'
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
  UpdateFolderInput, 
  FOLDER_ICONS, 
  FOLDER_COLORS 
} from '@/types/folder'
import { cn } from '@/lib/utils'

interface EditFolderDialogProps {
  folder: Folder | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (folderId: string, input: UpdateFolderInput) => Promise<void>
  onDelete?: (folderId: string) => Promise<void>
  parentFolders?: Folder[]
}

export function EditFolderDialog({ 
  folder,
  isOpen, 
  onClose, 
  onSubmit,
  onDelete,
  parentFolders = []
}: EditFolderDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📁')
  const [selectedColor, setSelectedColor] = useState('#9333ea')
  const [parentFolderId, setParentFolderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Populate form when folder changes
  useEffect(() => {
    if (folder) {
      setName(folder.name)
      setDescription(folder.description || '')
      setSelectedIcon(folder.icon)
      setSelectedColor(folder.color)
      setParentFolderId(folder.parent_folder_id || null)
    }
  }, [folder])

  const handleSubmit = async () => {
    if (!folder) return
    if (!name.trim()) {
      setError('Folder name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(folder.id, {
        name: name.trim(),
        description: description.trim() || null,
        icon: selectedIcon,
        color: selectedColor,
        parent_folder_id: parentFolderId,
      })
      onClose()
    } catch (err) {
      setError('Failed to update folder')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!folder || !onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(folder.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (err) {
      setError('Failed to delete folder')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setError('')
    setShowDeleteConfirm(false)
    onClose()
  }

  // Filter out current folder and its children from parent options
  const availableParents = parentFolders.filter(f => f.id !== folder?.id)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">{selectedIcon}</span>
            Edit Folder
          </DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-neutral-400">
            Update folder settings and appearance
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mt-2">
                Delete "{folder?.name}"?
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Tasks in this folder will be moved to "All Quests". This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Folder'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Folder Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900 dark:text-white">
                  Folder Name
                </label>
                <Input
                  placeholder="Enter folder name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
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
                  className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900 dark:text-white">
                  Icon
                </label>
                <div className="grid grid-cols-10 gap-1.5">
                  {FOLDER_ICONS.map(({ icon, label }) => (
                    <button
                      key={icon}
                      type="button"
                      title={label}
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all',
                        'hover:bg-neutral-200 dark:hover:bg-neutral-700',
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
                        'w-10 h-10 rounded-lg transition-all',
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

              {/* Parent Folder */}
              {availableParents.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900 dark:text-white">
                    Parent Folder <span className="text-neutral-500">(optional)</span>
                  </label>
                  <select
                    value={parentFolderId || ''}
                    onChange={(e) => setParentFolderId(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="">No parent (root level)</option>
                    {availableParents.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {f.name}
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
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {name || 'Folder Name'}
                    </p>
                    {description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
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

            <DialogFooter className="flex justify-between">
              <div>
                {onDelete && !folder?.is_default && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Delete Folder
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim()}
                  className="bg-[var(--accent-color,#9333ea)] hover:bg-[var(--accent-color-hover,#7e22ce)] text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
