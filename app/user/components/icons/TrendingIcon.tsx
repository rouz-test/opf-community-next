'use client';

import { forwardRef, type SVGProps } from 'react';

type TrendingIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const TrendingIcon = forwardRef<SVGSVGElement, TrendingIconProps>(
  ({ size = 18, boxSize, color = 'currentColor', style, ...props }, ref) => {
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
          d="M87.5001 25H62.5001C60.1959 25 58.3334 26.8625 58.3334 29.1667C58.3334 31.4708 60.1959 33.3333 62.5001 33.3333H85.7751L58.4334 60.675C56.0834 63.025 52.2584 63.025 49.9042 60.675L39.3251 50.0958C33.7251 44.4958 24.6126 44.4958 19.0126 50.0958L1.2209 67.8875C-0.408268 69.5167 -0.408268 72.15 1.2209 73.7792C2.0334 74.5917 3.10007 75 4.16673 75C5.2334 75 6.30007 74.5917 7.11257 73.7792L24.9042 55.9875C27.1834 53.7083 31.1542 53.7083 33.4334 55.9875L44.0126 66.5667C49.6126 72.1667 58.7251 72.1667 64.3251 66.5667L91.6709 39.225V62.5C91.6709 64.8042 93.5334 66.6667 95.8376 66.6667C98.1417 66.6667 100.004 64.8042 100.004 62.5V37.5C100.004 30.6083 94.3917 25 87.5001 25Z"
          fill={color}
        />
      </svg>
    );
  },
);

TrendingIcon.displayName = 'TrendingIcon';

export default TrendingIcon;
