'use client';

import { Box, Flex, Icon, Input, InputGroup, type InputProps } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

type AdminSearchFieldProps = Omit<InputProps, 'size'> & {
  onEnter?: (value: string) => void;
};

export default function AdminSearchField({
  h = '40px',
  borderRadius = '8px',
  borderColor = '#D1D5DB',
  fontSize = '13px',
  color = '#111827',
  placeholder = '검색어를 입력하세요.',
  onEnter,
  onKeyDown,
  ...rest
}: AdminSearchFieldProps) {
  return (
    <Flex w="100%">
      <InputGroup
        w="100%"
        startElement={
          <Box color="#9CA3AF">
            <Icon as={LuSearch} boxSize="14px" />
          </Box>
        }
      >
        <Input
          w="100%"
          h={h}
          borderRadius={borderRadius}
          borderColor={borderColor}
          fontSize={fontSize}
          color={color}
          placeholder={placeholder}
          _placeholder={{ color: '#C2C7CF' }}
          _focus={{
            borderColor,
            boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
            outline: 'none',
          }}
          _focusVisible={{
            borderColor,
            boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
            outline: 'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              onEnter?.(value);
            }
            onKeyDown?.(e);
          }}
          {...rest}
        />
      </InputGroup>
    </Flex>
  );
}