'use client'

import { useState, useEffect } from 'react'

interface LevelUpData {
  newLevel: number
  rewards?: {
    gold?: number
    item?: string
  }
}

export function useLevelUp() {
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null)

  const checkForLevelUp = (oldLevel: number, newLevel: number) => {
    if (newLevel > oldLevel) {
      // Calculate level-up rewards
      const rewards = {
        gold: newLevel * 10, // 10 gold per level
        item: newLevel % 5 === 0 ? 'Legendary Chest' : undefined // Legendary chest every 5 levels
      }

      setLevelUpData({ newLevel, rewards })
      setIsLevelUpModalOpen(true)
    }
  }

  const closeLevelUpModal = () => {
    setIsLevelUpModalOpen(false)
    setLevelUpData(null)
  }

  return {
    isLevelUpModalOpen,
    levelUpData,
    checkForLevelUp,
    closeLevelUpModal,
  }
}
