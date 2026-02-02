'use client'

import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { useLevelHistory } from '@/hooks/use-level-history'

export function LevelHistory({ userId }: { userId: string }) {
  const { levelHistory, loading } = useLevelHistory({ userId, limit: 10 })

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (levelHistory.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Level History</h3>
        <p className="text-gray-500">No level-ups yet. Keep completing tasks to gain XP!</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Level History</h3>
      <div className="space-y-3">
        {levelHistory.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Level {record.previous_level}
                </span>
                <span className="text-purple-500">→</span>
                <span className="text-lg font-bold text-purple-600">
                  Level {record.new_level}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {record.total_xp_at_levelup.toLocaleString()} XP
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
