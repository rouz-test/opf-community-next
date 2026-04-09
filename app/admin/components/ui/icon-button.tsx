'use client';

import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '@chakra-ui/react';

type AdminIconButtonProps = Omit<ButtonProps, 'children'> & {
  children: ReactNode;
  'aria-label'?: string;
};

export default function AdminIconButton({
  children,
  'aria-label': ariaLabel,
  h = '32px',
  w = '32px',
  borderRadius = '6px',
  ...rest
}: AdminIconButtonProps) {
  return (
    <Button
      type="button"
      unstyled
      display="inline-flex"
      h={h}
      w={w}
      alignItems="center"
      justifyContent="center"
      borderRadius={borderRadius}
      _hover={{ bg: '#F9FAFB' }}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </Button>
  );
}
