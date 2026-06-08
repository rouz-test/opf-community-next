'use client';

import { forwardRef, type SVGProps } from 'react';

type CommentFilledIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const CommentFilledIcon = forwardRef<SVGSVGElement, CommentFilledIconProps>(
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
          d="M50.0375 98.6042C48.0542 98.6042 46.0542 97.9042 44.4625 96.4875L28.8458 83.3333H16.6667C7.475 83.3333 0 75.8583 0 66.6667V16.6667C0 7.475 7.475 0 16.6667 0H83.3333C92.525 0 100 7.475 100 16.6667V66.6667C100 75.8583 92.525 83.3333 83.3333 83.3333H71.45L55.4208 96.5833C53.9167 97.925 51.9833 98.6042 50.0375 98.6042Z"
          fill={color}
        />
      </svg>
    );
  },
);

CommentFilledIcon.displayName = 'CommentFilledIcon';

export default CommentFilledIcon;
