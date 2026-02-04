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
    <div className={cn('flex flex-col items-center gap-1 sm:gap-2', className)}>
      <div className="relative">
        {/* Achievement badge */}
        <div
          className={cn(
            'w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-2xl sm:text-4xl md:text-6xl',
            'transition-all duration-300',
            isUnlocked
              ? 'bg-green-950/50 border-2 border-solid border-green-700 shadow-lg'
              : 'bg-neutral-900 border-2 border-dashed border-neutral-700 grayscale opacity-60'
          )}
        >
          {isUnlocked ? (
            <span className="select-none">{emoji}</span>
          ) : (
            <span className="select-none text-neutral-500">🔒</span>
          )}
        </div>

        {/* Sparkles for unlocked */}
        {isUnlocked && (
          <>
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-sm sm:text-xl md:text-2xl animate-pulse">✨</span>
            <span className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 text-sm sm:text-xl md:text-2xl animate-pulse delay-100">✨</span>
          </>
        )}
      </div>

      {/* Progress bar for in-progress achievements */}
      {!isUnlocked && progress !== undefined && (
        <div className="w-full max-w-[80px] sm:max-w-[100px] md:max-w-[128px]">
          <div className="h-1.5 sm:h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs text-neutral-400 font-mono">
            {progress}% Complete
          </span>
        </div>
      )}

      {label && (
        <span className={cn(
          'text-xs sm:text-sm font-medium text-center max-w-[80px] sm:max-w-[100px] md:max-w-[128px]',
          isUnlocked ? 'text-green-400' : 'text-neutral-500'
        )}>
          {label}
        </span>
      )}

      {/* Date earned (for unlocked) */}
      {isUnlocked && (
        <span className="text-[10px] sm:text-xs text-neutral-400 font-mono">
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
