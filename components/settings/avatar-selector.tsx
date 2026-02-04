'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { avatarOptions } from '@/lib/avatar-utils'

interface AvatarSelectorProps {
  selectedAvatarId?: string
  onSelect: (avatarId: string) => void
}

const categoryLabels = {
  hero: 'Heroes',
  magic: 'Magical',
  warrior: 'Warriors',
  nature: 'Nature',
  tech: 'Tech',
}

export function AvatarSelector({ selectedAvatarId, onSelect }: AvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const filteredAvatars = selectedCategory === 'all' 
    ? avatarOptions 
    : avatarOptions.filter(avatar => avatar.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hero', label: 'Heroes' },
    { id: 'magic', label: 'Magical' },
    { id: 'warrior', label: 'Warriors' },
    { id: 'nature', label: 'Nature' },
    { id: 'tech', label: 'Tech' },
  ]

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            className="text-xs"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-5 gap-3">
        {filteredAvatars.map(avatar => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              hover:scale-105 hover:border-purple-500
              ${selectedAvatarId === avatar.id 
                ? 'border-purple-500 bg-purple-950/30' 
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900'
              }
            `}
          >
            <div className="text-3xl mb-1">{avatar.emoji}</div>
            <div className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-tight">{avatar.name}</div>
          </button>
        ))}
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Select an avatar to represent your hero throughout your journey
      </p>
    </div>
  )
}
