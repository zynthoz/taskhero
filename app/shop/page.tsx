'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShopItemCard } from '@/components/shop/shop-item-card'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/lib/notifications'
import { PurchaseAnimation, Confetti } from '@/components/animations'

interface ShopItem {
  id: string
  name: string
  description: string
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'cosmetic'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  cost_gold: number
  cost_gems: number
  emoji: string
  effect_type?: string
  effect_value?: number
  is_featured?: boolean
}

export default function ShopPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { showPurchase, error: notifyError } = useNotifications()
  const supabase = createClient()
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userGold, setUserGold] = useState(0)
  const [userGems, setUserGems] = useState(0)
  const [userData, setUserData] = useState({
    username: '',
    level: 1,
    currentXp: 0,
    totalXp: 0,
    currentStreak: 0,
    xpForNextLevel: undefined as number | undefined,
    avatarId: undefined as string | undefined,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  
  // Animation states
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false)
  const [purchasedItemName, setPurchasedItemName] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Timer state
  const [timeUntilRefresh, setTimeUntilRefresh] = useState('')
  
  const sidebarUserData = {
    username: userData.username || user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: userData.level,
    currentXp: userData.currentXp,
    xpForNextLevel: userData.xpForNextLevel,
    currentStreak: userData.currentStreak,
    totalPoints: userData.totalXp,
    rank: 'Unranked',
    avatarId: userData.avatarId,
  }

  useEffect(() => {
    if (user) {
      fetchUserCurrency()
      fetchShopItems()
    } else {
      setProfileLoaded(true)
    }
  }, [user])

  // Countdown timer effect
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilRefresh(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      
      // If we've passed midnight, refresh the shop
      if (diff <= 0) {
        fetchShopItems()
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [user])

  const fetchUserCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('gold, gems, username, avatar_id, level, current_xp, total_xp, current_streak')
        .eq('id', user?.id)
        .single()
      
      if (error) throw error
      setUserGold(data?.gold || 0)
      setUserGems(data?.gems || 0)
      setUserData({
        username: data?.username || '',
        level: data?.level || 1,
        currentXp: data?.current_xp || 0,
        totalXp: data?.total_xp || 0,
        currentStreak: data?.current_streak || 0,
        xpForNextLevel: (data?.level || 1) * 100,
        avatarId: data?.avatar_id || undefined,
      })
      setProfileLoaded(true)
    } catch (error) {
      console.error('Error fetching user currency:', error)
    }
  }

  const fetchShopItems = async () => {
    try {
      // Fetch today's daily shop rotation
      const today = new Date().toISOString().split('T')[0]
      
      const { data: rotationData, error: rotationError } = await supabase
        .from('daily_shop_rotations')
        .select(`
          *,
          items (*)
        `)
        .eq('rotation_date', today)
        .order('display_order')
      
      if (rotationError) {
        // Table doesn't exist yet - migrations not applied
        if (rotationError.code === '42P01' || rotationError.message?.includes('does not exist')) {
          console.warn('Shop tables not found. Please apply PHASE_8_MIGRATION.sql')
          setShopItems([])
          return
        }
        throw rotationError
      }
      
      // If no rotation exists, generate one automatically
      if (!rotationData || rotationData.length === 0) {
        console.log('No shop rotation found for today, generating...')
        
        const { data: generateResult, error: generateError } = await supabase
          .rpc('generate_daily_shop_rotation')
        
        if (generateError) {
          // Function doesn't exist yet - migrations not applied
          if (generateError.code === '42883' || generateError.message?.includes('does not exist')) {
            console.warn('Shop functions not found. Please apply PHASE_8_MIGRATION.sql')
            setShopItems([])
            return
          }
          console.error('Error generating shop rotation:', generateError)
          // Fallback to empty if we can't generate
          setShopItems([])
          return
        } else {
          console.log('Shop rotation generated:', generateResult)
          // Re-fetch the newly generated rotation
          const { data: newRotation, error: refetchError } = await supabase
            .from('daily_shop_rotations')
            .select(`
              *,
              items (*)
            `)
            .eq('rotation_date', today)
            .order('display_order')
          
          if (refetchError) throw refetchError
          
          const items = newRotation?.map(rotation => ({
            ...rotation.items,
            is_featured: rotation.is_featured
          })) || []
          setShopItems(items)
        }
      } else {
        const items = rotationData.map(rotation => ({
          ...rotation.items,
          is_featured: rotation.is_featured
        }))
        setShopItems(items)
      }
    } catch (error) {
      console.error('Error fetching shop items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (item: ShopItem) => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('purchase_shop_item', {
        p_user_id: user.id,
        p_item_id: item.id,
        p_quantity: 1
      })

      if (error) {
        // Function doesn't exist yet - migrations not applied
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          notifyError('Please apply PHASE_8_MIGRATION.sql to enable shop purchases')
          return
        }
        throw error
      }

      if (data.success) {
        // Show purchase animation
        setPurchasedItemName(item.name)
        setShowPurchaseAnimation(true)
        setShowConfetti(true)
        
        // Clear animations after delay
        setTimeout(() => {
          setShowPurchaseAnimation(false)
          setShowConfetti(false)
        }, 2500)
        
        // Show notification
        showPurchase(item.name, item.cost_gold)
        
        toast({
          title: '🎉 Purchase Successful!',
          description: `You bought ${item.name}!`,
        })
        
        // Update user currency
        setUserGold(data.new_gold)
        setUserGems(data.new_gems)
        
        // Refresh shop items
        await fetchShopItems()
      } else {
        notifyError(data.message || 'Unable to complete purchase')
        toast({
          title: '❌ Purchase Failed',
          description: data.message || 'Unable to complete purchase',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      notifyError(error.message || 'An error occurred during purchase')
      toast({
        title: '❌ Error',
        description: error.message || 'An error occurred during purchase',
        variant: 'destructive',
      })
    }
  }

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory)

  const categories = [
    { id: 'all', label: 'All Items', emoji: '🏪' },
    { id: 'consumable', label: 'Consumables', emoji: '🧪' },
    { id: 'weapon', label: 'Weapons', emoji: '⚔️' },
    { id: 'armor', label: 'Armor', emoji: '🛡️' },
    { id: 'accessory', label: 'Accessories', emoji: '💍' },
    { id: 'cosmetic', label: 'Cosmetics', emoji: '👑' },
  ]

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={sidebarUserData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Daily Shop</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Refreshes every 24 hours</p>
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Next refresh: <span className="text-neutral-900 dark:text-white font-medium">{timeUntilRefresh || '00:00:00'}</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs px-2 py-1 h-auto md:text-sm md:px-3 md:py-1.5"
            >
              <span className="mr-1">{category.emoji}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>

        {/* Shop Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">
            Loading shop items...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No items available</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Check back later for new items!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                isFeatured={item.is_featured}
                onPurchase={handlePurchase}
                userGold={userGold}
                userGems={userGems}
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase Animations */}
      <PurchaseAnimation 
        itemName={purchasedItemName} 
        show={showPurchaseAnimation} 
        onComplete={() => setShowPurchaseAnimation(false)} 
      />
      <Confetti active={showConfetti} duration={2500} />
    </ThreeColumnLayout>
  )
}
