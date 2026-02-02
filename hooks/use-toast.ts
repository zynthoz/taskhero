import { useState, useEffect } from 'react'

type ToastProps = {
  title: string
  description?: React.ReactNode
  variant?: 'default' | 'destructive'
  duration?: number
}

type Toast = ToastProps & {
  id: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { id, title, description, variant, duration }
    
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return {
    toast,
    toasts,
    dismiss,
  }
}
