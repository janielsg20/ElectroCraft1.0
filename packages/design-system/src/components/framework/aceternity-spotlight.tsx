import { useId, type SVGProps } from 'react';
import { cn } from '../../lib/utils';

/** Source-owned adaptation of Aceternity UI's Spotlight registry component. */
export function AceternitySpotlight({ className, ...props }: SVGProps<SVGSVGElement>) {
  const filterId = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn('ec-framework-spotlight', className)}
      viewBox="0 0 3787 2842"
      fill="none"
      {...props}
    >
      <g filter={`url(#${filterId})`}>
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-.822377 -.568943 -.568943 .822377 3631.88 2291.09)"
          fill="currentColor"
          fillOpacity=".22"
        />
      </g>
      <defs>
        <filter id={filterId} x="0" y="0" width="3787" height="2842" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="151" />
        </filter>
      </defs>
    </svg>
  );
}
