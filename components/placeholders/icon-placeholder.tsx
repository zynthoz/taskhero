import React from 'react';
import { cn } from '@/lib/utils';

type IconSize = '24px' | '32px' | '48px';
type IconShape = 'circle' | 'square';

interface IconPlaceholderProps {
  size?: IconSize;
  shape?: IconShape;
  emoji?: string;
  label?: string;
  color?: string;
  className?: string;
}

export function IconPlaceholder({
  size = '32px',
  shape = 'circle',
  emoji = '⚔️',
  label,
  color = 'bg-blue-600',
  className,
}: IconPlaceholderProps) {
  const sizeClasses = {
    '24px': 'w-6 h-6 text-xs',
    '32px': 'w-8 h-8 text-base',
    '48px': 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-lg sm:text-xl md:text-2xl',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-md',
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center',
          'border border-neutral-700',
          'transition-all duration-200 hover:border-neutral-600 hover:scale-105',
          sizeClasses[size],
          shapeClasses[shape],
          color
        )}
      >
        <span className="select-none">{emoji}</span>
      </div>
      {label && (
        <span className="text-[10px] sm:text-xs text-neutral-400 font-medium">
          {label}
        </span>
      )}
    </div>
  );
}

// Category-specific icon placeholders
export function WorkIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="⚔️" color="bg-neutral-800" />;
}

export function HealthIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="❤️" color="bg-neutral-800" />;
}

export function LearningIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="📚" color="bg-neutral-800" />;
}

export function SocialIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="👥" color="bg-green-600" />;
}

export function FinanceIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="💰" color="bg-yellow-600" />;
}

export function PersonalIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="🎨" color="bg-purple-600" />;
}

export function CreativeIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="💡" color="bg-orange-600" />;
}
