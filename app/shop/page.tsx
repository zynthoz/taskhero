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
  const supabase = createClient()
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [userGold, setUserGold] = useState(0)
  const [userGems, setUserGems] = useState(0)
  
  const mockUserData = {
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: 100,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
  }

  useEffect(() => {
    if (user) {
      fetchUserCurrency()
      fetchShopItems()
    }
  }, [user])

  const fetchUserCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('gold, gems')
        .eq('id', user?.id)
        .single()
      
      if (error) throw error
      setUserGold(data?.gold || 0)
      setUserGems(data?.gems || 0)
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
          toast({
            title: 'Feature Not Available',
            description: 'Please apply PHASE_8_MIGRATION.sql to enable shop purchases',
            variant: 'destructive',
          })
          return
        }
        throw error
      }

      if (data.success) {
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
        toast({
          title: '❌ Purchase Failed',
          description: data.message || 'Unable to complete purchase',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
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
      leftSidebar={<LeftSidebar user={mockUserData} />}
      rightSidebar={<RightSidebar />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Daily Shop</h1>
            <p className="text-sm text-neutral-400">Refreshes every 24 hours</p>
          </div>
          <div className="text-sm text-neutral-400">
            Next refresh: <span className="text-white font-medium">23:59:59</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <span className="mr-1.5">{category.emoji}</span>
              {category.label}
            </Button>
          ))}
        </div>

        {/* Shop Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400">
            Loading shop items...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-white mb-2">No items available</h3>
            <p className="text-neutral-400">Check back later for new items!</p>
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
    </ThreeColumnLayout>
  )
}
