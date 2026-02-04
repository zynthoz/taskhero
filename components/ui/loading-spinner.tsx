'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-neutral-300 dark:border-neutral-600 border-t-[var(--accent-color,#9333ea)]',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">{text}</p>
      )}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-4',
      'animate-pulse',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded bg-neutral-300 dark:bg-neutral-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-neutral-300 dark:bg-neutral-700" />
          <div className="h-3 w-1/2 rounded bg-neutral-300 dark:bg-neutral-700" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <div className="h-6 w-20 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Loading your adventure...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-neutral-200 dark:border-neutral-800 animate-pulse" />
        {/* Inner spinner */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--accent-color,#9333ea)] animate-spin" />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[var(--accent-color,#9333ea)] animate-pulse" />
        </div>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm animate-pulse">{message}</p>
    </div>
  )
}
