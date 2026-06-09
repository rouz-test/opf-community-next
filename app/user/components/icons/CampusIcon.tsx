'use client';

import { forwardRef, type SVGProps } from 'react';

type CampusIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  boxSize?: number | string;
};

const CampusIcon = forwardRef<SVGSVGElement, CampusIconProps>(
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
          d="M91.9041 21.7916L61.1791 7.15411C54.4158 3.11427 45.9979 3.04259 39.1666 6.96661L8.09593 21.7916C7.97933 21.85 7.85843 21.9125 7.74593 21.9791C0.372492 26.1951 -2.18727 35.5902 2.02874 42.9637C3.45784 45.4633 5.55999 47.5113 8.09593 48.875L16.6668 52.9584V73.375C16.6719 82.5045 22.6123 90.5701 31.3293 93.2834C37.3955 95.0383 43.6856 95.8975 50.0002 95.8334C56.3139 95.9041 62.6039 95.0521 68.6711 93.3043C77.3881 90.5912 83.3285 82.5254 83.3336 73.3959V52.95L91.667 48.9666V83.3332C91.667 85.6344 93.5324 87.4998 95.8336 87.4998C98.1348 87.4998 100 85.6344 100 83.3332V33.3332C100.028 28.4404 96.1647 23.9205 91.9041 21.7916ZM75 73.3959C75.0022 78.8566 71.4592 83.6869 66.25 85.325C60.9676 86.8344 55.4936 87.567 50 87.5C44.5065 87.567 39.0325 86.8344 33.75 85.325C28.5409 83.6867 24.9979 78.8566 25 73.3959V56.9293L38.8209 63.5127C42.2311 65.5377 46.1258 66.6018 50.0918 66.5918C53.8668 66.6186 57.5784 65.6191 60.8293 63.7002L75 56.9291V73.3959ZM88.3334 41.3541L56.9084 56.3541C52.5268 58.9055 47.0957 58.8332 42.7834 56.1666L12.0375 41.5416C8.61038 39.6936 7.3303 35.4172 9.17835 31.9902C9.80335 30.8313 10.7405 29.8705 11.8834 29.2166L43.1125 14.3C47.4955 11.7543 52.9237 11.8264 57.2375 14.4875L87.9625 29.125C90.2221 30.3797 91.6358 32.749 91.6666 35.3334C91.6707 37.7815 90.4102 40.058 88.3334 41.3541Z"
          fill={color}
        />
      </svg>
    );
  },
);

CampusIcon.displayName = 'CampusIcon';

export default CampusIcon;
