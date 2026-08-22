import type { ComponentProps } from 'react';
import { getStudioIcon } from '../../icons';
import { cn } from '../../lib/utils';

const LoadingIcon = getStudioIcon('status.loading');

const loaderSizeClasses = Object.freeze({
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
} as const);

export interface LoaderProps extends Omit<ComponentProps<'span'>, 'children'> {
  readonly label?: string;
  readonly size?: keyof typeof loaderSizeClasses;
  readonly showLabel?: boolean;
  readonly announce?: boolean;
}

export function Loader({
  label = 'Cargando',
  size = 'sm',
  showLabel = false,
  announce = true,
  className,
  ...props
}: LoaderProps) {
  return (
    <span
      data-slot="loader"
      className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}
      role={announce ? 'status' : undefined}
      aria-live={announce ? 'polite' : undefined}
      {...props}
    >
      <LoadingIcon
        className={cn('shrink-0 animate-spin motion-reduce:animate-none', loaderSizeClasses[size])}
        aria-hidden="true"
      />
      <span className={showLabel ? undefined : 'sr-only'}>{label}</span>
    </span>
  );
}
