import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'end',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-48 overflow-hidden rounded-lg border border-border bg-popover p-1.5 text-popover-foreground [box-shadow:var(--ec-shadow)]',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps extends ComponentProps<typeof DropdownMenuPrimitive.Item> {
  readonly destructive?: boolean;
}

export function DropdownMenuItem({ destructive = false, className, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-destructive={destructive ? 'true' : undefined}
      className={cn(
        'relative flex min-h-8 cursor-default select-none items-center rounded-md px-2.5 py-1.5 text-[var(--ec-text-sm)] outline-none',
        'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
        'data-[destructive=true]:text-destructive data-[destructive=true]:focus:bg-destructive/10 data-[destructive=true]:focus:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('-mx-1.5 my-1.5 h-px bg-border', className)} {...props} />;
}
