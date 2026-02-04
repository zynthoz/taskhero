'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// CONFETTI PARTICLE
// ============================================

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  velocityX: number
  velocityY: number
  gravity: number
  opacity: number
  shape: 'square' | 'circle' | 'star'
}

const COLORS = [
  '#9333ea', // Purple (accent)
  '#22c55e', // Green
  '#eab308', // Yellow
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
]

const SHAPES = ['square', 'circle', 'star'] as const

// ============================================
// CONFETTI COMPONENT
// ============================================

interface ConfettiProps {
  active: boolean
  duration?: number
  particleCount?: number
  spread?: number
  origin?: { x: number; y: number }
  onComplete?: () => void
}

export function Confetti({
  active,
  duration = 3000,
  particleCount = 100,
  spread = 360,
  origin = { x: 0.5, y: 0.3 },
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180)
      const velocity = Math.random() * 10 + 5
      
      newParticles.push({
        id: i,
        x: origin.x * 100,
        y: origin.y * 100,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 8,
        gravity: 0.3,
        opacity: 1,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      })
    }
    
    return newParticles
  }, [particleCount, spread, origin])

  useEffect(() => {
    if (active && !isAnimating) {
      setIsAnimating(true)
      setParticles(createParticles())

      const timeout = setTimeout(() => {
        setIsAnimating(false)
        setParticles([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [active, isAnimating, createParticles, duration, onComplete])

  // Animation loop
  useEffect(() => {
    if (!isAnimating || particles.length === 0) return

    let animationFrame: number

    const animate = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * 0.1,
            y: p.y + p.velocityY * 0.1,
            velocityY: p.velocityY + p.gravity,
            rotation: p.rotation + p.rotationSpeed,
            opacity: Math.max(0, p.opacity - 0.005),
          }))
          .filter(p => p.opacity > 0 && p.y < 150)
      )
      
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isAnimating, particles.length])

  if (!isAnimating || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute transition-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.shape !== 'star' ? particle.color : 'transparent',
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            boxShadow: particle.shape !== 'star' ? `0 0 6px ${particle.color}40` : 'none',
          }}
        >
          {particle.shape === 'star' && (
            <svg
              viewBox="0 0 24 24"
              fill={particle.color}
              className="w-full h-full"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================
// XP GAIN ANIMATION
// ============================================

interface XPGainProps {
  amount: number
  show: boolean
  onComplete?: () => void
}

export function XPGainAnimation({ amount, show, onComplete }: XPGainProps) {
  const [visible, setVisible] = useState(false)
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; delay: number }[]>([])

  useEffect(() => {
    if (show) {
      setVisible(true)
      // Create multiple floating numbers
      const numbers = Array.from({ length: Math.min(5, Math.ceil(amount / 20)) }, (_, i) => ({
        id: i,
        x: Math.random() * 40 - 20,
        delay: i * 100,
      }))
      setFloatingNumbers(numbers)

      const timeout = setTimeout(() => {
        setVisible(false)
        setFloatingNumbers([])
        onComplete?.()
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [show, amount, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[250] flex items-center justify-center">
      {floatingNumbers.map(num => (
        <div
          key={num.id}
          className="absolute animate-float-up-fade"
          style={{
            transform: `translateX(${num.x}px)`,
            animationDelay: `${num.delay}ms`,
          }}
        >
          <span className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            +{Math.floor(amount / floatingNumbers.length)} ⭐
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// GOLD GAIN ANIMATION
// ============================================

interface GoldGainProps {
  amount: number
  show: boolean
  onComplete?: () => void
}

export function GoldGainAnimation({ amount, show, onComplete }: GoldGainProps) {
  const [visible, setVisible] = useState(false)
  const [coins, setCoins] = useState<{ id: number; x: number; delay: number; rotation: number }[]>([])

  useEffect(() => {
    if (show) {
      setVisible(true)
      // Create floating coins
      const coinCount = Math.min(8, Math.max(3, Math.ceil(amount / 10)))
      const newCoins = Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 100,
        delay: i * 80,
        rotation: Math.random() * 360,
      }))
      setCoins(newCoins)

      const timeout = setTimeout(() => {
        setVisible(false)
        setCoins([])
        onComplete?.()
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [show, amount, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[250] flex items-center justify-center">
      {coins.map(coin => (
        <div
          key={coin.id}
          className="absolute animate-coin-shower"
          style={{
            left: `calc(50% + ${coin.x}px)`,
            animationDelay: `${coin.delay}ms`,
          }}
        >
          <span 
            className="text-3xl drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"
            style={{ transform: `rotate(${coin.rotation}deg)` }}
          >
            💰
          </span>
        </div>
      ))}
      <div className="absolute animate-scale-bounce" style={{ animationDelay: '300ms' }}>
        <span className="text-3xl font-bold text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          +{amount} Gold
        </span>
      </div>
    </div>
  )
}

// ============================================
// LEVEL UP CELEBRATION
// ============================================

interface LevelUpCelebrationProps {
  level: number
  show: boolean
  onComplete?: () => void
}

export function LevelUpCelebration({ level, show, onComplete }: LevelUpCelebrationProps) {
  const [visible, setVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      setShowConfetti(true)

      const timeout = setTimeout(() => {
        setVisible(false)
        setShowConfetti(false)
        onComplete?.()
      }, 4000)

      return () => clearTimeout(timeout)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <>
      <Confetti active={showConfetti} particleCount={150} />
      <div className="fixed inset-0 pointer-events-none z-[250] flex items-center justify-center">
        {/* Radial burst effect */}
        <div className="absolute w-64 h-64 animate-burst-ring">
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/50" />
        </div>
        <div className="absolute w-48 h-48 animate-burst-ring" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 rounded-full border-4 border-orange-400/50" />
        </div>
        
        {/* Level badge */}
        <div className="relative animate-scale-bounce">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/50">
            <div className="w-28 h-28 rounded-full bg-neutral-900 flex flex-col items-center justify-center">
              <span className="text-xs text-amber-400 font-semibold">LEVEL</span>
              <span className="text-4xl font-bold text-white">{level}</span>
            </div>
          </div>
          
          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-sparkle"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-80px)`,
                animationDelay: `${i * 100}ms`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ============================================
// STREAK CELEBRATION
// ============================================

interface StreakCelebrationProps {
  days: number
  show: boolean
  onComplete?: () => void
}

export function StreakCelebration({ days, show, onComplete }: StreakCelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)

      const timeout = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[250] flex items-center justify-center">
      {/* Fire particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl animate-flame-particle"
          style={{
            left: `calc(50% + ${(Math.random() - 0.5) * 100}px)`,
            animationDelay: `${i * 100}ms`,
          }}
        >
          🔥
        </div>
      ))}
      
      {/* Main streak display */}
      <div className="relative animate-scale-bounce">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-8 py-4 shadow-2xl shadow-orange-500/50">
          <div className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-4xl font-bold text-white">{days}</div>
            <div className="text-sm font-semibold text-orange-100">Day Streak!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ACHIEVEMENT UNLOCK ANIMATION
// ============================================

interface AchievementUnlockProps {
  name: string
  icon?: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  show: boolean
  onComplete?: () => void
}

export function AchievementUnlockAnimation({ 
  name, 
  icon = '🏆', 
  rarity = 'common',
  show, 
  onComplete 
}: AchievementUnlockProps) {
  const [visible, setVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      if (rarity === 'epic' || rarity === 'legendary') {
        setShowConfetti(true)
      }

      const timeout = setTimeout(() => {
        setVisible(false)
        setShowConfetti(false)
        onComplete?.()
      }, 4000)

      return () => clearTimeout(timeout)
    }
  }, [show, rarity, onComplete])

  const getRarityStyles = () => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 via-yellow-500 to-orange-500 shadow-amber-500/50'
      case 'epic':
        return 'from-purple-500 via-violet-500 to-purple-600 shadow-purple-500/50'
      case 'rare':
        return 'from-blue-400 via-blue-500 to-blue-600 shadow-blue-500/50'
      default:
        return 'from-neutral-400 via-neutral-500 to-neutral-600 shadow-neutral-500/50'
    }
  }

  if (!visible) return null

  return (
    <>
      <Confetti active={showConfetti} particleCount={80} />
      <div className="fixed inset-0 pointer-events-none z-[250] flex items-center justify-center">
        <div className="animate-achievement-unlock">
          {/* Glow ring */}
          <div className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-50 blur-xl animate-pulse',
            getRarityStyles()
          )} />
          
          {/* Main card */}
          <div className={cn(
            'relative bg-gradient-to-r rounded-2xl p-6 shadow-2xl',
            getRarityStyles()
          )}>
            <div className="bg-neutral-900/90 rounded-xl px-8 py-6 text-center">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Achievement Unlocked
              </div>
              <div className="text-5xl mb-3 animate-bounce-subtle">{icon}</div>
              <div className="text-lg font-bold text-white">{name}</div>
              <div className={cn(
                'text-xs font-semibold uppercase mt-2',
                rarity === 'legendary' ? 'text-amber-400' :
                rarity === 'epic' ? 'text-purple-400' :
                rarity === 'rare' ? 'text-blue-400' :
                'text-neutral-400'
              )}>
                {rarity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// PURCHASE ANIMATION
// ============================================

interface PurchaseAnimationProps {
  itemName: string
  icon?: string
  show: boolean
  onComplete?: () => void
}

export function PurchaseAnimation({ itemName, icon = '🎁', show, onComplete }: PurchaseAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)

      const timeout = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 2500)

      return () => clearTimeout(timeout)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[250] flex items-center justify-center">
      <div className="animate-purchase-pop">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-1 shadow-2xl shadow-cyan-500/30">
          <div className="bg-neutral-900 rounded-xl px-8 py-6 text-center">
            <div className="text-4xl mb-2 animate-bounce">{icon}</div>
            <div className="text-sm font-bold text-cyan-400 uppercase">Purchased!</div>
            <div className="text-lg font-semibold text-white mt-1">{itemName}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
