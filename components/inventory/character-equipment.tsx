'use client'

import { Card } from '@/components/ui/card'
import { ItemPlaceholderSmall } from '@/components/placeholders'

interface EquippedItem {
  id: string
  name: string
  emoji: string
  type: 'weapon' | 'armor_plate' | 'accessory' | 'belt'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface CharacterEquipmentProps {
  equippedItems: EquippedItem[]
  onSlotClick?: (type: 'weapon' | 'armor_plate' | 'accessory' | 'belt', slotIndex?: number) => void
}

const rarityBorderColors = {
  common: 'border-neutral-700',
  rare: 'border-blue-500/50',
  epic: 'border-purple-500/50',
  legendary: 'border-amber-500/50',
}

export function CharacterEquipment({ equippedItems, onSlotClick }: CharacterEquipmentProps) {
  // Separate items by type and slot
  const weapon = equippedItems.find(item => item.type === 'weapon')
  const armorPlate = equippedItems.find(item => item.type === 'armor_plate')
  const accessories = equippedItems.filter(item => item.type === 'accessory')
  const belts = equippedItems.filter(item => item.type === 'belt')

  const EquipmentSlot = ({ 
    type, 
    item, 
    label,
    slotIndex
  }: { 
    type: 'weapon' | 'armor_plate' | 'accessory' | 'belt'
    item?: EquippedItem
    label: string
    slotIndex?: number
  }) => (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onSlotClick?.(type, slotIndex)}
        className={`
          w-14 h-14 rounded-lg border-2 
          ${item ? rarityBorderColors[item.rarity] : 'border-neutral-300 dark:border-neutral-800'}
          bg-neutral-100 dark:bg-neutral-900 
          flex items-center justify-center
          hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-200
          relative group
          ${item ? 'hover:scale-105' : ''}
        `}
      >
        {item ? (
          <>
            <span className="text-2xl">{item.emoji}</span>
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center px-1">
              <span className="text-[10px] text-white font-medium text-center leading-tight">{item.name}</span>
            </div>
          </>
        ) : (
          <div className="text-center">
            <span className="text-neutral-700 text-xl">✕</span>
          </div>
        )}
      </button>
      <span className="text-[9px] text-neutral-500 font-medium text-center whitespace-nowrap">{label}</span>
    </div>
  )

  return (
    <div className="flex items-center justify-center gap-6 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      {/* Left Equipment Slots */}
      <div className="flex flex-col gap-3">
        <EquipmentSlot type="weapon" item={weapon} label="Weapon" />
        <EquipmentSlot type="accessory" item={accessories[0]} label="Accessory 1" slotIndex={0} />
        <EquipmentSlot type="belt" item={belts[0]} label="Belt 1" slotIndex={0} />
      </div>
      
      {/* Character Display */}
      <div className="w-32 h-52 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0">
        <div className="text-center">
          <div className="text-5xl mb-1">🧙</div>
          <span className="text-[10px] text-neutral-600">{equippedItems.length}/7</span>
        </div>
      </div>
      
      {/* Right Equipment Slots */}
      <div className="flex flex-col gap-3">
        <EquipmentSlot type="armor_plate" item={armorPlate} label="Armor Plate" />
        <EquipmentSlot type="accessory" item={accessories[1]} label="Accessory 2" slotIndex={1} />
        <EquipmentSlot type="belt" item={belts[1]} label="Belt 2" slotIndex={1} />
      </div>
    </div>
  )
}
