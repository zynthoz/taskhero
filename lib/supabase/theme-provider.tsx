'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-provider'
import { createClient } from './client'

type Theme = 'dark' | 'light' | 'auto'
type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink'
type FontSize = 'small' | 'medium' | 'large'

interface ThemeContextType {
  theme: Theme
  accentColor: AccentColor
  resolvedTheme: 'dark' | 'light'
  fontSize: FontSize
  reduceMotion: boolean
  highContrast: boolean
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
  setFontSize: (size: FontSize) => void
  setReduceMotion: (reduce: boolean) => void
  setHighContrast: (contrast: boolean) => void
  reloadPreferences: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const accentColorClasses = {
  purple: {
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    border: 'border-purple-500',
    text: 'text-purple-400',
    bgLight: 'bg-purple-950/30',
  },
  blue: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    border: 'border-blue-500',
    text: 'text-blue-400',
    bgLight: 'bg-blue-950/30',
  },
  green: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700',
    border: 'border-green-500',
    text: 'text-green-400',
    bgLight: 'bg-green-950/30',
  },
  orange: {
    bg: 'bg-orange-600',
    hover: 'hover:bg-orange-700',
    border: 'border-orange-500',
    text: 'text-orange-400',
    bgLight: 'bg-orange-950/30',
  },
  red: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    border: 'border-red-500',
    text: 'text-red-400',
    bgLight: 'bg-red-950/30',
  },
  pink: {
    bg: 'bg-pink-600',
    hover: 'hover:bg-pink-700',
    border: 'border-pink-500',
    text: 'text-pink-400',
    bgLight: 'bg-pink-950/30',
  },
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<Theme>('dark')
  const [accentColor, setAccentColorState] = useState<AccentColor>('purple')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')
  const [fontSize, setFontSizeState] = useState<FontSize>('medium')
  const [reduceMotion, setReduceMotionState] = useState(false)
  const [highContrast, setHighContrastState] = useState(false)

  useEffect(() => {
    if (user) {
      loadThemePreferences()
    }
  }, [user])

  useEffect(() => {
    const resolved = theme === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme
    
    setResolvedTheme(resolved)
    
    const root = document.documentElement
    
    // Apply theme
    root.classList.remove('dark', 'light')
    root.classList.add(resolved)
    
    // Apply accent color CSS variables
    const colors = {
      purple: { main: '#9333ea', hover: '#7e22ce', rgb: '147, 51, 234' },
      blue: { main: '#3b82f6', hover: '#2563eb', rgb: '59, 130, 246' },
      green: { main: '#22c55e', hover: '#16a34a', rgb: '34, 197, 94' },
      orange: { main: '#f97316', hover: '#ea580c', rgb: '249, 115, 22' },
      red: { main: '#ef4444', hover: '#dc2626', rgb: '239, 68, 68' },
      pink: { main: '#ec4899', hover: '#db2777', rgb: '236, 72, 153' },
    }
    
    const selectedColor = colors[accentColor]
    root.style.setProperty('--accent-color', selectedColor.main)
    root.style.setProperty('--accent-color-hover', selectedColor.hover)
    root.style.setProperty('--accent-color-rgb', selectedColor.rgb)
    
    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${fontSize}`)
    
    // Apply reduce motion
    if (reduceMotion) {
      root.classList.add('reduce-motion')
      root.style.setProperty('--transition-speed', '0ms')
    } else {
      root.classList.remove('reduce-motion')
      root.style.setProperty('--transition-speed', '200ms')
    }
    
    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }, [theme, accentColor, fontSize, reduceMotion, highContrast])

  const loadThemePreferences = async () => {
    if (!user) return

    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('theme, accent_color, font_size, reduce_motion, high_contrast')
      .eq('id', user.id)
      .single()

    if (data) {
      setThemeState(data.theme || 'dark')
      setAccentColorState(data.accent_color || 'purple')
      setFontSizeState(data.font_size || 'medium')
      setReduceMotionState(data.reduce_motion || false)
      setHighContrastState(data.high_contrast || false)
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor)
  }

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
  }

  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce)
  }

  const setHighContrast = (contrast: boolean) => {
    setHighContrastState(contrast)
  }

  const reloadPreferences = async () => {
    await loadThemePreferences()
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      accentColor, 
      resolvedTheme, 
      fontSize,
      reduceMotion,
      highContrast,
      setTheme, 
      setAccentColor,
      setFontSize,
      setReduceMotion,
      setHighContrast,
      reloadPreferences
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
