'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  username: string
  level: number
  total_xp: number
  rank: number
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-400'
  if (rank <= 3) return 'text-cyan-400'
  if (rank <= 10) return 'text-purple-400'
  return 'text-neutral-400'
}

const getRankEmoji = (rank: number): string => {
  if (rank === 1) return '👑'
  if (rank === 2) return '💎'
  if (rank === 3) return '⭐'
  return ''
}

export function MiniLeaderboard({ currentUserId }: { currentUserId?: string }) {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUserId) {
      fetchTopPlayers()
    }
  }, [currentUserId])

  const fetchTopPlayers = async () => {
    if (!currentUserId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    
    // Get friend IDs
    const { data: friendsData } = await supabase
      .from('friends')
      .select('friend_id, user_id')
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
      .eq('status', 'accepted')

    const friendIds = friendsData?.map(f => 
      f.user_id === currentUserId ? f.friend_id : f.user_id
    ) || []

    // If no friends, show empty state
    if (friendIds.length === 0) {
      setLoading(false)
      return
    }

    // Get friends + current user leaderboard
    const { data, error } = await supabase
      .from('users')
      .select('id, username, level, total_xp')
      .in('id', [...friendIds, currentUserId])
      .order('total_xp', { ascending: false })
      .limit(5)

    if (!error && data) {
      const rankedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
      setTopPlayers(rankedData)
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <Card className="p-3">
        <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">Friends Leaderboard</h3>
        <div className="text-xs text-neutral-500">Loading...</div>
      </Card>
    )
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">Friends Leaderboard</h3>
        <Link href="/leaderboard?filter=friends" className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
          View All
        </Link>
      </div>
      
      {topPlayers.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-xs text-neutral-500">No friends yet</p>
          <Link href="/friends" className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 block mt-1">
            Add Friends
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {topPlayers.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded ${
                player.id === currentUserId 
                  ? 'bg-purple-100 dark:bg-purple-900/20' 
                  : 'bg-neutral-100 dark:bg-neutral-800/30'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={`text-xs font-bold ${getRankColor(player.rank)} w-5`}>
                  #{player.rank}
                </span>
                {getRankEmoji(player.rank) && (
                  <span className="text-sm">{getRankEmoji(player.rank)}</span>
                )}
                <span className="text-xs text-neutral-900 dark:text-white truncate">
                  @{player.username || 'anonymous'}
                </span>
              </div>
              <span className="text-[10px] text-neutral-600 dark:text-neutral-400 ml-2">
                Lv {player.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
