'use client'

import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import ProfileAchievements from '@/components/profile/achievements-tab'

export default function AchievementsPage() {
  // Keep the standalone /achievements page working, render the shared component so it's identical to Profile's Achievements tab
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={{ username: '', title: 'Novice Adventurer', level: 1, currentXp: 0, xpForNextLevel: undefined, currentStreak: 0, totalPoints: 0, rank: 'Unranked' }} loading={false} />}
      rightSidebar={<RightSidebar />}
    >
      <div className="space-y-6">
        <ProfileAchievements />
      </div>
    </ThreeColumnLayout>
  )
}
