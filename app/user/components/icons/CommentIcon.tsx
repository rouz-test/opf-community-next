'use client';

import { forwardRef, type SVGProps } from 'react';

type CommentIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const CommentIcon = forwardRef<SVGSVGElement, CommentIconProps>(
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
          d="M50.0375 98.6042C48.0542 98.6042 46.0583 97.9042 44.4667 96.4917L28.85 83.3375H16.6708C7.47915 83.3375 0.00415213 75.8625 0.00415213 66.6708V16.6667C-1.45356e-05 7.475 7.47499 0 16.6667 0H83.3333C92.525 0 100 7.475 100 16.6667V66.6667C100 75.8583 92.525 83.3333 83.3333 83.3333H71.45L55.4208 96.5833C53.9125 97.925 51.9833 98.6 50.0333 98.6L50.0375 98.6042ZM16.6667 8.33333C12.0708 8.33333 8.33332 12.0708 8.33332 16.6667V66.6667C8.33332 71.2625 12.0708 75 16.6667 75H30.3708C31.3542 75 32.3042 75.3458 33.0583 75.9792L49.9208 90.1875L67.2958 75.9542C68.0458 75.3375 68.9833 75 69.9542 75H83.3375C87.9333 75 91.6708 71.2625 91.6708 66.6667V16.6667C91.6708 12.0708 87.9333 8.33333 83.3375 8.33333H16.6667Z"
          fill={color}
        />
      </svg>
    );
  },
);

CommentIcon.displayName = 'CommentIcon';

export default CommentIcon;
