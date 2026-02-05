'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TaskAttachment, formatFileSize } from '@/types/folder'

// Extended type to include signed URL from server
interface AttachmentWithSignedUrl extends TaskAttachment {
  signed_url?: string
}

interface FilePreviewModalProps {
  attachment: AttachmentWithSignedUrl | null
  isOpen: boolean
  onClose: () => void
  onDownload?: () => void
  onDelete?: () => void
}

// Detect if running on mobile device
function isMobileDevice() {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
}

export function FilePreviewModal({
  attachment,
  isOpen,
  onClose,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())
    const handleResize = () => setIsMobile(isMobileDevice())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!attachment || attachment.attachment_type !== 'file') {
    return null
  }

  const isImage = attachment.file_type?.startsWith('image/')
  const isPDF = attachment.file_type === 'application/pdf'
  const isText = attachment.file_type?.startsWith('text/')

  // Use signed_url for private bucket access, fall back to file_url
  const previewUrl = attachment.signed_url || attachment.file_url

  // Force download using fetch and blob for mobile compatibility
  const handleDownload = async () => {
    if (!previewUrl) return
    
    try {
      // For mobile: use fetch to get blob and trigger download
      if (isMobile) {
        const response = await fetch(previewUrl)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = attachment.file_name || 'download'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      } else {
        // For desktop: open in new tab
        window.open(previewUrl, '_blank')
      }
      onDownload?.()
    } catch (error) {
      // Fallback: open in new tab
      window.open(previewUrl, '_blank')
      onDownload?.()
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-[800px] max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pr-8">
          <DialogTitle className="text-neutral-900 dark:text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl sm:text-2xl flex-shrink-0">📄</span>
              <span className="truncate text-base sm:text-lg">{attachment.file_name}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Action buttons - mobile optimized with proper touch targets */}
        <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1.5 min-h-[2.75rem] sm:min-h-0 px-3 sm:px-4 text-sm"
          >
            <span>⬇️</span>
            <span className="hidden xs:inline">Download</span>
            <span className="xs:hidden">Save</span>
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 min-h-[2.75rem] sm:min-h-0 px-3 sm:px-4 text-sm"
            >
              <span>🗑️</span>
              <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </Button>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
          {/* File metadata - responsive layout */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1">
              <span className="font-medium">Size:</span>
              <span>{formatFileSize(attachment.file_size || 0)}</span>
            </div>
            <div className="flex items-center gap-1 max-w-full">
              <span className="font-medium flex-shrink-0">Type:</span>
              <span className="truncate">{attachment.file_type}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Uploaded:</span>
              <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Preview area - responsive with proper scrolling */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden">
            {isImage && previewUrl && (
              <div className="p-2 sm:p-4 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 overflow-auto max-h-[50vh] sm:max-h-[55vh]">
                <img
                  src={previewUrl}
                  alt={attachment.file_name || 'Preview'}
                  className="max-w-full h-auto object-contain rounded"
                  style={{ maxHeight: isMobile ? '45vh' : '50vh' }}
                />
              </div>
            )}

            {isPDF && previewUrl && (
              <div className="w-full" style={{ height: isMobile ? '50vh' : '55vh' }}>
                {isMobile ? (
                  // Mobile: Show download prompt instead of iframe (better UX)
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-5xl mb-4">📄</span>
                    <p className="text-neutral-700 dark:text-neutral-300 font-medium mb-2">
                      PDF Preview
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
                      Tap download to view in your PDF reader
                    </p>
                    <Button onClick={handleDownload} className="min-h-[2.75rem]">
                      ⬇️ Download PDF
                    </Button>
                  </div>
                ) : (
                  <iframe
                    src={`${previewUrl}#view=FitH`}
                    className="w-full h-full rounded"
                    title={attachment.file_name || 'PDF Preview'}
                  />
                )}
              </div>
            )}

            {isText && previewUrl && (
              <div className="p-2 sm:p-4 overflow-auto max-h-[50vh] sm:max-h-[55vh]">
                <iframe
                  src={previewUrl}
                  className="w-full rounded border-0"
                  style={{ height: isMobile ? '40vh' : '45vh' }}
                  title={attachment.file_name || 'Text Preview'}
                />
              </div>
            )}

            {(!isImage && !isPDF && !isText) || !previewUrl ? (
              <div className="p-8 sm:p-12 text-center">
                <span className="text-5xl sm:text-6xl mb-4 block">📄</span>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-sm sm:text-base">
                  Preview not available for this file type
                </p>
                {previewUrl && (
                  <Button onClick={handleDownload} variant="outline" className="min-h-[2.75rem]">
                    Download to View
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
