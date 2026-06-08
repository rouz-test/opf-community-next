'use client';

import { forwardRef, type SVGProps } from 'react';

type BookmarkFilledIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const BookmarkFilledIcon = forwardRef<SVGSVGElement, BookmarkFilledIconProps>(
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
          d="M11.8709 98.125C14.1461 99.0974 16.6615 99.3614 19.089 98.8828C21.5166 98.4041 23.7435 97.2049 25.4792 95.4417L50.0001 71.0542L74.5209 95.4417C75.6642 96.6017 77.0263 97.5234 78.5282 98.1535C80.0302 98.7836 81.6422 99.1096 83.2709 99.1125C84.9451 99.1077 86.6018 98.7721 88.1459 98.125C90.4397 97.1967 92.4003 95.5984 93.7717 93.5386C95.1431 91.4789 95.8616 89.0535 95.8334 86.5792V20.8333C95.8268 15.31 93.6297 10.0148 89.7242 6.10925C85.8186 2.20368 80.5234 0.00661607 75.0001 0L25.0001 0C19.4768 0.00661607 14.1816 2.20368 10.276 6.10925C6.37042 10.0148 4.17336 15.31 4.16674 20.8333V86.5792C4.13985 89.0555 4.86081 91.4822 6.23534 93.5422C7.60987 95.6021 9.574 97.1993 11.8709 98.125Z"
          fill={color}
        />
      </svg>
    );
  },
);

BookmarkFilledIcon.displayName = 'BookmarkFilledIcon';

export default BookmarkFilledIcon;
