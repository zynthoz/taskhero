import React from 'react';
import { cn } from '@/lib/utils';

type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
type ItemSize = '48px' | '64px' | '128px' | '160px' | '180px' | '200px' | '256px' | 'responsive';

interface ItemPlaceholderProps {
  size?: ItemSize;
  rarity?: ItemRarity;
  emoji?: string;
  label?: string;
  className?: string;
  isEquipped?: boolean;
}

const rarityColors = {
  common: 'bg-neutral-800 border-neutral-600',
  rare: 'bg-blue-950/50 border-blue-800',
  epic: 'bg-purple-950/50 border-purple-800',
  legendary: 'bg-yellow-950/50 border-yellow-800',
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
    'responsive': 'w-full aspect-square max-w-[80px] sm:max-w-[100px] md:max-w-[128px] text-2xl sm:text-3xl md:text-5xl',
  };

  return (
    <div className={cn('relative flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-md flex items-center justify-center',
          'transition-all duration-300',
          'border-dashed border-2 hover:border-solid hover:scale-105',
          sizeClasses[size],
          rarityColors[rarity],
          isEquipped && 'border-solid border-2 shadow-lg'
        )}
      >
        <span className="select-none">{emoji}</span>

        {/* Equipped banner */}
        {isEquipped && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-0.5 rounded-full text-xs font-semibold">
            EQUIPPED
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-xs text-neutral-400 font-mono text-center">
          {label}
        </span>
      )}
    </div>
  );
}

// Preset size variants
export function ItemPlaceholderSmall(props: Omit<ItemPlaceholderProps, 'size'>) {
  return <ItemPlaceholder {...props} size="64px" />;
}

export function ItemPlaceholderMedium(props: Omit<ItemPlaceholderProps, 'size'>) {
  return <ItemPlaceholder {...props} size="responsive" />;
}

export function ItemPlaceholderLarge(props: Omit<ItemPlaceholderProps, 'size'>) {
  return <ItemPlaceholder {...props} size="256px" />;
}
