'use client';

import { forwardRef, type SVGProps } from 'react';

type BackIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const BackIcon = forwardRef<SVGSVGElement, BackIconProps>(
  ({ size = 24, boxSize, color = 'currentColor', style, ...props }, ref) => {
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
          d="M91.3043 50C91.3043 52.3913 89.3477 54.3478 86.9564 54.3478H23.4782L43.1521 74.1304C44.8912 75.8696 44.8912 78.587 43.1521 80.3261C42.3912 81.087 41.3043 81.5217 40.1086 81.5217C39.0216 81.5217 37.826 81.087 37.0651 80.2174L9.9999 53.0435C8.26077 51.3044 8.26077 48.587 9.9999 46.9565L37.0651 19.7826C38.8043 18.0435 41.5216 18.0435 43.2608 19.7826C44.9999 21.5217 44.9999 24.2391 43.2608 25.9783L23.4782 45.6522H86.9564C89.3477 45.6522 91.3043 47.6087 91.3043 50Z"
          fill={color}
        />
      </svg>
    );
  },
);

BackIcon.displayName = 'BackIcon';

export default BackIcon;
