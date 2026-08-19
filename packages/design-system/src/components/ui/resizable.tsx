import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export function ResizablePanelGroup({ className, ...props }: ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  );
}

export const ResizablePanel = ResizablePrimitive.Panel;

export function ResizableHandle({
  withHandle = false,
  className,
  ...props
}: ComponentProps<typeof ResizablePrimitive.Separator> & { readonly withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'relative flex w-px items-center justify-center bg-border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full',
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <span className="z-10 flex h-6 w-3 items-center justify-center rounded-sm border border-border bg-surface">
          <GripVertical className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : null}
    </ResizablePrimitive.Separator>
  );
}
