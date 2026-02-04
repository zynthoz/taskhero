'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// ============================================
// NOTIFICATION TYPES & INTERFACES
// ============================================

export type NotificationType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'achievement' 
  | 'level-up' 
  | 'reward' 
  | 'streak'
  | 'purchase'

export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'top-center' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'bottom-center'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  icon?: string
  data?: {
    xp?: number
    gold?: number
    level?: number
    streakDays?: number
    achievementName?: string
    itemName?: string
    multiplier?: number
  }
  showConfetti?: boolean
  position?: NotificationPosition
  dismissible?: boolean
  timestamp: number
}

export interface NotificationOptions {
  type?: NotificationType
  title: string
  message?: string
  duration?: number
  icon?: string
  data?: Notification['data']
  showConfetti?: boolean
  position?: NotificationPosition
  dismissible?: boolean
}

interface NotificationContextValue {
  notifications: Notification[]
  addNotification: (options: NotificationOptions) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  // Convenience methods for common notification types
  success: (title: string, message?: string) => string
  error: (title: string, message?: string) => string
  warning: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
  // Game-specific notifications
  showReward: (xp: number, gold: number, multiplier?: number) => string
  showLevelUp: (newLevel: number) => string
  showAchievement: (achievementName: string, icon?: string) => string
  showStreakMilestone: (streakDays: number) => string
  showPurchase: (itemName: string, gold: number) => string
}

// ============================================
// NOTIFICATION CONTEXT
// ============================================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

// Default durations for different notification types
const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
  achievement: 5000,
  'level-up': 6000,
  reward: 3000,
  streak: 5000,
  purchase: 3000,
}

// Default icons for different notification types
const DEFAULT_ICONS: Record<NotificationType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  achievement: '🏆',
  'level-up': '⚔️',
  reward: '🎉',
  streak: '🔥',
  purchase: '🛒',
}

// ============================================
// NOTIFICATION PROVIDER
// ============================================

interface NotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
  defaultPosition?: NotificationPosition
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5,
  defaultPosition = 'top-right'
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addNotification = useCallback((options: NotificationOptions): string => {
    const id = generateId()
    const type = options.type || 'info'
    
    const notification: Notification = {
      id,
      type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATIONS[type],
      icon: options.icon ?? DEFAULT_ICONS[type],
      data: options.data,
      showConfetti: options.showConfetti ?? false,
      position: options.position ?? defaultPosition,
      dismissible: options.dismissible ?? true,
      timestamp: Date.now(),
    }

    setNotifications(prev => {
      const updated = [notification, ...prev]
      // Limit max notifications
      return updated.slice(0, maxNotifications)
    })

    // Auto-dismiss if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }, [defaultPosition, maxNotifications])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'success', title, message })
  }, [addNotification])

  const error = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'error', title, message })
  }, [addNotification])

  const warning = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'warning', title, message })
  }, [addNotification])

  const info = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'info', title, message })
  }, [addNotification])

  // Game-specific notifications
  const showReward = useCallback((xp: number, gold: number, multiplier?: number) => {
    return addNotification({
      type: 'reward',
      title: 'Quest Complete!',
      message: multiplier && multiplier > 1 ? `${multiplier}x Streak Bonus!` : undefined,
      data: { xp, gold, multiplier },
      showConfetti: true,
    })
  }, [addNotification])

  const showLevelUp = useCallback((newLevel: number) => {
    return addNotification({
      type: 'level-up',
      title: 'LEVEL UP!',
      message: `You are now Level ${newLevel}!`,
      data: { level: newLevel },
      showConfetti: true,
      duration: 6000,
    })
  }, [addNotification])

  const showAchievement = useCallback((achievementName: string, icon?: string) => {
    return addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievementName,
      icon: icon || '🏆',
      data: { achievementName },
      showConfetti: true,
    })
  }, [addNotification])

  const showStreakMilestone = useCallback((streakDays: number) => {
    return addNotification({
      type: 'streak',
      title: 'Streak Milestone!',
      message: `${streakDays} day streak achieved!`,
      data: { streakDays },
      showConfetti: true,
    })
  }, [addNotification])

  const showPurchase = useCallback((itemName: string, gold: number) => {
    return addNotification({
      type: 'purchase',
      title: 'Item Purchased!',
      message: itemName,
      data: { itemName, gold },
      icon: '🎁',
    })
  }, [addNotification])

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    showReward,
    showLevelUp,
    showAchievement,
    showStreakMilestone,
    showPurchase,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
