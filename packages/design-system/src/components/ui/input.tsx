import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'h-[var(--ec-control-md)] w-full rounded-[var(--ec-studio-field-radius,var(--radius))] border border-input bg-surface px-2.5 text-[var(--ec-text-sm)] text-foreground outline-none transition-[border-color,box-shadow,background-color] duration-150',
        'placeholder:text-muted-foreground hover:border-primary/65 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55',
        className,
      )}
      {...props}
    />
  );
}
