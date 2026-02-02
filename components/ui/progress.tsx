import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'xp' | 'health' | 'streak';
}

const variantStyles = {
  default: 'bg-white',
  xp: 'bg-blue-500',
  health: 'bg-red-500',
  streak: 'bg-green-500',
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
        <div className="h-3 w-full overflow-hidden rounded-md bg-neutral-900 border border-neutral-800">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              variantStyles[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
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
