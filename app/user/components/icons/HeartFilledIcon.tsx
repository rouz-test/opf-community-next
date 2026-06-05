'use client';

import { forwardRef, type SVGProps } from 'react';

type HeartFilledIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const HeartFilledIcon = forwardRef<SVGSVGElement, HeartFilledIconProps>(
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
        <path d="M72.9166 7.98749C68.2247 8.06047 63.6352 9.37021 59.6114 11.7845C55.5877 14.1987 52.2722 17.6319 49.9999 21.7375C47.7276 17.6319 44.4121 14.1987 40.3884 11.7845C36.3647 9.37021 31.7751 8.06047 27.0832 7.98749C19.6038 8.31245 12.557 11.5844 7.48234 17.0885C2.40766 22.5925 -0.282386 29.8813 -9.24077e-05 37.3625C-9.24077e-05 56.3083 19.9416 77 36.6666 91.0292C40.4008 94.1672 45.1222 95.8876 49.9999 95.8876C54.8776 95.8876 59.599 94.1672 63.3332 91.0292C80.0582 77 99.9999 56.3083 99.9999 37.3625C100.282 29.8813 97.5922 22.5925 92.5175 17.0885C87.4428 11.5844 80.396 8.31245 72.9166 7.98749Z" fill={color} />
      </svg>
    );
  },
);

HeartFilledIcon.displayName = 'HeartFilledIcon';

export default HeartFilledIcon;
