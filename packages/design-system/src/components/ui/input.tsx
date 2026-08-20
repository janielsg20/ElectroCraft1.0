import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'h-[var(--ec-control-md)] w-full rounded-[var(--ec-studio-field-radius,var(--radius))] border border-input bg-background px-2.5 text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
