'use client'

import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import ProfileInventory from '@/components/profile/inventory-tab'

interface InventoryItem {
  id: string
  user_id: string
  item_id: string
  quantity: number
  is_equipped: boolean
  created_at: string
  updated_at: string
  items: {
    id: string
    name: string
    description: string
    type: 'weapon' | 'armor_plate' | 'accessory' | 'belt' | 'consumable' | 'cosmetic'
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    cost_gold: number
    cost_gems: number
    emoji: string
    effect_type?: string
    effect_value?: number
    effect_duration?: number
  }
}

interface ActivePowerup {
  id: string
  user_id: string
  item_id: string
  effect_type: string
  effect_value: number
  activated_at: string
  expires_at: string
  items?: {
    name: string
    emoji: string
  }
}

const rarityColors = {
  common: 'border-neutral-600 bg-neutral-800/30',
  rare: 'border-blue-500/50 bg-blue-950/30',
  epic: 'border-purple-500/50 bg-purple-950/30',
  legendary: 'border-amber-500/50 bg-amber-950/30',
}

const rarityTextColors = {
  common: 'text-neutral-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
}

export default function InventoryPage() {
  // Render the shared Inventory tab so the exact same UI and behaviour is used in both the standalone page and the Profile tab
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={{ username: '', title: 'Novice Adventurer', level: 1, currentXp: 0, xpForNextLevel: undefined, currentStreak: 0, totalPoints: 0, rank: 'Unranked' }} loading={false} />}
      rightSidebar={<RightSidebar />}
    >
      <div className="space-y-6">
        <ProfileInventory />
      </div>
    </ThreeColumnLayout>
  )
}
