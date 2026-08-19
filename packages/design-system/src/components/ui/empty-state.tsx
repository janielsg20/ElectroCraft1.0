import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly icon?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('grid min-w-0 justify-items-start gap-2 py-4 text-left', className)}
      data-empty-state
      role="status"
    >
      {icon ? <span className="text-muted-foreground [&_svg]:size-5">{icon}</span> : null}
      <div className="grid min-w-0 gap-1">
        <strong className="text-sm font-semibold text-foreground">{title}</strong>
        <p className="max-w-prose text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
