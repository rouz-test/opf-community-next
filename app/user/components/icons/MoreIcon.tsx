'use client';

import { forwardRef, type SVGProps } from 'react';

type MoreIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const MoreIcon = forwardRef<SVGSVGElement, MoreIconProps>(
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
          d="M22.826 57.6087C20.8695 57.6087 18.8042 56.7391 17.3912 55.3261C15.9782 53.913 15.2173 51.9565 15.2173 50C15.2173 48.0435 16.0869 46.0869 17.3912 44.5652C18.8042 43.1522 20.7608 42.3913 22.826 42.3913C24.7825 42.3913 26.739 43.2609 28.1521 44.5652C29.5651 45.9783 30.4347 47.9348 30.4347 50C30.4347 51.9565 29.5651 53.913 28.1521 55.3261C26.739 56.7391 24.7825 57.6087 22.826 57.6087ZM55.326 55.3261C56.739 53.913 57.6086 51.9565 57.6086 50C57.6086 48.0435 56.739 46.0869 55.326 44.5652C53.9129 43.1522 51.9564 42.3913 49.9999 42.3913C48.0434 42.3913 45.9782 43.2609 44.5651 44.5652C43.1521 45.9783 42.3912 47.9348 42.3912 50C42.3912 51.9565 43.2608 53.913 44.5651 55.3261C45.9782 56.7391 47.9347 57.6087 49.9999 57.6087C51.9564 57.6087 53.9129 56.7391 55.326 55.3261ZM82.4999 55.3261C83.9129 53.913 84.7825 51.9565 84.7825 50C84.7825 48.0435 83.9129 46.0869 82.4999 44.5652C81.0869 43.1522 79.1303 42.3913 77.1738 42.3913C75.2173 42.3913 73.1521 43.2609 71.739 44.5652C70.326 45.9783 69.5651 47.9348 69.5651 50C69.5651 51.9565 70.4347 53.913 71.739 55.3261C73.1521 56.7391 75.1086 57.6087 77.1738 57.6087C79.1303 57.6087 81.0869 56.7391 82.4999 55.3261Z"
          fill={color}
        />
      </svg>
    );
  },
);

MoreIcon.displayName = 'MoreIcon';

export default MoreIcon;
