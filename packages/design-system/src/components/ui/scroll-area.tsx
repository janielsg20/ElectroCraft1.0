import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ScrollAreaProps extends ComponentProps<typeof ScrollAreaPrimitive.Root> {
  readonly label: string;
  readonly children: ReactNode;
}

export function ScrollArea({ label, className, children, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      role="region"
      aria-label={label}
      className={cn('relative overflow-hidden rounded-md border border-border bg-surface', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="size-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="flex touch-none select-none p-0.5">
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
