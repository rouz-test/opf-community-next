

'use client';

import type { ReactNode } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';

type AdminBadgeTone = 'orange' | 'gray' | 'black' | 'yellow' | 'blue' | 'pink' | 'purple';

type AdminBadgeProps = BoxProps & {
  children: ReactNode;
  tone?: AdminBadgeTone;
  rounded?: 'full' | 'md';
};

const toneStyles: Record<AdminBadgeTone, BoxProps> = {
  orange: {
    bg: '#FFF1E8',
    color: '#F59E42',
    borderColor: '#FDE2CF',
  },
  gray: {
    bg: '#F3F4F6',
    color: '#6B7280',
    borderColor: '#E5E7EB',
  },
  black: {
    bg: '#111827',
    color: 'white',
    borderColor: '#111827',
  },
  yellow: {
    bg: '#FEF3C7',
    color: '#D97706',
    borderColor: '#FDE68A',
  },
  blue: {
    bg: '#DBEAFE',
    color: '#2563EB',
    borderColor: '#BFDBFE',
  },
  pink: {
    bg: '#FCE7F3',
    color: '#DB2777',
    borderColor: '#FBCFE8',
  },
  purple: {
    bg: '#EDE9FE',
    color: '#7C3AED',
    borderColor: '#DDD6FE',
  },
};

export default function AdminBadge({
  children,
  tone = 'orange',
  rounded = 'full',
  px,
  py,
  fontSize = '11px',
  fontWeight = '600',
  lineHeight = '1',
  border,
  borderRadius,
  display,
  alignItems,
  justifyContent,
  minW,
  h,
  ...rest
}: AdminBadgeProps) {
  const radius = rounded === 'full' ? '9999px' : '8px';

  return (
    <Box
      as="span"
      display={display ?? 'inline-flex'}
      alignItems={alignItems ?? 'center'}
      justifyContent={justifyContent ?? 'center'}
      minW={minW}
      h={h}
      px={px ?? '12px'}
      py={py ?? '4px'}
      fontSize={fontSize}
      fontWeight={fontWeight}
      lineHeight={lineHeight}
      border={border ?? '1px solid'}
      borderRadius={borderRadius ?? radius}
      whiteSpace="nowrap"
      {...toneStyles[tone]}
      {...rest}
    >
      {children}
    </Box>
  );
}