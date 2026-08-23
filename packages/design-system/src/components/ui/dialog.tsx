import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-[80] bg-overlay/50 backdrop-blur-none"
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[81] max-h-[90dvh] w-[min(720px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto border border-border bg-surface p-5 [border-radius:var(--ec-radius-window)] [box-shadow:var(--ec-shadow)] outline-none focus-visible:ring-2 focus-visible:ring-ring/35 max-md:h-dvh max-md:max-h-none max-md:w-full max-md:rounded-none max-md:border-0',
          className,
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
