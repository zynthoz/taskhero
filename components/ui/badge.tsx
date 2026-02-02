import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-black',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
        primary:
          'border-transparent bg-white text-black hover:bg-neutral-200',
        secondary:
          'border-blue-900 bg-blue-950/50 text-blue-400 hover:bg-blue-950/70',
        success:
          'border-green-900 bg-green-950/50 text-green-400 hover:bg-green-950/70',
        danger:
          'border-red-900 bg-red-950/50 text-red-400 hover:bg-red-950/70',
        work:
          'border-red-900 bg-red-950/50 text-red-400',
        health:
          'border-pink-900 bg-pink-950/50 text-pink-400',
        learning:
          'border-blue-900 bg-blue-950/50 text-blue-400',
        social:
          'border-green-900 bg-green-950/50 text-green-400',
        finance:
          'border-yellow-900 bg-yellow-950/50 text-yellow-400',
        personal:
          'border-purple-900 bg-purple-950/50 text-purple-400',
        outline:
          'text-neutral-300 border-neutral-700 hover:bg-neutral-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
