"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PurchaseAnimationProps {
  show: boolean
  itemName: string
  itemEmoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  onComplete: () => void
}

const rarityColors = {
  common: '#9ca3af',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
}

export function PurchaseAnimation({ show, itemName, itemEmoji, rarity, onComplete }: PurchaseAnimationProps) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (show) {
      // Generate particles
      setParticles(Array.from({ length: 20 }, (_, i) => i))
      
      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete()
        setParticles([])
      }, 2500)
      
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {/* Particles */}
          {particles.map((i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: i * 0.02,
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: rarityColors[rarity],
                boxShadow: `0 0 10px ${rarityColors[rarity]}`,
              }}
            />
          ))}

          {/* Item Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              rotate: [- 180, 0, 0],
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: 2,
                ease: "easeInOut",
              }}
              className="text-9xl"
              style={{
                filter: `drop-shadow(0 0 30px ${rarityColors[rarity]})`,
              }}
            >
              {itemEmoji}
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute bottom-1/3 text-center"
          >
            <motion.h2
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: 2,
                ease: "easeInOut",
              }}
              className="text-4xl font-bold text-white mb-2"
              style={{
                textShadow: `0 0 20px ${rarityColors[rarity]}`,
              }}
            >
              Item Acquired!
            </motion.h2>
            <p className="text-xl text-neutral-300">{itemName}</p>
            <p 
              className="text-sm font-semibold uppercase tracking-wider mt-1"
              style={{ color: rarityColors[rarity] }}
            >
              {rarity}
            </p>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 2, 2.5],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            className="absolute w-64 h-64 rounded-full blur-3xl"
            style={{
              backgroundColor: rarityColors[rarity],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
