'use client';

import { forwardRef, type SVGProps } from 'react';

type SearchIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const SearchIcon = forwardRef<SVGSVGElement, SearchIconProps>(
  ({ size = 16, boxSize, color = 'currentColor', ...props }, ref) => {
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
          d="M98.7755 92.898L74.7347 68.8571C80.6939 61.5918 84.2857 52.2857 84.2857 42.1429C84.2857 18.8776 65.4082 0 42.1429 0C18.8571 0 0 18.8776 0 42.1429C0 65.4082 18.8571 84.2857 42.1429 84.2857C52.2857 84.2857 61.5714 80.7143 68.8367 74.7551L92.8776 98.7755C94.5102 100.408 97.1429 100.408 98.7755 98.7755C100.408 97.1633 100.408 94.5102 98.7755 92.898ZM42.1429 75.898C23.5102 75.898 8.36735 60.7551 8.36735 42.1429C8.36735 23.5306 23.5102 8.36735 42.1429 8.36735C60.7551 8.36735 75.9184 23.5306 75.9184 42.1429C75.9184 60.7551 60.7551 75.898 42.1429 75.898Z"
          fill={color}
        />
      </svg>
    );
  },
);

SearchIcon.displayName = 'SearchIcon';

export default SearchIcon;
