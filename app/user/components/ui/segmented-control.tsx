'use client';

import type { ReactNode } from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';

export type SegmentedControlOption<TValue extends string> = {
  value: TValue;
  label: string;
  icon?: ReactNode;
};

type SegmentedControlProps<TValue extends string> = {
  value: TValue;
  options: Array<SegmentedControlOption<TValue>>;
  onValueChange: (value: TValue) => void;
  'aria-label'?: string;
};

export function SegmentedControl<TValue extends string>({
  value,
  options,
  onValueChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<TValue>) {
  return (
    <Flex overflow="hidden" borderRadius="10px" bg="#FFFFFF" aria-label={ariaLabel}>
      {options.map((option, index) => {
        const isActive = value === option.value;
        const isLast = index === options.length - 1;
        const segmentBorderRadius =
          options.length === 1
            ? '9px'
            : index === 0
              ? '9px 0 0 9px'
              : isLast
                ? '0 9px 9px 0'
                : '0';

        return (
          <Button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            flex="1"
            h="40px"
            px="16px"
            position="relative"
            zIndex={isActive ? 1 : 0}
            ms={index === 0 ? '0' : '-1px'}
            borderRadius={segmentBorderRadius}
            borderWidth="1px"
            borderStyle="solid"
            borderColor={isActive ? '#FFD1A3' : '#E5E7EB'}
            bg={isActive ? '#FFF4E8' : '#FFFFFF'}
            color={isActive ? '#FF6900' : '#4B5563'}
            fontSize="16px"
            fontWeight="600"
            _hover={{ bg: isActive ? '#FFF4E8' : '#F9FAFB' }}
            _focus={{ outline: 'none', boxShadow: 'none' }}
            _focusVisible={{ outline: 'none', boxShadow: 'none' }}
          >
            <Flex align="center" justify="center" gap="8px">
              {option.icon}
              <Text as="span">{option.label}</Text>
            </Flex>
          </Button>
        );
      })}
    </Flex>
  );
}
