import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black dark:focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:scale-105 shadow-lg hover:shadow-xl',
        secondary:
          'border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-lg hover:scale-105',
        danger:
          'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/30 hover:scale-105',
        ghost:
          'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-200 hover:shadow-md',
        link:
          'text-neutral-600 dark:text-neutral-400 underline-offset-4 hover:underline hover:text-neutral-900 dark:hover:text-neutral-200',
        outline:
          'btn-outline border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-xl hover:scale-105',
        default:
          'btn-default bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 text-neutral-900 dark:text-white border-2 border-neutral-300 dark:border-neutral-700 hover:from-neutral-200 hover:to-neutral-300 dark:hover:from-neutral-700 dark:hover:to-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-lg hover:shadow-xl hover:scale-105',
        accent:
          'btn-accent bg-gradient-to-br from-purple-600 to-purple-700 text-white border-2 border-purple-500/30 hover:from-purple-500 hover:to-purple-600 shadow-lg hover:shadow-purple-500/30 hover:scale-105',
        success:
          'bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-green-400/30 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/30 hover:scale-105',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
