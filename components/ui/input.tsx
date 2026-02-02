import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-2 border-gray-700 bg-primary-dark/50 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-lg border-2 border-gray-700 bg-primary-dark/50 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Input, Textarea };
