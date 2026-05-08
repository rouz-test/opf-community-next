import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type ButtonVariant = 'default' | 'outline';

type ButtonProps = Omit<ChakraButtonProps, 'variant'> & {
  variant?: ButtonVariant;
  children?: ReactNode;
};

const variantStyles: Record<ButtonVariant, ChakraButtonProps> = {
  default: {
    bg: '#F97316',
    color: '#FFFFFF',
    border: '1px solid #F97316',
    _hover: {
      bg: '#EA580C',
      borderColor: '#EA580C',
    },
    _active: {
      bg: '#C2410C',
      borderColor: '#C2410C',
    },
  },
  outline: {
    bg: '#FFFFFF',
    color: '#374151',
    border: '1px solid #E5E7EB',
    _hover: {
      bg: '#F9FAFB',
    },
    _active: {
      bg: '#F3F4F6',
    },
  },
};

export function Button({
  variant = 'default',
  children,
  borderRadius = '8px',
  fontSize = '14px',
  fontWeight = '500',
  h = '40px',
  px = '16px',
  ...props
}: ButtonProps) {
  return (
    <ChakraButton
      unstyled
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius={borderRadius}
      fontSize={fontSize}
      fontWeight={fontWeight}
      h={h}
      px={px}
      transition="background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease"
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed',
      }}
      {...variantStyles[variant]}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
