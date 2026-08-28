import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import './platform-badge.css';

export type PlatformBadgeTone = 'neutral' | 'supported' | 'adapted' | 'blocked' | 'override';

export interface PlatformBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly label: string;
  readonly tone?: PlatformBadgeTone;
}

export function PlatformBadge({ label, tone = 'neutral', className, ...props }: PlatformBadgeProps) {
  return (
    <span className={cn('ec-platform-badge', className)} data-platform-badge-tone={tone} {...props}>
      {label}
    </span>
  );
}
