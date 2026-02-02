import React from 'react';
import { cn } from '@/lib/utils';

interface AchievementPlaceholderProps {
  isUnlocked?: boolean;
  emoji?: string;
  label?: string;
  progress?: number;
  className?: string;
}

export function AchievementPlaceholder({
  isUnlocked = false,
  emoji = '🏆',
  label,
  progress,
  className,
}: AchievementPlaceholderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative">
        {/* Achievement badge */}
        <div
          className={cn(
            'w-32 h-32 rounded-full flex items-center justify-center text-6xl',
            'transition-all duration-300',
            isUnlocked
              ? 'bg-gradient-to-br from-yellow-600 to-yellow-400 border-4 border-solid border-accent-gold shadow-lg shadow-accent-gold/50'
              : 'bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-dashed border-gray-500 grayscale opacity-60'
          )}
        >
          {isUnlocked ? (
            <span className="select-none">{emoji}</span>
          ) : (
            <span className="select-none text-gray-400">🔒</span>
          )}
        </div>

        {/* Sparkles for unlocked */}
        {isUnlocked && (
          <>
            <span className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</span>
            <span className="absolute -bottom-2 -left-2 text-2xl animate-pulse delay-100">✨</span>
          </>
        )}

        {/* Corner IMG badge */}
        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">IMG</span>
        </div>
      </div>

      {/* Progress bar for in-progress achievements */}
      {!isUnlocked && progress !== undefined && (
        <div className="w-full max-w-[128px]">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-blue transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {progress}% Complete
          </span>
        </div>
      )}

      {label && (
        <span className={cn(
          'text-sm font-medium text-center max-w-[128px]',
          isUnlocked ? 'text-accent-gold' : 'text-gray-500'
        )}>
          {label}
        </span>
      )}

      {/* Date earned (for unlocked) */}
      {isUnlocked && (
        <span className="text-xs text-gray-400 font-mono">
          Unlocked Today
        </span>
      )}
    </div>
  );
}

// Locked state variant
export function AchievementPlaceholderLocked(props: Omit<AchievementPlaceholderProps, 'isUnlocked'>) {
  return <AchievementPlaceholder {...props} isUnlocked={false} />;
}

// Unlocked state variant
export function AchievementPlaceholderUnlocked(props: Omit<AchievementPlaceholderProps, 'isUnlocked'>) {
  return <AchievementPlaceholder {...props} isUnlocked={true} />;
}
