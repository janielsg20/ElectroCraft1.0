import { Circle } from 'lucide-react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} />;
}

export function RadioGroupItem({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'size-4 shrink-0 rounded-full border border-input bg-surface text-primary outline-none transition-[border-color,box-shadow] duration-150',
        'hover:border-border focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 data-[state=checked]:border-primary disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="grid place-items-center">
        <Circle className="size-2 fill-current" aria-hidden="true" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
