'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({ checked, onChange, disabled = false, className }: ToggleSwitchProps) {
  return (
    <label className={cn("relative inline-flex items-center cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer"
        disabled={disabled}
      />
      <div 
        className={cn(
          "w-11 h-6 rounded-full transition-colors duration-200",
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform after:duration-200",
          "after:shadow-md",
          checked ? "after:translate-x-5" : "after:translate-x-0"
        )}
        style={{
          backgroundColor: checked ? 'var(--accent-color)' : '#525252'
        }}
      />
    </label>
  )
}
