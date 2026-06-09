'use client';

import { forwardRef, type SVGProps } from 'react';

type CommunityIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const CommunityIcon = forwardRef<SVGSVGElement, CommunityIconProps>(
  ({ size = 16, boxSize, color = 'currentColor', style, ...props }, ref) => {
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
          d="M79.1667 16.6667H74.5792C72.6417 7.17083 64.225 0 54.1667 0H20.8333C9.34583 0 0 9.34583 0 20.8333V74.3917C0 77.7 1.8125 80.725 4.725 82.2833C6.05 82.9958 7.50417 83.3458 8.95417 83.3458C10.6875 83.3458 12.4167 82.8417 13.9125 81.8458L26.2042 73.65C29.0833 81.7125 36.7917 87.5 45.8333 87.5H69.5708L86.0875 98.5125C87.5875 99.5125 89.3125 100.017 91.0458 100.017C92.4958 100.017 93.9458 99.6625 95.275 98.95C98.1917 97.3917 100 94.3667 100 91.0583V37.5C100 26.0125 90.6542 16.6667 79.1667 16.6667ZM9.29167 74.9125C9.2125 74.9625 8.97917 75.1125 8.65833 74.9417C8.32917 74.7667 8.32917 74.4875 8.32917 74.3958V20.8333C8.32917 13.9417 13.9375 8.33333 20.8292 8.33333H54.1625C61.0542 8.33333 66.6625 13.9417 66.6625 20.8333V50C66.6625 56.8917 61.0542 62.5 54.1625 62.5H29.1625C27.8 62.5 26.9083 63.1625 26.8083 63.2292L9.29167 74.9125ZM91.6667 91.0625C91.6667 91.15 91.6667 91.4333 91.3375 91.6083C91.0083 91.7792 90.7833 91.6292 90.7083 91.5792L73.1458 79.8667C72.4625 79.4125 71.6583 79.1667 70.8333 79.1667H45.8333C40.4 79.1667 35.7708 75.6833 34.05 70.8333H54.1667C65.6542 70.8333 75 61.4875 75 50V25H79.1667C86.0583 25 91.6667 30.6083 91.6667 37.5V91.0625Z"
          fill={color}
        />
      </svg>
    );
  },
);

CommunityIcon.displayName = 'CommunityIcon';

export default CommunityIcon;
