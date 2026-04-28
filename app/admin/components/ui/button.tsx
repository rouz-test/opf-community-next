'use client';

import { Button, type ButtonProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type AdminButtonVariant = 'primary' | 'outline' | 'ghost';

type AdminButtonSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type AdminButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  variantStyle?: AdminButtonVariant;
  size?: AdminButtonSize;
  children: ReactNode;
};

const variantStyles: Record<AdminButtonVariant, ButtonProps> = {
  primary: {
    bg: '#F59E42',
    color: 'white',
    border: '1px solid #F59E42',
    _hover: {
      bg: '#EC8A2E',
      borderColor: '#EC8A2E',
    },
    _active: {
      bg: '#E67E1E',
      borderColor: '#E67E1E',
    },
  },
  outline: {
    bg: 'white',
    color: '#F59E42',
    border: '1px solid #F59E42',
    _hover: {
      bg: '#FFF8F1',
    },
    _active: {
      bg: '#FFF4E8',
    },
  },
  ghost: {
    bg: 'transparent',
    color: '#4B5563',
    border: '1px solid transparent',
    _hover: {
      bg: '#F9FAFB',
      color: '#111827',
    },
    _active: {
      bg: '#F3F4F6',
    },
  },
};

const sizeStyles: Record<AdminButtonSize, { h: string; px: string; minW?: string }> = {
  '2xs': { h: '24px', px: '10px', minW: '94px' },
  'xs': { h: '32px', px: '12px', minW: '98px' },
  'sm': { h: '36px', px: '14px', minW: '110px' },
  'md': { h: '40px', px: '16px', minW: '118px' },
  'lg': { h: '44px', px: '18px', minW: '118px' },
  'xl': { h: '48px', px: '20px', minW: '134px' },
  '2xl': { h: '64px', px: '24px', minW: '134px' },
};

export default function AdminButton({
  variantStyle = 'outline',
  children,
  size,
  fontSize = '13px',
  fontWeight = '600',
  borderRadius = '10px',
  h,
  px,
  ...rest
}: AdminButtonProps) {
  const resolvedSize = size ?? 'md';
  const sizeStyle = sizeStyles[resolvedSize];

  const resolvedHeight = h ?? sizeStyle.h;
  const resolvedPaddingX = px ?? sizeStyle.px;
  const resolvedMinWidth = sizeStyle.minW;

  return (
    <Button
      unstyled
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      gap="8px"
      minW={resolvedMinWidth ?? 'auto'}
      h={resolvedHeight}
      px={resolvedPaddingX}
      fontSize={fontSize}
      fontWeight={fontWeight}
      borderRadius={borderRadius}
      transition="background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease"
      _disabled={{
        bg: '#E5E7EB',
        color: '#9CA3AF',
        borderColor: '#E5E7EB',
        cursor: 'not-allowed',
        opacity: 1,
        pointerEvents: 'none',
      }}
      {...variantStyles[variantStyle]}
      {...rest}
    >
      {children}
    </Button>
  );
}