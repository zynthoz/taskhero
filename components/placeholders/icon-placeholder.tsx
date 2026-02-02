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
  color = 'bg-accent-blue',
  className,
}: IconPlaceholderProps) {
  const sizeClasses = {
    '24px': 'w-6 h-6 text-xs',
    '32px': 'w-8 h-8 text-base',
    '48px': 'w-12 h-12 text-2xl',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-md',
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'flex items-center justify-center',
          'border-2 border-dashed border-white/50',
          'transition-all duration-200 hover:border-solid',
          sizeClasses[size],
          shapeClasses[shape],
          color
        )}
      >
        <span className="select-none">{emoji}</span>
      </div>
      {label && (
        <span className="text-[10px] text-gray-500 font-mono">
          {label}
        </span>
      )}
    </div>
  );
}

// Category-specific icon placeholders
export function WorkIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="⚔️" color="bg-red-600" />;
}

export function HealthIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="❤️" color="bg-pink-600" />;
}

export function LearningIcon(props: Omit<IconPlaceholderProps, 'emoji' | 'color'>) {
  return <IconPlaceholder {...props} emoji="📚" color="bg-blue-600" />;
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
