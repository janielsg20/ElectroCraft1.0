import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--ec-studio-button-radius,var(--radius))] text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border border-primary bg-primary text-primary-foreground hover:bg-primary/92',
        theme: 'border border-primary bg-primary text-primary-foreground hover:bg-primary/92',
        secondary: 'border border-transparent bg-secondary text-secondary-foreground hover:bg-muted',
        outline: 'border border-input bg-surface text-foreground hover:border-border hover:bg-muted/70',
        ghost: 'border border-transparent bg-transparent text-foreground hover:bg-muted/80',
        destructive: 'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/92',
      },
      size: {
        sm: 'h-[var(--ec-control-sm)] px-2.5 text-xs',
        md: 'h-[var(--ec-control-md)] px-3 text-[var(--ec-text-sm)]',
        lg: 'h-[var(--ec-control-lg)] px-4 text-sm',
        icon: 'size-[var(--ec-control-md)] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  readonly asChild?: boolean;
}

export function Button({ asChild = false, className, variant, size, type = 'button', ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...(!asChild ? { type } : {})} {...props} />
  );
}
