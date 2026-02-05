'use client'

import { useState, useEffect } from 'react'
import { Folder } from '@/types/folder'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FolderListProps {
  folders: Folder[]
  selectedFolderId?: string | null
  onSelectFolder: (folderId: string | null) => void
  onCreateFolder: () => void
  onEditFolder?: (folder: Folder) => void
  onDeleteFolder?: (folderId: string) => void
  showCounts?: boolean
  compact?: boolean
  onDrop?: (taskId: string, folderId: string | null) => void
}

// Detect if running on mobile/touch device
function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function FolderList({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  showCounts = true,
  compact = false,
  onDrop,
}: FolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  const toggleExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    setDragOverFolderId(folderId)
  }

  const handleDragLeave = () => {
    setDragOverFolderId(null)
  }

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId && onDrop) {
      onDrop(taskId, folderId)
    }
    setDragOverFolderId(null)
  }

  // Toggle action buttons on mobile tap
  const handleFolderTap = (folder: Folder) => {
    if (isTouch) {
      if (activeFolderId === folder.id) {
        // Second tap selects the folder
        onSelectFolder(folder.id)
        setActiveFolderId(null)
      } else {
        // First tap shows action buttons
        setActiveFolderId(folder.id)
      }
    } else {
      onSelectFolder(folder.id)
    }
  }

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const isDragOver = dragOverFolderId === folder.id
    const showActions = isTouch ? activeFolderId === folder.id : true

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'group flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg cursor-pointer transition-all',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            // Minimum touch target height for mobile
            'min-h-[2.75rem] sm:min-h-0',
            isSelected && 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-[var(--accent-color,#9333ea)]',
            isDragOver && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20',
            compact ? 'text-sm' : ''
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => handleFolderTap(folder)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
        >
          {/* Expand/collapse button for nested folders */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(folder.id)
              }}
              className="w-6 h-6 sm:w-4 sm:h-4 flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-6 sm:w-4" />
          )}

          {/* Folder icon with color */}
          <span 
            className="text-lg sm:text-base flex-shrink-0"
            style={{ filter: `drop-shadow(0 0 2px ${folder.color}40)` }}
          >
            {folder.icon}
          </span>

          {/* Folder name */}
          <span className={cn(
            'flex-1 truncate font-medium text-base sm:text-sm',
            isSelected 
              ? 'text-neutral-900 dark:text-white' 
              : 'text-neutral-700 dark:text-neutral-300'
          )}>
            {folder.name}
          </span>

          {/* Task count */}
          {showCounts && folder.task_count !== undefined && (
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              folder.task_count > 0
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                : 'text-neutral-400 dark:text-neutral-600'
            )}>
              {folder.task_count}
            </span>
          )}

          {/* Action buttons - always visible on mobile when active, hover on desktop */}
          <div className={cn(
            'flex items-center gap-1',
            isTouch 
              ? showActions ? 'flex' : 'hidden' 
              : 'hidden group-hover:flex'
          )}>
            {onEditFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditFolder(folder)
                  setActiveFolderId(null)
                }}
                className="p-2 sm:p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Edit folder"
              >
                ✏️
              </button>
            )}
            {onDeleteFolder && !folder.is_default && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${folder.name}"? Tasks will be moved to "All Quests".`)) {
                    onDeleteFolder(folder.id)
                  }
                  setActiveFolderId(null)
                }}
                className="p-2 sm:p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-600 min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Delete folder"
              >
                🗑️
              </button>
            )}
            {/* Show lock icon for default folders */}
            {folder.is_default && (
              <span 
                className="p-2 sm:p-1 text-neutral-400 min-w-[2.5rem] min-h-[2.5rem] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Default folder (cannot be deleted)"
              >
                🔒
              </span>
            )}
          </div>
        </div>

        {/* Nested children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {folder.children!.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* All Tasks option - mobile friendly touch target */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg cursor-pointer transition-all',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'min-h-[2.75rem] sm:min-h-0',
          selectedFolderId === null && 'bg-neutral-100 dark:bg-neutral-800',
          dragOverFolderId === null && selectedFolderId === null && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20',
          compact ? 'text-sm' : ''
        )}
        onClick={() => {
          onSelectFolder(null)
          setActiveFolderId(null)
        }}
        onDragOver={(e) => handleDragOver(e, null)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
      >
        <span className="w-6 sm:w-4" />
        <span className="text-lg sm:text-base">📋</span>
        <span className={cn(
          'flex-1 font-medium text-base sm:text-sm',
          selectedFolderId === null 
            ? 'text-neutral-900 dark:text-white' 
            : 'text-neutral-700 dark:text-neutral-300'
        )}>
          All Quests
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />

      {/* Folder list */}
      {folders.length > 0 ? (
        folders.map(folder => renderFolder(folder))
      ) : (
        <p className="px-3 py-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">
          No folders yet
        </p>
      )}

      {/* Create folder button - mobile friendly */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 mt-2 min-h-[2.75rem] sm:min-h-0 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        onClick={onCreateFolder}
      >
        <span>➕</span>
        Create Folder
      </Button>
    </div>
  )
}

// Compact folder selector for dropdowns
interface FolderSelectorProps {
  folders: Folder[]
  value: string | null
  onChange: (folderId: string | null) => void
  placeholder?: string
}

export function FolderSelector({
  folders,
  value,
  onChange,
  placeholder = 'Select folder...'
}: FolderSelectorProps) {
  const selectedFolder = folders.find(f => f.id === value)

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm"
    >
      <option value="">{placeholder}</option>
      {folders.map(folder => (
        <option key={folder.id} value={folder.id}>
          {folder.icon} {folder.name}
        </option>
      ))}
    </select>
  )
}

// Folder badge for display on task cards
interface FolderBadgeProps {
  folder: Folder
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function FolderBadge({ folder, onClick, size = 'sm' }: FolderBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border',
        onClick && 'cursor-pointer hover:opacity-80',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      style={{ 
        borderColor: folder.color,
        backgroundColor: `${folder.color}15`,
        color: folder.color
      }}
    >
      <span>{folder.icon}</span>
      <span className="font-medium">{folder.name}</span>
    </span>
  )
}
