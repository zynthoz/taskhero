'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected'
  requested_at: string
  friend_username: string
  friend_level: number
  friend_total_xp: number
  friend_current_streak: number
}

interface FriendsListProps {
  currentUserId: string
}

export function FriendsList({ currentUserId }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFriends()
  }, [currentUserId])

  const fetchFriends = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get friends where current user is the requester
    const { data: sentRequests } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        friend:friend_id(username, level, total_xp, current_streak)
      `)
      .eq('user_id', currentUserId)

    // Get friend requests where current user is the recipient
    const { data: receivedRequests } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        requester:user_id(username, level, total_xp, current_streak)
      `)
      .eq('friend_id', currentUserId)

    const allFriends: Friend[] = []
    const pending: Friend[] = []

    // Process sent requests
    if (sentRequests) {
      sentRequests.forEach((req: any) => {
        const friendData = {
          id: req.id,
          user_id: req.user_id,
          friend_id: req.friend_id,
          status: req.status,
          requested_at: req.requested_at,
          friend_username: req.friend?.username || 'Unknown',
          friend_level: req.friend?.level || 1,
          friend_total_xp: req.friend?.total_xp || 0,
          friend_current_streak: req.friend?.current_streak || 0,
        }

        if (req.status === 'accepted') {
          allFriends.push(friendData)
        }
      })
    }

    // Process received requests
    if (receivedRequests) {
      receivedRequests.forEach((req: any) => {
        const friendData = {
          id: req.id,
          user_id: req.user_id,
          friend_id: req.friend_id,
          status: req.status,
          requested_at: req.requested_at,
          friend_username: req.requester?.username || 'Unknown',
          friend_level: req.requester?.level || 1,
          friend_total_xp: req.requester?.total_xp || 0,
          friend_current_streak: req.requester?.current_streak || 0,
        }

        if (req.status === 'pending') {
          pending.push(friendData)
        } else if (req.status === 'accepted') {
          allFriends.push(friendData)
        }
      })
    }

    setFriends(allFriends)
    setPendingRequests(pending)
    setLoading(false)
  }

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingId(requestId)
    const supabase = createClient()

    const { error } = await supabase
      .from('friends')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', requestId)

    setProcessingId(null)

    if (!error) {
      fetchFriends()
    }
  }

  const removeFriend = async (friendshipId: string) => {
    setProcessingId(friendshipId)
    const supabase = createClient()

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId)

    setProcessingId(null)

    if (!error) {
      fetchFriends()
    }
  }

  if (loading) {
    return <div className="text-neutral-600 dark:text-neutral-400 text-sm">Loading friends...</div>
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
            Friend Requests
            <Badge variant="outline" className="text-xs bg-purple-600/20 text-purple-400 border-purple-600">
              {pendingRequests.length}
            </Badge>
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-3 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-900 dark:text-white font-medium">@{request.friend_username}</span>
                      <span className="text-xs text-neutral-500">Lv {request.friend_level}</span>
                    </div>
                    <p className="text-xs text-neutral-400">{request.friend_total_xp.toLocaleString()} XP</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequest(request.id, 'accept')}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRequest(request.id, 'reject')}
                      disabled={processingId === request.id}
                      className="bg-red-600 hover:bg-red-700 h-8 text-xs"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Friends {friends.length > 0 && `(${friends.length})`}
        </h3>
        {friends.length === 0 ? (
          <Card className="p-8 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">No friends yet</p>
            <p className="text-xs text-neutral-500 mt-1">Search for users to add friends</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <Card key={friend.id} className="p-3 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-900 dark:text-white font-medium">@{friend.friend_username}</span>
                      <span className="text-xs text-neutral-500">Lv {friend.friend_level}</span>
                      {friend.friend_current_streak > 0 && (
                        <span className="text-xs text-orange-400">🔥 {friend.friend_current_streak}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{friend.friend_total_xp.toLocaleString()} XP</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFriend(friend.id)}
                    disabled={processingId === friend.id}
                    className="h-8 text-xs border-neutral-700 hover:bg-red-600/20 hover:border-red-600 hover:text-red-400"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
