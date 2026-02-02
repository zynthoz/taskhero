import React from 'react';
import { cn } from '@/lib/utils';

type PlaceholderSize = '64px' | '128px' | '200px' | '256px' | '280px' | '320px' | '400px';
type PlaceholderVariant = 'default' | 'hover' | 'active';

interface CharacterPlaceholderProps {
  size?: PlaceholderSize;
  variant?: PlaceholderVariant;
  className?: string;
  label?: string;
  emoji?: string;
}

export function CharacterPlaceholder({
  size = '400px',
  variant = 'default',
  className,
  label = 'Character Avatar',
  emoji = '👤',
}: CharacterPlaceholderProps) {
  const sizeClasses = {
    '64px': 'w-16 h-16 text-2xl',
    '128px': 'w-32 h-32 text-5xl',
    '200px': 'w-[200px] h-[200px] text-6xl',
    '256px': 'w-64 h-64 text-7xl',
    '280px': 'w-[280px] h-[320px] text-8xl',
    '320px': 'w-80 h-80 text-9xl',
    '400px': 'w-[400px] h-[400px] text-9xl',
  };

  const variantClasses = {
    default: 'border-dashed border-2',
    hover: 'border-solid border-2 scale-105',
    active: 'border-solid border-3 shadow-lg shadow-accent-gold/50',
  };

  return (
    <div className={cn('relative flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-xl flex items-center justify-center',
          'bg-gradient-to-br from-primary to-accent-blue',
          'border-accent-gold transition-all duration-300',
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        <span className="select-none">{emoji}</span>
      </div>
      {label && (
        <span className="text-xs text-gray-400 font-mono">
          {label}
        </span>
      )}
    </div>
  );
}

// Small variant for sidebar
export function CharacterPlaceholderSmall(props: Omit<CharacterPlaceholderProps, 'size'>) {
  return <CharacterPlaceholder {...props} size="280px" />;
}

// Large variant for hero display
export function CharacterPlaceholderLarge(props: Omit<CharacterPlaceholderProps, 'size'>) {
  return <CharacterPlaceholder {...props} size="400px" />;
}
