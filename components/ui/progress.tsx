import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'xp' | 'health' | 'streak';
}

const variantStyles = {
  default: 'bg-accent-blue',
  xp: 'bg-gradient-to-r from-accent-blue to-accent-gold',
  health: 'bg-gradient-to-r from-accent-red to-accent-red-dark',
  streak: 'bg-gradient-to-r from-accent-green to-accent-green-dark',
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn('relative w-full', className)}
        {...props}
      >
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-800 border border-gray-700">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out shadow-lg',
              variantStyles[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {value} / {max}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

// XP Bar variant with glow effect
export const XPBar = React.forwardRef<HTMLDivElement, Omit<ProgressProps, 'variant'>>(
  (props, ref) => (
    <Progress ref={ref} variant="xp" {...props} />
  )
);
XPBar.displayName = 'XPBar';

export { Progress };
