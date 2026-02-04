'use client'

import { useEffect, useState, useRef } from 'react'
import { Notification, useNotifications, NotificationType } from '@/lib/notifications/notification-context'
import { cn } from '@/lib/utils'

// ============================================
// NOTIFICATION TOAST COMPONENT
// ============================================

interface NotificationToastProps {
  notification: Notification
  onDismiss: () => void
}

function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  // Progress bar countdown
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const startTime = Date.now()
      const duration = notification.duration

      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(remaining)

        if (remaining <= 0) {
          if (progressRef.current) clearInterval(progressRef.current)
        }
      }, 50)

      return () => {
        if (progressRef.current) clearInterval(progressRef.current)
      }
    }
  }, [notification.duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300)
  }

  // Style variants based on notification type
  const getTypeStyles = (type: NotificationType) => {
    const styles: Record<NotificationType, string> = {
      success: 'border-green-400/30 bg-green-50 dark:bg-green-950/30',
      error: 'border-red-400/30 bg-red-50 dark:bg-red-950/30',
      warning: 'border-amber-400/30 bg-amber-50 dark:bg-amber-950/30',
      info: 'border-blue-400/30 bg-blue-50 dark:bg-blue-950/30',
      achievement: 'border-purple-400/30 bg-purple-50 dark:bg-purple-950/30',
      'level-up': 'border-amber-400/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
      reward: 'border-green-400/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      streak: 'border-orange-400/30 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30',
      purchase: 'border-cyan-400/30 bg-cyan-50 dark:bg-cyan-950/30',
    }
    return styles[type]
  }

  const getProgressColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500',
      achievement: 'bg-purple-500',
      'level-up': 'bg-gradient-to-r from-amber-500 to-orange-500',
      reward: 'bg-gradient-to-r from-green-500 to-emerald-500',
      streak: 'bg-gradient-to-r from-orange-500 to-red-500',
      purchase: 'bg-cyan-500',
    }
    return colors[type]
  }

  const getTitleColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      success: 'text-green-700 dark:text-green-400',
      error: 'text-red-700 dark:text-red-400',
      warning: 'text-amber-700 dark:text-amber-400',
      info: 'text-blue-700 dark:text-blue-400',
      achievement: 'text-purple-700 dark:text-purple-400',
      'level-up': 'text-amber-700 dark:text-amber-400',
      reward: 'text-green-700 dark:text-green-400',
      streak: 'text-orange-700 dark:text-orange-400',
      purchase: 'text-cyan-700 dark:text-cyan-400',
    }
    return colors[type]
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm',
        'min-w-[320px] max-w-[400px]',
        'transition-all duration-300 ease-out',
        getTypeStyles(notification.type),
        isExiting 
          ? 'animate-notification-exit opacity-0 translate-x-full' 
          : 'animate-notification-enter'
      )}
    >
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 text-2xl animate-bounce-subtle">
            {notification.icon}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-bold text-sm', getTitleColor(notification.type))}>
              {notification.title}
            </h4>
            {notification.message && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                {notification.message}
              </p>
            )}

            {/* Reward data display */}
            {notification.data && (notification.data.xp || notification.data.gold) && (
              <div className="flex items-center gap-3 mt-2">
                {notification.data.xp && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900 dark:text-white">
                    <span className="animate-pulse-glow">⭐</span>
                    <span className="animate-count-up">+{notification.data.xp} XP</span>
                    {notification.data.multiplier && notification.data.multiplier > 1 && (
                      <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold ml-1">
                        {notification.data.multiplier}x 🔥
                      </span>
                    )}
                  </div>
                )}
                {notification.data.gold && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900 dark:text-white">
                    <span className="animate-spin-coin">💰</span>
                    <span className="animate-count-up">+{notification.data.gold}</span>
                  </div>
                )}
              </div>
            )}

            {/* Level display */}
            {notification.data?.level && (
              <div className="mt-2 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg animate-scale-bounce">
                  <span className="text-2xl font-bold text-white">{notification.data.level}</span>
                </div>
              </div>
            )}

            {/* Streak display */}
            {notification.data?.streakDays && (
              <div className="mt-2 flex items-center gap-2">
                <div className="text-3xl animate-flame">🔥</div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {notification.data.streakDays} Days
                </span>
              </div>
            )}
          </div>

          {/* Close button */}
          {notification.dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <span className="text-neutral-500 dark:text-neutral-400 text-sm">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={cn('h-full transition-all duration-100 ease-linear', getProgressColor(notification.type))}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// NOTIFICATION CONTAINER
// ============================================

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  // Group notifications by position
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right'
    if (!acc[position]) acc[position] = []
    acc[position].push(notification)
    return acc
  }, {} as Record<string, Notification[]>)

  const getPositionStyles = (position: string) => {
    const styles: Record<string, string> = {
      'top-right': 'top-4 right-4 flex-col',
      'top-left': 'top-4 left-4 flex-col',
      'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col items-center',
      'bottom-right': 'bottom-4 right-4 flex-col-reverse',
      'bottom-left': 'bottom-4 left-4 flex-col-reverse',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
    }
    return styles[position] || styles['top-right']
  }

  return (
    <>
      {Object.entries(groupedNotifications).map(([position, positionNotifications]) => (
        <div
          key={position}
          className={cn(
            'fixed z-[200] flex gap-3 pointer-events-none',
            getPositionStyles(position)
          )}
        >
          {positionNotifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationToast
                notification={notification}
                onDismiss={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
