'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RewardAnimationProps {
  isVisible: boolean
  xpGained: number
  goldGained: number
  onComplete?: () => void
}

export function RewardAnimation({ isVisible, xpGained, goldGained, onComplete }: RewardAnimationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg p-6 shadow-2xl">
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-neutral-900 dark:text-white font-bold text-xl">Task Complete!</div>
              <div className="flex gap-4 justify-center">
                {goldGained > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-900/50 rounded-lg px-4 py-2"
                  >
                    <span className="text-2xl">🪙</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">+{goldGained}</span>
                  </motion.div>
                )}
                {xpGained > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-900/50 rounded-lg px-4 py-2"
                  >
                    <span className="text-2xl">⭐</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">+{xpGained}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
