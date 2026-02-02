import React from 'react';
import { cn } from '@/lib/utils';

type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
type ItemSize = '48px' | '64px' | '128px' | '160px' | '180px' | '200px' | '256px';

interface ItemPlaceholderProps {
  size?: ItemSize;
  rarity?: ItemRarity;
  emoji?: string;
  label?: string;
  className?: string;
  isEquipped?: boolean;
}

const rarityGradients = {
  common: 'from-gray-600 to-gray-500',
  rare: 'from-blue-600 to-blue-400',
  epic: 'from-purple-600 to-purple-400',
  legendary: 'from-yellow-600 to-yellow-400',
};

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

export function ItemPlaceholder({
  size = '128px',
  rarity = 'common',
  emoji = '⚔️',
  label,
  className,
  isEquipped = false,
}: ItemPlaceholderProps) {
  const sizeClasses = {
    '48px': 'w-12 h-12 text-xl',
    '64px': 'w-16 h-16 text-2xl',
    '128px': 'w-32 h-32 text-5xl',
    '160px': 'w-40 h-40 text-6xl',
    '180px': 'w-[180px] h-[180px] text-6xl',
    '200px': 'w-[200px] h-[200px] text-7xl',
    '256px': 'w-64 h-64 text-8xl',
  };

  return (
    <div className={cn('relative flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-lg flex items-center justify-center',
          'bg-gradient-to-br transition-all duration-300',
          'border-dashed border-2 hover:border-solid hover:scale-105',
          sizeClasses[size],
          rarityGradients[rarity],
          rarityBorders[rarity],
          isEquipped && 'border-solid border-4 shadow-lg'
        )}
      >
        <span className="select-none">{emoji}</span>
        
        {/* Corner badge for image indicator */}
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">IMG</span>
        </div>

        {/* Equipped banner */}
        {isEquipped && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent-gold text-primary px-3 py-0.5 rounded-full text-xs font-bold">
            EQUIPPED
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-xs text-gray-400 font-mono text-center">
          {label}
        </span>
      )}

      {/* Rarity indicator gem */}
      <div className="absolute bottom-0 right-0 text-xs">
        {rarity === 'legendary' && '💎'}
        {rarity === 'epic' && '💜'}
        {rarity === 'rare' && '💙'}
      </div>
    </div>
  );
}

// Preset size variants
export function ItemPlaceholderSmall(props: Omit<ItemPlaceholderProps, 'size'>) {
  return <ItemPlaceholder {...props} size="64px" />;
}

export function ItemPlaceholderMedium(props: Omit<ItemPlaceholderProps, 'size'>) {
  return <ItemPlaceholder {...props} size="128px" />;
}

export function ItemPlaceholderLarge(props: Omit<ItemPlaceholderProps, 'size'>) {
  return <ItemPlaceholder {...props} size="256px" />;
}
