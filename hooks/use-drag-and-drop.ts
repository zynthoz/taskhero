'use client'

import { useState, useCallback } from 'react'

export interface DragItem {
  type: 'task' | 'folder'
  id: string
  data?: any
}

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)

  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverTarget(null)
  }, [])

  const handleDragOver = useCallback((targetId: string) => {
    setDragOverTarget(targetId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverTarget(null)
  }, [])

  const handleDrop = useCallback((targetId: string, onDrop: (item: DragItem, targetId: string) => void) => {
    if (draggedItem) {
      onDrop(draggedItem, targetId)
    }
    setDraggedItem(null)
    setDragOverTarget(null)
  }, [draggedItem])

  return {
    draggedItem,
    dragOverTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
