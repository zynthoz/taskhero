'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface UserSearchResult {
  id: string
  username: string
  level: number
  total_xp: number
}

interface FriendSearchProps {
  currentUserId: string
  onFriendAdded?: () => void
}

export function FriendSearch({ currentUserId, onFriendAdded }: FriendSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null)

  const searchUsers = async () => {
    if (!searchQuery || searchQuery.length < 2) return

    setIsSearching(true)
    const supabase = createClient()

    // Remove @ prefix if present
    const query = searchQuery.replace('@', '')

    const { data, error } = await supabase
      .from('users')
      .select('id, username, level, total_xp')
      .ilike('username', `%${query}%`)
      .neq('id', currentUserId)
      .limit(10)

    setIsSearching(false)

    if (!error && data) {
      setSearchResults(data.filter(u => u.username))
    }
  }

  const sendFriendRequest = async (friendId: string) => {
    setSendingRequestTo(friendId)
    const supabase = createClient()

    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: 'pending',
      })

    setSendingRequestTo(null)

    if (!error) {
      setSearchResults(prev => prev.filter(u => u.id !== friendId))
      onFriendAdded?.()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Search by username..."
            className="pl-8 bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
          />
        </div>
        <Button
          onClick={searchUsers}
          disabled={isSearching || !searchQuery}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <Card key={user.id} className="p-3 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-900 dark:text-white font-medium">@{user.username}</span>
                      <span className="text-xs text-neutral-500">Lv {user.level}</span>
                    </div>
                    <p className="text-xs text-neutral-400">{user.total_xp.toLocaleString()} XP</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => sendFriendRequest(user.id)}
                  disabled={sendingRequestTo === user.id}
                  className="bg-purple-600 hover:bg-purple-700 h-8 text-xs"
                >
                  {sendingRequestTo === user.id ? 'Sending...' : '+ Add Friend'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <p className="text-center text-sm text-neutral-500">No users found</p>
      )}
    </div>
  )
}
