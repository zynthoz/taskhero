"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PurchaseAnimation } from '@/components/gamification/purchase-animation'

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
}

interface ShopItemCardProps {
  item: ShopItem
  isFeatured?: boolean
  onPurchase: (item: ShopItem) => Promise<void>
  userGold: number
  userGems: number
}

const rarityColors = {
  common: 'border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800/30',
  rare: 'border-blue-400/50 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-950/30',
  epic: 'border-purple-400/50 dark:border-purple-500/50 bg-purple-50 dark:bg-purple-950/30',
  legendary: 'border-amber-400/50 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/30',
}

const rarityTextColors = {
  common: 'text-neutral-600 dark:text-neutral-400',
  rare: 'text-blue-600 dark:text-blue-400',
  epic: 'text-purple-600 dark:text-purple-400',
  legendary: 'text-amber-600 dark:text-amber-400',
}

const rarityGlowColors = {
  common: '',
  rare: 'shadow-blue-500/20',
  epic: 'shadow-purple-500/20',
  legendary: 'shadow-amber-500/30',
}

export function ShopItemCard({ item, isFeatured, onPurchase, userGold, userGems }: ShopItemCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  const canAfford = userGold >= item.cost_gold && userGems >= item.cost_gems

  const handlePurchaseClick = () => {
    if (!canAfford) return
    setShowConfirmDialog(true)
  }

  const confirmPurchase = async () => {
    setPurchasing(true)
    try {
      await onPurchase(item)
      setShowConfirmDialog(false)
      setShowAnimation(true)
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <>
      <Card
        className={`p-6 ${rarityColors[item.rarity]} ${rarityGlowColors[item.rarity]} border-2 hover:scale-[1.02] transition-all duration-200 relative overflow-hidden ${
          item.rarity === 'legendary' ? 'animate-shimmer' : item.rarity === 'epic' ? 'animate-glow-pulse' : ''
        }`}
      >
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            ✨ FEATURED
          </div>
        )}
        
        <div className="text-5xl mb-4 text-center animate-bounce-subtle">{item.emoji}</div>
        
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 truncate">{item.name}</h3>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${rarityTextColors[item.rarity]}`}>
          {item.rarity}
        </p>
        
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4 min-h-[40px] line-clamp-2">
          {item.description}
        </p>
        
        {item.effect_type && (
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 bg-neutral-200/50 dark:bg-neutral-900/50 rounded px-2 py-1.5 border border-neutral-300 dark:border-neutral-700">
            <span className="text-neutral-500">Effect:</span>{' '}
            <span className="text-neutral-900 dark:text-white">
              {item.effect_type.replace(/_/g, ' ')}
              {item.effect_value && ` (${item.effect_value}x)`}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-300 dark:border-neutral-700">
          <div className="flex flex-col gap-1">
            {item.cost_gold > 0 && (
              <div className={`flex items-center gap-1.5 font-bold ${
                userGold >= item.cost_gold ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-500'
              }`}>
                <span>🪙</span>
                <span>{item.cost_gold.toLocaleString()}</span>
              </div>
            )}
            {item.cost_gems > 0 && (
              <div className={`flex items-center gap-1.5 font-bold ${
                userGems >= item.cost_gems ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-600 dark:text-red-500'
              }`}>
                <span>💎</span>
                <span>{item.cost_gems.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handlePurchaseClick}
            disabled={!canAfford}
            className={`${
              canAfford
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
            }`}
          >
            {canAfford ? 'Buy' : 'Locked'}
          </Button>
        </div>
      </Card>

      {/* Purchase Animation */}
      <PurchaseAnimation
        show={showAnimation}
        itemName={item.name}
        itemEmoji={item.emoji}
        rarity={item.rarity}
        onComplete={() => setShowAnimation(false)}
      />

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="text-3xl">{item.emoji}</span>
              Confirm Purchase
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to purchase <span className="text-neutral-900 dark:text-white font-semibold">{item.name}</span>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Item:</span>
                <span className="text-neutral-900 dark:text-white font-semibold">{item.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Rarity:</span>
                <span className={`font-semibold ${rarityTextColors[item.rarity]}`}>
                  {item.rarity.toUpperCase()}
                </span>
              </div>
              {item.effect_type && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Effect:</span>
                  <span className="text-neutral-900 dark:text-white">
                    {item.effect_type.replace(/_/g, ' ')}
                    {item.effect_value && ` ${item.effect_value}x`}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Cost:</div>
              {item.cost_gold > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <span>🪙</span> Gold
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">-{item.cost_gold.toLocaleString()}</span>
                </div>
              )}
              {item.cost_gems > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <span>💎</span> Gems
                  </span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">-{item.cost_gems.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                {item.cost_gold > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">New Gold Balance:</span>
                    <span className="text-neutral-900 dark:text-white font-semibold">
                      {(userGold - item.cost_gold).toLocaleString()}
                    </span>
                  </div>
                )}
                {item.cost_gems > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">New Gem Balance:</span>
                    <span className="text-neutral-900 dark:text-white font-semibold">
                      {(userGems - item.cost_gems).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={purchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPurchase}
              disabled={purchasing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {purchasing ? 'Purchasing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
