import React from 'react';
import { cn } from '@/lib/utils';

type PlaceholderSize = '32px' | '40px' | '48px' | '240x280px' | '300x600px' | '400px' | 'responsive';
type PlaceholderVariant = 'default' | 'hover';

interface CharacterPlaceholderProps {
  size?: PlaceholderSize;
  variant?: PlaceholderVariant;
  className?: string;
  label?: string;
}

export function CharacterPlaceholder({
  size = '400px',
  variant = 'default',
  className,
  label = 'Character',
}: CharacterPlaceholderProps) {
  const sizeClasses = {
    '32px': 'w-8 h-8 text-xs',
    '40px': 'w-10 h-10 text-xs',
    '48px': 'w-12 h-12 text-sm',
    '240x280px': 'w-60 h-[280px] text-sm',
    '300x600px': 'w-[300px] h-[600px] text-base',
    '400px': 'w-[400px] h-[400px] text-base',
    'responsive': 'w-full aspect-square max-w-[140px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] text-xs sm:text-sm md:text-base',
  };

  const variantClasses = {
    default: 'border border-solid border-neutral-800',
    hover: 'border border-solid border-neutral-700 bg-neutral-800',
  };

  return (
    <div className={cn('relative flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-xl flex items-center justify-center',
          'bg-neutral-900',
          'transition-all duration-200',
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        <span className="text-neutral-500 select-none text-center">{label}</span>
      </div>
      {label && (
        <span className="text-xs text-neutral-400 font-mono">
          {label}
        </span>
      )}
    </div>
  );
}

// Small variant for sidebar
export function CharacterPlaceholderSmall(props: Omit<CharacterPlaceholderProps, 'size'>) {
  return <CharacterPlaceholder {...props} size="240x280px" />;
}

// Large variant for hero display (responsive)
export function CharacterPlaceholderLarge(props: Omit<CharacterPlaceholderProps, 'size'>) {
  return <CharacterPlaceholder {...props} size="responsive" />;
}
