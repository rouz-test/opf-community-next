import { Text, type TextProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'outline';

type BadgeProps = Omit<TextProps, 'variant'> & {
  variant?: BadgeVariant;
  children?: ReactNode;
};

const variantStyles: Record<BadgeVariant, TextProps> = {
  default: {
    borderColor: 'transparent',
    bg: '#F97316',
    color: '#FFFFFF',
  },
  outline: {
    borderColor: '#E5E7EB',
    bg: '#FFFFFF',
    color: '#374151',
  },
};

export function Badge({
  variant = 'default',
  children,
  borderRadius = '9999px',
  fontSize = '12px',
  fontWeight = '500',
  px = '8px',
  py = '2px',
  ...props
}: BadgeProps) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      borderWidth="1px"
      borderRadius={borderRadius}
      fontSize={fontSize}
      fontWeight={fontWeight}
      lineHeight="1.2"
      px={px}
      py={py}
      {...variantStyles[variant]}
      {...props}
    >
      {children}
    </Text>
  );
}
