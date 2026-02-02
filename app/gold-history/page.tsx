'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { GoldBalance } from '@/components/ui/gold-balance'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface GoldTransaction {
  id: string
  amount: number
  balance_after: number
  transaction_type: string
  description: string
  created_at: string
  metadata?: any
}

export default function GoldHistoryPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<GoldTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [userData, setUserData] = useState({
    username: '',
    title: 'Novice Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: 100,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
  })

  useEffect(() => {
    loadTransactions()
    loadUserData()
  }, [user, filter])

  const loadUserData = async () => {
    if (!user) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('username, title, level, current_xp, total_xp, gold, current_streak')
      .eq('id', user.id)
      .single()
    
    if (data) {
      const xpForNextLevel = data.level * 100
      setUserData({
        username: data.username || user.email?.split('@')[0] || 'Hero',
        title: data.title || 'Novice Adventurer',
        level: data.level || 1,
        currentXp: data.current_xp || 0,
        xpForNextLevel,
        currentStreak: data.current_streak || 0,
        totalPoints: data.total_xp || 0,
        rank: 'Unranked',
      })
    }
  }

  const loadTransactions = async () => {
    if (!user) return
    
    setIsLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('gold_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (filter !== 'all') {
      query = query.eq('transaction_type', filter)
    }
    
    const { data, error } = await query
    
    if (data) {
      setTransactions(data)
    }
    setIsLoading(false)
  }

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      task_reward: '✅',
      daily_bonus: '🎁',
      achievement: '🏆',
      shop_purchase: '🛒',
      goal_reward: '🎯',
      streak_bonus: '🔥',
      level_up: '⬆️',
      manual: '📝',
    }
    return icons[type] || '💰'
  }

  const getTransactionColor = (type: string) => {
    const colors: Record<string, string> = {
      task_reward: 'text-green-400',
      daily_bonus: 'text-blue-400',
      achievement: 'text-purple-400',
      shop_purchase: 'text-red-400',
      goal_reward: 'text-emerald-400',
      streak_bonus: 'text-orange-400',
      level_up: 'text-yellow-400',
      manual: 'text-neutral-400',
    }
    return colors[type] || 'text-neutral-400'
  }

  const formatTransactionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalSpent = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  if (isLoading) {
    return (
      <ThreeColumnLayout
        leftSidebar={<LeftSidebar user={userData} />}
        rightSidebar={<RightSidebar />}
      >
        <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-white text-lg">Loading transactions...</div>
        </div>
      </ThreeColumnLayout>
    )
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={userData} />}
      rightSidebar={<RightSidebar />}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">Gold History</h1>
          <GoldBalance size="lg" showLabel={false} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-neutral-900 border-neutral-800">
            <div className="text-neutral-400 text-sm mb-1">Total Earned</div>
            <div className="text-2xl font-semibold text-green-400">
              {totalEarned.toLocaleString()} 🪙
            </div>
          </Card>
          <Card className="p-4 bg-neutral-900 border-neutral-800">
            <div className="text-neutral-400 text-sm mb-1">Total Spent</div>
            <div className="text-2xl font-semibold text-red-400">
              {totalSpent.toLocaleString()} 🪙
            </div>
          </Card>
          <Card className="p-4 bg-neutral-900 border-neutral-800">
            <div className="text-neutral-400 text-sm mb-1">Net Gain</div>
            <div className="text-2xl font-semibold text-amber-400">
              {(totalEarned - totalSpent).toLocaleString()} 🪙
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'task_reward', 'daily_bonus', 'achievement', 'shop_purchase', 'goal_reward', 'streak_bonus'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900'
              }`}
            >
              {type === 'all' ? 'All' : formatTransactionType(type)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="p-4 bg-neutral-900 border-neutral-800 hover:bg-neutral-850 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {transaction.description || formatTransactionType(transaction.transaction_type)}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-semibold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} 🪙
                    </div>
                    <div className="text-sm text-neutral-500">
                      Balance: {transaction.balance_after.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2">No transactions yet</h3>
            <p className="text-neutral-400">Complete tasks to start earning gold!</p>
          </Card>
        )}
      </div>
    </ThreeColumnLayout>
  )
}
