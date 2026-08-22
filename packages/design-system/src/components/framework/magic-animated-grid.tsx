import { motion, useReducedMotion } from 'motion/react';
import { useId, type SVGProps } from 'react';
import { cn } from '../../lib/utils';

const cells = Object.freeze([
  [0, 0],
  [2, 1],
  [4, 0],
  [1, 2],
  [3, 3],
  [5, 2],
] as const);

/** Reduced-motion-safe adaptation of Magic UI's Animated Grid Pattern registry component. */
export function MagicAnimatedGrid({ className, ...props }: SVGProps<SVGSVGElement>) {
  const patternId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <svg aria-hidden="true" className={cn('ec-framework-grid', className)} {...props}>
      <defs>
        <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M.5 18V.5H18" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      {cells.map(([x, y], index) => (
        <motion.rect
          key={`${x}-${y}`}
          width="17"
          height="17"
          x={x * 18 + 1}
          y={y * 18 + 1}
          initial={{ opacity: 0.08 }}
          animate={reduceMotion ? { opacity: 0.16 } : { opacity: [0.08, 0.42, 0.12] }}
          transition={{ duration: 1.8, delay: index * 0.08, ease: 'easeOut' }}
        />
      ))}
    </svg>
  );
}
