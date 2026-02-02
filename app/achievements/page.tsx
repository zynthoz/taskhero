'use client'

import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { LevelHistory } from '@/components/gamification/level-history'
import { useAuth } from '@/lib/supabase/auth-provider'

export default function AchievementsPage() {
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
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Achievements</h1>
        
        {/* Level History Section */}
        {user && <LevelHistory userId={user.id} />}
        
        {/* Achievements Section */}
        <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-white mb-2">No achievements yet</h3>
          <p className="text-neutral-400">Complete tasks to unlock achievements</p>
        </Card>
      </div>
    </ThreeColumnLayout>
  )
}
