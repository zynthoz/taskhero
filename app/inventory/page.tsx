'use client'

import { useState, useEffect } from 'react'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ActivePowerups } from '@/components/gamification/active-powerups'

interface InventoryItem {
  id: string
  user_id: string
  item_id: string
  quantity: number
  is_equipped: boolean
  created_at: string
  updated_at: string
  items: {
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
    effect_duration?: number
  }
}

interface ActivePowerup {
  id: string
  user_id: string
  item_id: string
  effect_type: string
  effect_value: number
  activated_at: string
  expires_at: string
  items?: {
    name: string
    emoji: string
  }
}

const rarityColors = {
  common: 'border-neutral-600 bg-neutral-800/30',
  rare: 'border-blue-500/50 bg-blue-950/30',
  epic: 'border-purple-500/50 bg-purple-950/30',
  legendary: 'border-amber-500/50 bg-amber-950/30',
}

const rarityTextColors = {
  common: 'text-neutral-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
}

export default function InventoryPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [activePowerups, setActivePowerups] = useState<ActivePowerup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
      fetchInventory()
      fetchActivePowerups()
    }
  }, [user])

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          items (*)
        `)
        .eq('user_id', user?.id)
        .order('acquired_at', { ascending: false })
      
      if (error) {
        // Table doesn't exist yet - migrations not applied
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setInventory([])
          return
        }
        // Only log unexpected errors
        console.error('Error fetching inventory:', error)
        return
      }
      setInventory(data || [])
    } finally {
      setLoading(false)
    }
  }

  const handleEquipToggle = async (item: InventoryItem) => {
    try {
      const newEquippedState = !item.is_equipped

      // Update database
      const { error } = await supabase
        .from('user_inventory')
        .update({ is_equipped: newEquippedState })
        .eq('id', item.id)
      
      if (error) throw error

      // Update local state
      setInventory(prev =>
        prev.map(inv =>
          inv.id === item.id
            ? { ...inv, is_equipped: newEquippedState }
            : inv
        )
      )

      toast({
        title: newEquippedState ? 'Item Equipped' : 'Item Unequipped',
        description: `${item.items.emoji} ${item.items.name}`,
      })
    } catch (error) {
      console.error('Error toggling equip:', error)
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      })
    }
  }

  const fetchActivePowerups = async () => {
    try {
      const { data, error } = await supabase
        .from('active_powerups')
        .select(`
          *,
          items (name, emoji)
        `)
        .eq('user_id', user?.id)
        .gt('expires_at', new Date().toISOString())
      
      if (error) {
        // Table doesn't exist yet - migrations not applied
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setActivePowerups([])
          return
        }
        // Only log unexpected errors
        console.error('Error fetching active powerups:', error)
        return
      }
      setActivePowerups(data || [])
    } catch (error) {
      // Unexpected exception
      console.error('Unexpected error fetching active powerups:', error)
    }
  }

  const handleUseConsumable = async (item: InventoryItem) => {
    try {
      const { data, error } = await supabase.rpc('use_consumable_item', {
        p_user_id: user?.id,
        p_inventory_id: item.id,
      })
      
      if (error) {
        // Function doesn't exist yet - migrations not applied
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          toast({
            title: 'Feature Not Available',
            description: 'Please apply database migrations to use consumables',
            variant: 'destructive',
          })
          return
        }
        throw error
      }

      toast({
        title: 'Power-up Activated!',
        description: `${item.items.emoji} ${item.items.name} is now active`,
      })

      // Refresh inventory and active powerups
      fetchInventory()
      fetchActivePowerups()
    } catch (error: any) {
      console.error('Error using consumable:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to use item',
        variant: 'destructive',
      })
    }
  }

  const filteredInventory = selectedCategory === 'all'
    ? inventory
    : inventory.filter(item => item.items.type === selectedCategory)

  const categories = [
    { id: 'all', label: 'All Items', emoji: '🎒' },
    { id: 'consumable', label: 'Consumables', emoji: '🧪' },
    { id: 'weapon', label: 'Weapons', emoji: '⚔️' },
    { id: 'armor', label: 'Armor', emoji: '🛡️' },
    { id: 'accessory', label: 'Accessories', emoji: '💍' },
    { id: 'cosmetic', label: 'Cosmetics', emoji: '👑' },
  ]

  const inventoryStats = {
    total: inventory.length,
    equipped: inventory.filter(item => item.is_equipped).length,
    consumables: inventory.filter(item => item.items.type === 'consumable').reduce((sum, item) => sum + item.quantity, 0),
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={mockUserData} />}
      rightSidebar={<RightSidebar />}
    >
      <div className="space-y-6">
        {/* Active Power-ups */}
        <ActivePowerups />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Inventory</h1>
            <p className="text-sm text-neutral-400">
              {inventoryStats.total} items • {inventoryStats.equipped} equipped • {inventoryStats.consumables} consumables
            </p>
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

        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400">
            Loading inventory...
          </div>
        ) : filteredInventory.length === 0 ? (
          <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
            <div className="text-6xl mb-4">🎒</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedCategory === 'all' ? 'Inventory empty' : 'No items in this category'}
            </h3>
            <p className="text-neutral-400">
              {selectedCategory === 'all' 
                ? 'Purchase items from the shop to get started' 
                : 'Try selecting a different category'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map(item => (
              <Card
                key={item.id}
                className={`p-6 ${rarityColors[item.items.rarity]} border-2 hover:scale-[1.02] transition-all duration-200 relative`}
              >
                {item.is_equipped && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                    EQUIPPED
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{item.items.emoji}</div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{item.items.name}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${rarityTextColors[item.items.rarity]}`}>
                      {item.items.rarity}
                    </p>
                    
                    <p className="text-sm text-neutral-300 mb-3 line-clamp-2">
                      {item.items.description}
                    </p>
                    
                    {item.items.effect_type && (
                      <div className="text-xs text-neutral-400 mb-3 bg-neutral-900/50 rounded px-2 py-1.5 border border-neutral-700">
                        <span className="text-neutral-500">Effect:</span>{' '}
                        <span className="text-white">
                          {item.items.effect_type.replace(/_/g, ' ')}
                          {item.items.effect_value && ` (${item.items.effect_value}x)`}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-700">
                      <div className="text-sm">
                        <span className="text-neutral-400">Quantity:</span>{' '}
                        <span className="text-white font-bold">{item.quantity}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {item.items.type === 'consumable' ? (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleUseConsumable(item)}
                          >
                            Use
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant={item.is_equipped ? 'outline' : 'default'}
                            onClick={() => handleEquipToggle(item)}
                          >
                            {item.is_equipped ? 'Unequip' : 'Equip'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  )
}
