'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type LevelHistory = Database['public']['Tables']['level_history']['Row']

interface UseLevelHistoryOptions {
  userId: string
  limit?: number
}

export function useLevelHistory({ userId, limit = 10 }: UseLevelHistoryOptions) {
  const [levelHistory, setLevelHistory] = useState<LevelHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLevelHistory() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('level_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        setLevelHistory(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching level history:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch level history')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchLevelHistory()
    }
  }, [userId, limit, supabase])

  const refetch = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('level_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setLevelHistory(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching level history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch level history')
    } finally {
      setLoading(false)
    }
  }

  return {
    levelHistory,
    loading,
    error,
    refetch,
  }
}
