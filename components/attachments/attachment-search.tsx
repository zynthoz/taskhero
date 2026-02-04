'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { TaskAttachment } from '@/types/folder'
import { getFileIcon, formatFileSize } from '@/types/folder'

interface AttachmentSearchProps {
  taskId?: string // Optional - search within specific task
  onSelect?: (attachment: TaskAttachment) => void
}

interface SearchResult extends TaskAttachment {
  task_title?: string
  match_type?: 'file_name' | 'checklist_item' | 'link_title' | 'link_description'
}

export function AttachmentSearch({ taskId, onSelect }: AttachmentSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (query.length > 0) {
      searchAttachments()
    } else {
      setResults([])
    }
  }, [query, taskId])

  const searchAttachments = async () => {
    setIsSearching(true)
    try {
      const params = new URLSearchParams({ query })
      if (taskId) {
        params.append('taskId', taskId)
      }

      const response = await fetch(`/api/attachments/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      }
    } catch (error) {
      console.error('Error searching attachments:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const renderResult = (result: SearchResult) => {
    switch (result.attachment_type) {
      case 'file':
        return (
          <button
            onClick={() => onSelect?.(result)}
            className="w-full p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{getFileIcon(result.file_type || '')}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white truncate">
                  {highlightMatch(result.file_name || '', query)}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  <span>{result.file_type}</span>
                  <span>•</span>
                  <span>{formatFileSize(result.file_size || 0)}</span>
                  {result.task_title && (
                    <>
                      <span>•</span>
                      <span className="truncate">{result.task_title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        )

      case 'checklist':
        const matchingItems = result.checklist_items?.filter((item: any) =>
          item.text.toLowerCase().includes(query.toLowerCase())
        )
        return (
          <button
            onClick={() => onSelect?.(result)}
            className="w-full p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">☑️</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white">
                  Checklist
                </p>
                {matchingItems && matchingItems.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {matchingItems.slice(0, 3).map((item: any, idx: number) => (
                      <li key={idx} className="text-sm text-neutral-600 dark:text-neutral-400">
                        • {highlightMatch(item.text, query)}
                      </li>
                    ))}
                    {matchingItems.length > 3 && (
                      <li className="text-xs text-neutral-500 dark:text-neutral-500">
                        +{matchingItems.length - 3} more items
                      </li>
                    )}
                  </ul>
                )}
                {result.task_title && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                    Task: {result.task_title}
                  </p>
                )}
              </div>
            </div>
          </button>
        )

      case 'link':
        return (
          <button
            onClick={() => onSelect?.(result)}
            className="w-full p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🔗</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white truncate">
                  {highlightMatch(result.link_title || 'Link', query)}
                </p>
                {result.link_description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">
                    {highlightMatch(result.link_description, query)}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  <span className="truncate">{result.link_url}</span>
                  {result.task_title && (
                    <>
                      <span>•</span>
                      <span className="truncate">{result.task_title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search attachments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          🔍
        </span>
      </div>

      {/* Search Results */}
      {query && (
        <Card className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-neutral-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {results.map((result) => (
                <div key={result.id}>{renderResult(result)}</div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-neutral-500">No attachments found</p>
              <p className="text-xs text-neutral-400 mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Results Count */}
      {query && !isSearching && results.length > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Found {results.length} {results.length === 1 ? 'attachment' : 'attachments'}
        </p>
      )}
    </div>
  )
}
