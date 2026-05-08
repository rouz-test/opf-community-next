import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type UserButtonVariant = 'primary' | 'default' | 'outline' | 'ghost';

type UserButtonSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type ButtonProps = Omit<ChakraButtonProps, 'variant' | 'size'> & {
  variant?: UserButtonVariant;
  variantStyle?: UserButtonVariant;
  size?: UserButtonSize;
  children?: ReactNode;
};

const variantStyles: Record<Exclude<UserButtonVariant, 'default'>, ChakraButtonProps> = {
  primary: {
    bg: '#FF6900',
    color: 'white',
    border: '1px solid #FF6900',
    _hover: {
      bg: '#E55F00',
      borderColor: '#E55F00',
    },
    _active: {
      bg: '#CC5500',
      borderColor: '#CC5500',
    },
  },
  outline: {
    bg: 'white',
    color: '#FF6900',
    border: '1px solid #FF6900',
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

const sizeStyles: Record<UserButtonSize, { h: string; px: string; minW?: string }> = {
  '2xs': { h: '24px', px: '10px', minW: '94px' },
  xs: { h: '32px', px: '12px', minW: '98px' },
  sm: { h: '36px', px: '14px', minW: '110px' },
  md: { h: '40px', px: '16px', minW: '118px' },
  lg: { h: '44px', px: '18px', minW: '118px' },
  xl: { h: '48px', px: '20px', minW: '134px' },
  '2xl': { h: '64px', px: '24px', minW: '134px' },
};

export function Button({
  variant = 'primary',
  variantStyle,
  children,
  size,
  fontSize = '13px',
  fontWeight = '600',
  borderRadius = '10px',
  h,
  px,
  ...props
}: ButtonProps) {
  const resolvedVariant = variantStyle ?? variant;
  const normalizedVariant = resolvedVariant === 'default' ? 'primary' : resolvedVariant;
  const resolvedSize = size ?? 'md';
  const sizeStyle = sizeStyles[resolvedSize];

  const resolvedHeight = h ?? sizeStyle.h;
  const resolvedPaddingX = px ?? sizeStyle.px;
  const resolvedMinWidth = sizeStyle.minW;

  return (
    <ChakraButton
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
      {...variantStyles[normalizedVariant]}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
