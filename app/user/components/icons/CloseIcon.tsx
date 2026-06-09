'use client';

import { forwardRef, type SVGProps } from 'react';

type CloseIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const CloseIcon = forwardRef<SVGSVGElement, CloseIconProps>(
  ({ size = 20, boxSize, color = 'currentColor', style, ...props }, ref) => {
    const resolvedSize = boxSize ?? size;

    return (
      <svg
        ref={ref}
        width={resolvedSize}
        height={resolvedSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={props['aria-label'] ? undefined : true}
        focusable="false"
        style={{ width: resolvedSize, height: resolvedSize, display: 'block', flexShrink: 0, ...style }}
        {...props}
      >
        <path
          d="M25.6508 77.9957C24.7159 77.9957 23.781 77.6402 23.07 76.9245C21.6433 75.4979 21.6433 73.1852 23.07 71.7587L71.7636 23.0748C73.1903 21.6482 75.5032 21.6482 76.93 23.0748C78.3567 24.5014 78.3567 26.8141 76.93 28.2407L28.2316 76.9245C27.5206 77.6354 26.5857 77.9957 25.6508 77.9957Z"
          fill={color}
        />
        <path
          d="M74.3443 77.9957C73.4094 77.9957 72.4745 77.6402 71.7636 76.9245L23.07 28.2358C21.6433 26.8092 21.6433 24.4965 23.07 23.0699C24.4968 21.6434 26.8097 21.6434 28.2364 23.0699L76.9251 71.7635C78.3518 73.1901 78.3518 75.5028 76.9251 76.9294C76.2142 77.6402 75.2793 78.0005 74.3443 78.0005V77.9957Z"
          fill={color}
        />
      </svg>
    );
  },
);

CloseIcon.displayName = 'CloseIcon';

export default CloseIcon;
