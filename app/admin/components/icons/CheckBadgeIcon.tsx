'use client';

import { forwardRef, type SVGProps } from 'react';

type CheckBadgeIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const CheckBadgeIcon = forwardRef<SVGSVGElement, CheckBadgeIconProps>(
  ({ size = 16, boxSize, color = '#11B3E9', ...props }, ref) => {
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
        {...props}
      >
        <path
          d="M96.359 41.1173L87.3956 32.1424V24.9841C87.3956 18.105 81.8033 12.5051 74.9318 12.5051H67.781L58.8176 3.53434C54.1046 -1.17811 45.8954 -1.17811 41.1866 3.53434L32.2231 12.5051H25.0724C18.1967 12.5051 12.6086 18.1009 12.6086 24.9841V32.1424L3.641 41.1173C-1.21367 45.9839 -1.21367 53.8963 3.641 58.7629L12.6044 67.7378V74.8961C12.6044 81.7752 18.1967 87.3751 25.0682 87.3751H32.219L41.1824 96.3459C43.5368 98.7 46.6705 100 50 100C53.3295 100 56.459 98.7 58.8134 96.3459L67.7769 87.3751H74.9276C81.8033 87.3751 87.3914 81.7794 87.3914 74.8961V67.7378L96.359 58.7629C101.214 53.8963 101.214 45.9839 96.359 41.1173ZM75.8485 42.5464L54.788 63.3587C52.2294 65.9004 48.8582 67.1753 45.4912 67.1753C42.1242 67.1753 38.7697 65.9045 36.2027 63.3712L25.3724 52.9588C23.7389 51.338 23.7223 48.7047 25.3433 47.0672C26.9684 45.4381 29.5979 45.4172 31.2397 47.038L42.0658 57.4463C43.9535 59.3171 47.0247 59.3213 48.9166 57.4463L69.9812 36.6298C71.6231 35.0048 74.2567 35.0215 75.8777 36.659C77.4987 38.2965 77.482 40.9256 75.8485 42.5464Z"
          fill={color}
        />
      </svg>
    );
  },
);

CheckBadgeIcon.displayName = 'CheckBadgeIcon';

export default CheckBadgeIcon;
