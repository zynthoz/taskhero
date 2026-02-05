'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ActivePowerups } from '@/components/gamification/active-powerups'
import { CharacterEquipment } from '@/components/inventory/character-equipment'

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
    type: 'weapon' | 'armor_plate' | 'accessory' | 'belt' | 'consumable' | 'cosmetic'
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    cost_gold: number
    cost_gems: number
    emoji: string
    effect_type?: string
    effect_value?: number
    effect_duration?: number
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

export default function ProfileInventory() {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [activePowerups, setActivePowerups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchInventory()
      fetchActivePowerups()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setInventory([])
          return
        }
        console.error('Error fetching inventory:', error)
        return
      }
      setInventory(data || [])
    } finally {
      setLoading(false)
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
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setActivePowerups([])
          return
        }
        console.error('Error fetching active powerups:', error)
        return
      }
      setActivePowerups(data || [])
    } catch (error) {
      console.error('Unexpected error fetching active powerups:', error)
    }
  }

  const handleEquipToggle = async (item: InventoryItem) => {
    try {
      const newEquippedState = !item.is_equipped

      if (newEquippedState) {
        const equippedOfType = inventory.filter(
          inv => inv.is_equipped && inv.items.type === item.items.type
        )

        const slotLimits: Record<string, number> = {
          weapon: 1,
          armor_plate: 1,
          accessory: 2,
          belt: 2,
        }

        const limit = slotLimits[item.items.type]
        if (limit && equippedOfType.length >= limit) {
          toast({
            title: 'Slot Limit Reached',
            description: `You can only equip ${limit} ${item.items.type}${limit > 1 ? 's' : ''} at a time. Unequip one first.`,
            variant: 'destructive',
          })
          return
        }
      }

      const { error } = await supabase
        .from('user_inventory')
        .update({ is_equipped: newEquippedState })
        .eq('id', item.id)

      if (error) throw error

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

  const handleUseConsumable = async (item: InventoryItem) => {
    try {
      const { data, error } = await supabase.rpc('use_consumable_item', {
        p_user_id: user?.id,
        p_inventory_id: item.id,
      })

      if (error) {
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
    { id: 'armor_plate', label: 'Armor Plates', emoji: '🛡️' },
    { id: 'accessory', label: 'Accessories', emoji: '💍' },
    { id: 'belt', label: 'Belts', emoji: '🔗' },
    { id: 'cosmetic', label: 'Cosmetics', emoji: '👑' },
  ]

  const inventoryStats = {
    total: inventory.length,
    equipped: inventory.filter(item => item.is_equipped).length,
    consumables: inventory.filter(item => item.items.type === 'consumable').reduce((sum, item) => sum + item.quantity, 0),
  }

  const equippedItems = inventory
    .filter(item => item.is_equipped && ['weapon', 'armor_plate', 'accessory', 'belt'].includes(item.items.type))
    .map(item => ({
      id: item.id,
      name: item.items.name,
      emoji: item.items.emoji,
      type: item.items.type as 'weapon' | 'armor_plate' | 'accessory' | 'belt',
      rarity: item.items.rarity,
    }))

  const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }

  const sortedFilteredInventory = [...filteredInventory].sort((a, b) => {
    if (a.is_equipped && !b.is_equipped) return -1
    if (!a.is_equipped && b.is_equipped) return 1

    const rarityDiff = rarityOrder[b.items.rarity] - rarityOrder[a.items.rarity]
    if (rarityDiff !== 0) return rarityDiff

    const nameDiff = a.items.name.localeCompare(b.items.name)
    if (nameDiff !== 0) return nameDiff

    return a.items.type.localeCompare(b.items.type)
  })

  return (
    <div className="space-y-6">
      <ActivePowerups />

      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Equipment</h3>
        <CharacterEquipment equippedItems={equippedItems} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">My Inventory</h3>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <SelectValue placeholder="Filter category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{category.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {inventoryStats.total} items • {inventoryStats.equipped} equipped • {inventoryStats.consumables} consumables
        </p>

        {loading ? (
          <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">
            Loading inventory...
          </div>
        ) : sortedFilteredInventory.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-6xl mb-4">🎒</div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {selectedCategory === 'all' ? 'Inventory empty' : 'No items in this category'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {selectedCategory === 'all' 
                ? 'Purchase items from the shop to get started' 
                : 'Try selecting a different category'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFilteredInventory.map(item => (
              <Card
                key={item.id}
                className={`p-6 ${rarityColors[item.items.rarity]} border-2 hover:scale-[1.02] transition-all duration-200 relative`}>
                {item.is_equipped && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                    EQUIPPED
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="text-5xl">{item.items.emoji}</div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">{item.items.name}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${rarityTextColors[item.items.rarity]}`}>
                      {item.items.rarity}
                    </p>

                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3 line-clamp-2">
                      {item.items.description}
                    </p>

                    {item.items.effect_type && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 bg-neutral-100 dark:bg-neutral-900/50 rounded px-2 py-1.5 border border-neutral-200 dark:border-neutral-700">
                        <span className="text-neutral-500">Effect:</span>{' '}
                        <span className="text-neutral-900 dark:text-white">
                          {item.items.effect_type.replace(/_/g, ' ')}
                          {item.items.effect_value && ` (${item.items.effect_value}x)`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Quantity:</span>{' '}
                        <span className="text-neutral-900 dark:text-white font-bold">{item.quantity}</span>
                      </div>

                      <div className="flex gap-2">
                        {item.items.type === 'consumable' ? (
                          <Button size="sm" variant="default" onClick={() => handleUseConsumable(item)}>
                            Use
                          </Button>
                        ) : (
                          <Button size="sm" variant={item.is_equipped ? 'outline' : 'default'} onClick={() => handleEquipToggle(item)}>
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
    </div>
  )
}
