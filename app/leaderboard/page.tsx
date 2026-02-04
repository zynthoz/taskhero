'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'

interface LeaderboardEntry {
  id: string
  username: string
  level: number
  total_xp: number
  current_streak: number
  total_tasks_completed: number
  rank: number
}

interface RankTier {
  name: string
  emoji: string
  color: string
  bgColor: string
}

const getRankTier = (rank: number): RankTier => {
  if (rank === 1) return { name: 'Champion', emoji: '👑', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' }
  if (rank <= 3) return { name: 'Diamond', emoji: '💎', color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' }
  if (rank <= 10) return { name: 'Platinum', emoji: '⭐', color: 'text-purple-400', bgColor: 'bg-purple-400/10' }
  if (rank <= 25) return { name: 'Gold', emoji: '🥇', color: 'text-amber-400', bgColor: 'bg-amber-400/10' }
  if (rank <= 50) return { name: 'Silver', emoji: '🥈', color: 'text-gray-400', bgColor: 'bg-gray-400/10' }
  return { name: 'Bronze', emoji: '🥉', color: 'text-orange-700', bgColor: 'bg-orange-700/10' }
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'weekly' | 'friends'>('all')
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
    fetchLeaderboard()
  }, [filter])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('users')
        .select('id, username, level, total_xp, current_xp, current_streak, total_tasks_completed, avatar_id')

      // Filter by friends if selected
      if (filter === 'friends' && user) {
        // Get friend IDs
        const { data: friendsData } = await supabase
          .from('friends')
          .select('friend_id, user_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted')

        const friendIds = friendsData?.map(f => 
          f.user_id === user.id ? f.friend_id : f.user_id
        ) || []

        // Include current user and friends
        query = query.in('id', [...friendIds, user.id])
      }

      // Filter by weekly if selected
      if (filter === 'weekly') {
        // For now, use total_xp - we'll implement weekly_xp tracking later
        // TODO: Query weekly_xp table instead
        query = query.order('total_xp', { ascending: false })
      } else {
        query = query.order('total_xp', { ascending: false })
      }

      const { data, error } = await query.limit(100)

      if (error) throw error

      const rankedData = data?.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })) || []

      setLeaderboard(rankedData)

      // Update mock user data with actual user data
      if (user) {
        const currentUserEntry = rankedData.find(entry => entry.id === user.id)
        if (currentUserEntry) {
          const tierInfo = getRankTier(currentUserEntry.rank)
          setSidebarUserData(prev => ({
            ...prev,
            username: currentUserEntry.username || user.email?.split('@')[0] || 'Hero',
            title: tierInfo.name,
            level: currentUserEntry.level,
            currentXp: currentUserEntry.current_xp || 0,
            xpForNextLevel: (currentUserEntry.level || 1) * 100,
            currentStreak: currentUserEntry.current_streak,
            totalPoints: currentUserEntry.total_xp,
            rank: `#${currentUserEntry.rank}`,
            avatarId: currentUserEntry.avatar_id || undefined,
          }))
          setProfileLoaded(true)
        } else {
          setProfileLoaded(true)
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentUserRank = leaderboard.find(entry => entry.id === user?.id)

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={sidebarUserData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-1">Leaderboard</h1>
          <p className="text-sm text-neutral-400">Compete with heroes across the realm</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'weekly'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('friends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'friends'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            Friends
          </button>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-800">
                <tr className="text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="text-left p-4 font-medium">Rank</th>
                  <th className="text-left p-4 font-medium">Player</th>
                  <th className="text-right p-4 font-medium">Level</th>
                  <th className="text-right p-4 font-medium">XP</th>
                  <th className="text-right p-4 font-medium">Streak</th>
                  <th className="text-right p-4 font-medium">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-neutral-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-4xl">⏳</div>
                        <div>Loading leaderboard...</div>
                      </div>
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-neutral-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-4xl">👥</div>
                        <div>No players found</div>
                        <p className="text-xs text-neutral-500">
                          {filter === 'friends' ? 'Add some friends to see them here' : 'Be the first to complete tasks and earn XP'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => {
                    const tier = getRankTier(entry.rank)
                    const isCurrentUser = entry.id === user?.id

                    return (
                      <tr
                        key={entry.id}
                        className={`border-b border-neutral-800/50 transition-colors ${
                          isCurrentUser
                            ? 'bg-purple-900/20 hover:bg-purple-900/30'
                            : 'hover:bg-neutral-800/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${tier.color} ${isCurrentUser ? 'text-purple-400' : ''}`}>
                              #{entry.rank}
                            </span>
                            {entry.rank <= 3 && (
                              <span className="text-xl">{tier.emoji}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isCurrentUser ? 'text-purple-400' : 'text-white'}`}>
                              @{entry.username || 'anonymous'}
                            </span>
                            {entry.rank <= 50 && entry.rank > 3 && (
                              <Badge variant="outline" className={`text-[10px] ${tier.color} border-current`}>
                                {tier.emoji} {tier.name}
                              </Badge>
                            )}
                            {isCurrentUser && (
                              <Badge className="text-[10px] bg-purple-600/20 text-purple-400 border-purple-600/50">
                                You
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-white font-medium">{entry.level}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-white font-semibold">{entry.total_xp.toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-orange-400 font-medium">
                            {entry.current_streak > 0 ? `🔥 ${entry.current_streak}` : '-'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-neutral-400">{entry.total_tasks_completed}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ThreeColumnLayout>
  )
}
