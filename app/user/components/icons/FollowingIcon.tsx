'use client';

import { forwardRef, type SVGProps } from 'react';

type FollowingIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const FollowingIcon = forwardRef<SVGSVGElement, FollowingIconProps>(
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
          d="M33.3333 50C47.1208 50 58.3333 38.7875 58.3333 25C58.3333 11.2125 47.1208 0 33.3333 0C19.5458 0 8.33333 11.2125 8.33333 25C8.33333 38.7875 19.5458 50 33.3333 50ZM33.3333 8.33333C42.525 8.33333 50 15.8083 50 25C50 34.1917 42.525 41.6667 33.3333 41.6667C24.1417 41.6667 16.6667 34.1917 16.6667 25C16.6667 15.8083 24.1417 8.33333 33.3333 8.33333ZM66.6667 91.6667V95.8333C66.6667 98.1333 64.8 100 62.5 100C60.2 100 58.3333 98.1333 58.3333 95.8333V91.6667C58.3333 77.8792 47.1208 66.6667 33.3333 66.6667C19.5458 66.6667 8.33333 77.8792 8.33333 91.6667V95.8333C8.33333 98.1333 6.46667 100 4.16667 100C1.86667 100 0 98.1333 0 95.8333V91.6667C0 73.2875 14.9542 58.3333 33.3333 58.3333C51.7125 58.3333 66.6667 73.2875 66.6667 91.6667ZM98.7375 42.5708L82.1042 58.7167C79.6833 61.1417 76.4042 62.4958 72.9167 62.4958C69.4292 62.4958 66.15 61.1375 63.6875 58.675L55.475 50.95C53.8 49.375 53.7208 46.7375 55.3 45.0583C56.8792 43.3833 59.5125 43.3042 61.1917 44.8833L69.4917 52.6958C71.4542 54.6542 74.4708 54.5667 76.2542 52.7833L92.9292 36.5917C94.5792 34.9875 97.2167 35.0292 98.8208 36.6792C100.425 38.3292 100.383 40.9708 98.7333 42.5708H98.7375Z"
          fill={color}
        />
      </svg>
    );
  },
);

FollowingIcon.displayName = 'FollowingIcon';

export default FollowingIcon;
