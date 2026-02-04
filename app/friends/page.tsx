'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { FriendSearch } from '@/components/social/friend-search'
import { FriendsList } from '@/components/social/friends-list'
import { createClient } from '@/lib/supabase/client'

export default function FriendsPage() {
  const { user } = useAuth()
  const [sidebarUserData, setSidebarUserData] = useState({
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: undefined as number | undefined,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
    avatarId: undefined as string | undefined,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('username, level, current_xp, total_xp, current_streak, avatar_id')
      .eq('id', user.id)
      .single()

    if (data) {
      setSidebarUserData({
        username: data.username || user.email?.split('@')[0] || 'Hero',
        title: 'Adventurer',
        level: data.level || 1,
        currentXp: data.current_xp || 0,
        xpForNextLevel: (data.level || 1) * 100,
        currentStreak: data.current_streak || 0,
        totalPoints: data.total_xp || 0,
        rank: 'Unranked',
        avatarId: data.avatar_id || undefined,
      })
      setProfileLoaded(true)
    } else {
      setProfileLoaded(true)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0a0a0a]">
        <div className="text-neutral-900 dark:text-white text-lg">Please log in to view friends</div>
      </div>
    )
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={sidebarUserData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Friends</h1>

        {/* Search for Friends */}
        <Card className="p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 mb-6">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Add Friends</h2>
          <FriendSearch 
            currentUserId={user.id} 
            onFriendAdded={() => {
              // Refresh friends list by forcing re-render
              loadUserData()
            }}
          />
        </Card>

        {/* Friends List & Requests */}
        <Card className="p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <FriendsList currentUserId={user.id} />
        </Card>
      </div>
    </ThreeColumnLayout>
  )
}
