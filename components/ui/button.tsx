import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-accent-gold to-accent-gold-light text-primary shadow-lg shadow-accent-gold/50 hover:shadow-xl hover:shadow-accent-gold/70 hover:scale-105 active:scale-95',
        secondary:
          'border-2 border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white hover:shadow-lg hover:shadow-accent-blue/50',
        danger:
          'bg-gradient-to-r from-accent-red to-accent-red-dark text-white shadow-lg shadow-accent-red/50 hover:shadow-xl hover:shadow-accent-red/70 hover:scale-105 active:scale-95',
        ghost:
          'text-gray-300 hover:bg-white/10 hover:text-white',
        link:
          'text-accent-gold underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
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
