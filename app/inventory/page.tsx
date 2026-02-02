'use client'

import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/supabase/auth-provider'

export default function InventoryPage() {
  const { user } = useAuth()

  const mockUserData = {
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: 100,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={mockUserData} />}
      rightSidebar={<RightSidebar />}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white mb-6">Inventory</h1>
        
        <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
          <div className="text-6xl mb-4">🎒</div>
          <h3 className="text-xl font-semibold text-white mb-2">Inventory empty</h3>
          <p className="text-neutral-400">Your items and equipment will appear here</p>
        </Card>
      </div>
    </ThreeColumnLayout>
  )
}
