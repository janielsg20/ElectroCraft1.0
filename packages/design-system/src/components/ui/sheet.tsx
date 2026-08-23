import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export type SheetSide = 'left' | 'right' | 'bottom';

export interface SheetContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  readonly side?: SheetSide;
}

export function SheetContent({ side = 'right', className, children, ...props }: SheetContentProps) {
  const placementClassName =
    side === 'left'
      ? 'inset-y-2 left-2 w-[min(92vw,400px)] rounded-r-[var(--ec-radius-window)] rounded-l-[var(--ec-radius-panel)] border border-border'
      : side === 'bottom'
        ? 'inset-x-2 bottom-2 max-h-[88dvh] w-[calc(100%-1rem)] rounded-[var(--ec-radius-window)] border border-border'
        : 'inset-y-2 right-2 w-[min(92vw,400px)] rounded-l-[var(--ec-radius-window)] rounded-r-[var(--ec-radius-panel)] border border-border';

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-overlay/45 backdrop-blur-none"
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 bg-surface p-5 [box-shadow:var(--ec-shadow-panel)]',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring/35',
          placementClassName,
          className,
        )}
        data-sheet-side={side}
        data-slot="sheet-content"
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
  return <DialogPrimitive.Title className={cn('text-base font-semibold text-foreground', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-xs leading-5 text-muted-foreground', className)} {...props} />
  );
}
