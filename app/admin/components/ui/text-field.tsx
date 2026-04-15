'use client';

import type { ReactNode } from 'react';
import { Flex, Input, Text, type InputProps } from '@chakra-ui/react';

type AdminTextFieldProps = Omit<InputProps, 'size'> & {
  label?: ReactNode;
  errorText?: ReactNode;
};

export default function AdminTextField({
  label,
  errorText,
  h = '40px',
  borderRadius = '6px',
  borderColor = '#D1D5DB',
  fontSize = '12px',
  color = '#111827',
  ...rest
}: AdminTextFieldProps) {
  const value = typeof rest.value === 'string' ? rest.value : '';
  const maxLength = rest.maxLength as number | undefined;
  const isOverLimit = maxLength !== undefined && value.length > maxLength;
  const hasExternalError = !!errorText && !isOverLimit;
  const isError = isOverLimit || hasExternalError;

  return (
    <Flex direction="column" gap="8px" w="100%">
      {label ? (
        <Text fontSize="12px" fontWeight="600" color="#4B5563">
          {label}
        </Text>
      ) : null}

      <Input
        w="100%"
        h={h}
        borderRadius={borderRadius}
        borderColor={isError ? '#FF5A5A' : borderColor}
        fontSize={fontSize}
        color={color}
        _placeholder={{ color: '#C2C7CF' }}
        _focus={{
          borderColor: isError ? '#FF5A5A' : borderColor,
          boxShadow: isError
            ? '0 0 0 3px rgba(255, 90, 90, 0.08)'
            : '0 0 0 3px rgba(0, 0, 0, 0.05)',
          outline: 'none',
        }}
        _focusVisible={{
          borderColor: isError ? '#FF5A5A' : borderColor,
          boxShadow: isError
            ? '0 0 0 3px rgba(255, 90, 90, 0.08)'
            : '0 0 0 3px rgba(0, 0, 0, 0.05)',
          outline: 'none',
        }}
        {...rest}
      />

      {isError && errorText ? (
        <Text fontSize="11px" fontWeight="500" color="#FF5A5A">
          {errorText}
        </Text>
      ) : null}
    </Flex>
  );
}
