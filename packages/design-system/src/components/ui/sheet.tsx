import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export interface SheetContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  readonly side?: 'left' | 'right';
}

export function SheetContent({ side = 'right', className, children, ...props }: SheetContentProps) {
  const sideClassName = side === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border';

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay/45" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 w-[min(92vw,360px)] bg-surface p-4 [box-shadow:var(--ec-shadow)]',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          sideClassName,
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={cn('grid gap-1.5 text-left', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-sm font-semibold text-foreground', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-xs leading-5 text-muted-foreground', className)} {...props} />
  );
}
