'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/types/folder'

interface StorageStats {
  totalFiles: number
  totalBytes: number
  filesByType: {
    images: number
    documents: number
    text: number
    archives: number
    other: number
  }
  bytesByType: {
    images: number
    documents: number
    text: number
    archives: number
    other: number
  }
}

interface StorageAnalyticsProps {
  userId: string
  maxStorageBytes?: number // Optional storage quota
}

export function StorageAnalytics({ userId, maxStorageBytes = 1073741824 }: StorageAnalyticsProps) {
  const [stats, setStats] = useState<StorageStats>({
    totalFiles: 0,
    totalBytes: 0,
    filesByType: { images: 0, documents: 0, text: 0, archives: 0, other: 0 },
    bytesByType: { images: 0, documents: 0, text: 0, archives: 0, other: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStorageStats()
  }, [userId])

  const loadStorageStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/storage/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading storage stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const storagePercentage = (stats.totalBytes / maxStorageBytes) * 100

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'images':
        return 'bg-blue-500'
      case 'documents':
        return 'bg-green-500'
      case 'text':
        return 'bg-yellow-500'
      case 'archives':
        return 'bg-purple-500'
      default:
        return 'bg-neutral-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'images':
        return '🖼️'
      case 'documents':
        return '📄'
      case 'text':
        return '📝'
      case 'archives':
        return '📦'
      default:
        return '📎'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
          Storage Usage
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatFileSize(stats.totalBytes)} of {formatFileSize(maxStorageBytes)} used
        </p>
      </div>

      {/* Storage Progress Bar */}
      <div className="space-y-2">
        <Progress value={storagePercentage} className="h-2" />
        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span>{storagePercentage.toFixed(1)}% used</span>
          <span>{formatFileSize(maxStorageBytes - stats.totalBytes)} remaining</span>
        </div>
      </div>

      {/* Total Files */}
      <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Total Files
        </span>
        <span className="text-lg font-bold text-neutral-900 dark:text-white">
          {stats.totalFiles}
        </span>
      </div>

      {/* Breakdown by Type */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Files by Type
        </h4>

        {Object.entries(stats.filesByType).map(([type, count]) => {
          const bytes = stats.bytesByType[type as keyof typeof stats.bytesByType]
          const percentage = stats.totalBytes > 0 ? (bytes / stats.totalBytes) * 100 : 0

          if (count === 0) return null

          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{getTypeIcon(type)}</span>
                  <span className="capitalize text-neutral-700 dark:text-neutral-300">
                    {type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {count} {count === 1 ? 'file' : 'files'}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white min-w-[60px] text-right">
                    {formatFileSize(bytes)}
                  </span>
                </div>
              </div>
              <div className="relative h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${getTypeColor(type)} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}

        {stats.totalFiles === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
            No files uploaded yet
          </p>
        )}
      </div>

      {/* Storage Warning */}
      {storagePercentage > 80 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ You're running low on storage space. Consider deleting old attachments.
          </p>
        </div>
      )}

      {storagePercentage >= 100 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            🚫 Storage limit reached. Delete some files to upload more.
          </p>
        </div>
      )}
    </Card>
  )
}
