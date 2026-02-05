'use client'

import { useState, useEffect } from 'react'
import { TaskAttachment, ChecklistItem, getFileIcon, formatFileSize } from '@/types/folder'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

// Extended type to include signed URL from server
interface AttachmentWithSignedUrl extends TaskAttachment {
  signed_url?: string
}

// Detect if running on mobile/touch device
function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

interface AttachmentListProps {
  attachments: AttachmentWithSignedUrl[]
  onToggleChecklistItem?: (attachmentId: string, itemId: string, checked: boolean) => Promise<void>
  onAddChecklistItem?: (attachmentId: string, text: string) => Promise<void>
  onDeleteChecklistItem?: (attachmentId: string, itemId: string) => Promise<void>
  onDeleteAttachment?: (attachmentId: string) => Promise<void>
  onPreviewFile?: (attachment: AttachmentWithSignedUrl) => void
  readOnly?: boolean
}

export function AttachmentList({
  attachments,
  onToggleChecklistItem,
  onAddChecklistItem,
  onDeleteChecklistItem,
  onDeleteAttachment,
  onPreviewFile,
  readOnly = false,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {attachments.map(attachment => (
        <AttachmentItem
          key={attachment.id}
          attachment={attachment}
          onToggleChecklistItem={onToggleChecklistItem}
          onAddChecklistItem={onAddChecklistItem}
          onDeleteChecklistItem={onDeleteChecklistItem}
          onDeleteAttachment={onDeleteAttachment}
          onPreviewFile={onPreviewFile}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

interface AttachmentItemProps {
  attachment: AttachmentWithSignedUrl
  onToggleChecklistItem?: (attachmentId: string, itemId: string, checked: boolean) => Promise<void>
  onAddChecklistItem?: (attachmentId: string, text: string) => Promise<void>
  onDeleteChecklistItem?: (attachmentId: string, itemId: string) => Promise<void>
  onDeleteAttachment?: (attachmentId: string) => Promise<void>
  onPreviewFile?: (attachment: AttachmentWithSignedUrl) => void
  readOnly?: boolean
}

function AttachmentItem({
  attachment,
  onToggleChecklistItem,
  onAddChecklistItem,
  onDeleteChecklistItem,
  onDeleteAttachment,
  onPreviewFile,
  readOnly = false,
}: AttachmentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  const handleDelete = async () => {
    if (!onDeleteAttachment) return
    if (!confirm('Delete this attachment?')) return
    setIsDeleting(true)
    try {
      await onDeleteAttachment(attachment.id)
    } finally {
      setIsDeleting(false)
    }
  }

  // Toggle actions visibility on mobile tap
  const handleTap = () => {
    if (isTouch && !readOnly) {
      setShowActions(!showActions)
    }
  }

  return (
    <div 
      className="group rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-3"
      onClick={handleTap}
    >
      {attachment.attachment_type === 'file' && (
        <FileAttachment 
          attachment={attachment} 
          onDelete={!readOnly ? handleDelete : undefined}
          onPreview={onPreviewFile}
          isDeleting={isDeleting}
          showActions={isTouch ? showActions : true}
          isTouch={isTouch}
        />
      )}
      {attachment.attachment_type === 'checklist' && (
        <ChecklistAttachment
          attachment={attachment}
          onToggleItem={onToggleChecklistItem}
          onAddItem={onAddChecklistItem}
          onDeleteItem={onDeleteChecklistItem}
          onDelete={!readOnly ? handleDelete : undefined}
          isDeleting={isDeleting}
          readOnly={readOnly}
          showActions={isTouch ? showActions : true}
          isTouch={isTouch}
        />
      )}
      {attachment.attachment_type === 'link' && (
        <LinkAttachment 
          attachment={attachment} 
          onDelete={!readOnly ? handleDelete : undefined}
          isDeleting={isDeleting}
          showActions={isTouch ? showActions : true}
          isTouch={isTouch}
        />
      )}
    </div>
  )
}

// File attachment display
interface FileAttachmentProps {
  attachment: AttachmentWithSignedUrl
  onDelete?: () => void
  onPreview?: (attachment: AttachmentWithSignedUrl) => void
  isDeleting?: boolean
  showActions?: boolean
  isTouch?: boolean
}

function FileAttachment({ attachment, onDelete, onPreview, isDeleting, showActions = true, isTouch = false }: FileAttachmentProps) {
  const icon = getFileIcon(attachment.file_type || '')
  const canPreview = attachment.file_type?.startsWith('image/') || 
                      attachment.file_type === 'application/pdf' ||
                      attachment.file_type?.startsWith('text/')
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview?.(attachment)
          }}
          className={cn(
            'font-medium text-neutral-900 dark:text-white truncate block text-left w-full text-sm sm:text-base',
            canPreview && onPreview && 'hover:text-[var(--accent-color,#9333ea)] cursor-pointer active:text-[var(--accent-color,#9333ea)]'
          )}
        >
          {attachment.file_name}
        </button>
        <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
          <span>{formatFileSize(attachment.file_size || 0)}</span>
          {canPreview && onPreview && (
            <span className="text-[var(--accent-color,#9333ea)]">• Tap to preview</span>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          disabled={isDeleting}
          className={cn(
            'p-2 sm:p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-600 transition-opacity min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center',
            isTouch 
              ? showActions ? 'opacity-100' : 'opacity-0'
              : 'opacity-0 group-hover:opacity-100'
          )}
          title="Delete file"
        >
          🗑️
        </button>
      )}
    </div>
  )
}

// Checklist attachment display
interface ChecklistAttachmentProps {
  attachment: TaskAttachment
  onToggleItem?: (attachmentId: string, itemId: string, checked: boolean) => Promise<void>
  onAddItem?: (attachmentId: string, text: string) => Promise<void>
  onDeleteItem?: (attachmentId: string, itemId: string) => Promise<void>
  onDelete?: () => void
  isDeleting?: boolean
  readOnly?: boolean
  showActions?: boolean
  isTouch?: boolean
}

function ChecklistAttachment({
  attachment,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onDelete,
  isDeleting,
  readOnly,
  showActions = true,
  isTouch = false,
}: ChecklistAttachmentProps) {
  const [newItemText, setNewItemText] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  
  const items = (attachment.checklist_items || []) as ChecklistItem[]
  const completedCount = items.filter(i => i.checked).length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  const handleAddItem = async () => {
    if (!onAddItem || !newItemText.trim()) return
    setIsAdding(true)
    try {
      await onAddItem(attachment.id, newItemText.trim())
      setNewItemText('')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">✅</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">
            Checklist
          </span>
          <span className="text-xs text-neutral-500">
            {completedCount}/{items.length}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={isDeleting}
            className={cn(
              'p-2 sm:p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-600 transition-opacity text-sm min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center',
              isTouch 
                ? showActions ? 'opacity-100' : 'opacity-0'
                : 'opacity-0 group-hover:opacity-100'
            )}
            title="Delete checklist"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-1">
        {items.map(item => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onToggle={onToggleItem ? (checked) => onToggleItem(attachment.id, item.id, checked) : undefined}
            onDelete={onDeleteItem ? () => onDeleteItem(attachment.id, item.id) : undefined}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Add new item */}
      {!readOnly && onAddItem && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Add item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="text-sm h-8 bg-white dark:bg-neutral-800"
          />
          <Button
            size="sm"
            onClick={handleAddItem}
            disabled={isAdding || !newItemText.trim()}
            className="h-8 px-3"
          >
            Add
          </Button>
        </div>
      )}
    </div>
  )
}

interface ChecklistItemRowProps {
  item: ChecklistItem
  onToggle?: (checked: boolean) => Promise<void>
  onDelete?: () => Promise<void>
  readOnly?: boolean
}

function ChecklistItemRow({ item, onToggle, onDelete, readOnly }: ChecklistItemRowProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = async () => {
    if (!onToggle || readOnly) return
    setIsToggling(true)
    try {
      await onToggle(!item.checked)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group/item flex items-center gap-2 py-2 sm:py-1 px-1 -mx-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800/50 min-h-[2.75rem] sm:min-h-0">
      <Checkbox
        checked={item.checked}
        onCheckedChange={handleToggle}
        disabled={isToggling || readOnly}
        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 w-5 h-5 sm:w-4 sm:h-4"
      />
      <span className={cn(
        'flex-1 text-sm break-words',
        item.checked && 'line-through text-neutral-500'
      )}>
        {item.text}
      </span>
      {onDelete && !readOnly && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="sm:opacity-0 sm:group-hover/item:opacity-100 p-2 sm:p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 transition-opacity min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Link attachment display
interface LinkAttachmentProps {
  attachment: TaskAttachment
  onDelete?: () => void
  isDeleting?: boolean
  showActions?: boolean
  isTouch?: boolean
}

function LinkAttachment({ attachment, onDelete, isDeleting, showActions = true, isTouch = false }: LinkAttachmentProps) {
  const displayUrl = attachment.link_url?.replace(/^https?:\/\//, '').slice(0, 40) || ''
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl sm:text-2xl flex-shrink-0">🔗</span>
      <div className="flex-1 min-w-0">
        <a
          href={attachment.link_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-neutral-900 dark:text-white hover:text-[var(--accent-color,#9333ea)] active:text-[var(--accent-color,#9333ea)] truncate block text-sm sm:text-base"
        >
          {attachment.link_title || displayUrl}
        </a>
        {attachment.link_description && (
          <p className="text-xs text-neutral-500 line-clamp-2 sm:truncate">
            {attachment.link_description}
          </p>
        )}
        {!attachment.link_title && (
          <p className="text-xs text-neutral-400 truncate">
            {displayUrl}
          </p>
        )}
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          disabled={isDeleting}
          className={cn(
            'p-2 sm:p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-600 transition-opacity min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center',
            isTouch 
              ? showActions ? 'opacity-100' : 'opacity-0'
              : 'opacity-0 group-hover:opacity-100'
          )}
          title="Delete link"
        >
          🗑️
        </button>
      )}
    </div>
  )
}
