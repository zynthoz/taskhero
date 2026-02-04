'use client'

import { useState } from 'react'
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

export function FilePreviewModal({
  attachment,
  isOpen,
  onClose,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!attachment || attachment.attachment_type !== 'file') {
    return null
  }

  const isImage = attachment.file_type?.startsWith('image/')
  const isPDF = attachment.file_type === 'application/pdf'
  const isText = attachment.file_type?.startsWith('text/')

  // Use signed_url for private bucket access, fall back to file_url
  const previewUrl = attachment.signed_url || attachment.file_url

  const handleDownload = () => {
    if (!previewUrl) return
    window.open(previewUrl, '_blank')
    onDownload?.()
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="truncate">{attachment.file_name}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Action buttons - separated from close button */}
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <span>⬇️</span>
            Download
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1"
            >
              <span>🗑️</span>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* File metadata */}
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="font-medium">Size:</span> {formatFileSize(attachment.file_size || 0)}
            </div>
            <div>
              <span className="font-medium">Type:</span> {attachment.file_type}
            </div>
            <div>
              <span className="font-medium">Uploaded:</span>{' '}
              {new Date(attachment.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Preview area */}
          <div className="max-h-[60vh] overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            {isImage && previewUrl && (
              <div className="p-4 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={previewUrl}
                  alt={attachment.file_name || 'Preview'}
                  className="max-w-full max-h-[calc(60vh-2rem)] object-contain rounded"
                />
              </div>
            )}

            {isPDF && previewUrl && (
              <div className="w-full h-[60vh]">
                <iframe
                  src={`${previewUrl}#view=FitH`}
                  className="w-full h-full rounded"
                  title={attachment.file_name || 'PDF Preview'}
                />
              </div>
            )}

            {isText && previewUrl && (
              <div className="p-4">
                <iframe
                  src={previewUrl}
                  className="w-full h-[50vh] rounded border-0"
                  title={attachment.file_name || 'Text Preview'}
                />
              </div>
            )}

            {(!isImage && !isPDF && !isText) || !previewUrl ? (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">📄</span>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Preview not available for this file type
                </p>
                {previewUrl && (
                  <Button onClick={handleDownload} variant="outline">
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
