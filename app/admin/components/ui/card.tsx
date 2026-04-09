'use client';

import type { PropsWithChildren } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';

type AdminCardProps = PropsWithChildren<
  Omit<BoxProps, 'children'> & {
    bordered?: boolean;
  }
>;

export default function AdminCard({
  children,
  bordered = true,
  bg = 'white',
  border,
  borderColor,
  borderRadius = '16px',
  p = '24px',
  boxShadow = 'none',
  ...rest
}: AdminCardProps) {
  return (
    <Box
      bg={bg}
      border={border ?? (bordered ? '1px solid' : 'none')}
      borderColor={borderColor ?? (bordered ? '#E5E7EB' : 'transparent')}
      borderRadius={borderRadius}
      p={p}
      boxShadow={boxShadow}
      {...rest}
    >
      {children}
    </Box>
  );
}
