import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gray-700 text-gray-100 hover:bg-gray-600',
        primary:
          'border-transparent bg-accent-gold text-primary hover:bg-accent-gold-light',
        secondary:
          'border-accent-blue bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30',
        success:
          'border-accent-green bg-accent-green/20 text-accent-green hover:bg-accent-green/30',
        danger:
          'border-accent-red bg-accent-red/20 text-accent-red hover:bg-accent-red/30',
        work:
          'border-red-500 bg-red-500/20 text-red-400',
        health:
          'border-pink-500 bg-pink-500/20 text-pink-400',
        learning:
          'border-blue-500 bg-blue-500/20 text-blue-400',
        social:
          'border-green-500 bg-green-500/20 text-green-400',
        finance:
          'border-yellow-500 bg-yellow-500/20 text-yellow-400',
        personal:
          'border-purple-500 bg-purple-500/20 text-purple-400',
        outline:
          'text-gray-300 border-gray-600 hover:bg-gray-800',
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
