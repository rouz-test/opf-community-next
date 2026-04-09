'use client';

import type { ReactNode } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

type AdminSelectTriggerProps = {
  label: ReactNode;
  isOpen?: boolean;
  minW?: string;
  h?: string;
  px?: string;
  color?: string;
  borderColor?: string;
  bg?: string;
  rounded?: string;
  onClick?: () => void;
};

function ChevronIcon({ isOpen = false, color = '#F59E42' }: { isOpen?: boolean; color?: string }) {
  return (
    <Box
      as="span"
      color={color}
      fontSize="10px"
      lineHeight="1"
      transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
      transition="transform 0.2s ease"
    >
      ▾
    </Box>
  );
}

export default function AdminSelectTrigger({
  label,
  isOpen = false,
  minW = '72px',
  h = '36px',
  px = '12px',
  color = '#F59E42',
  borderColor = '#F59E42',
  bg = 'white',
  rounded = '10px',
  onClick,
}: AdminSelectTriggerProps) {
  return (
    <Button type="button" unstyled onClick={onClick} minW="auto" h="auto" p="0">
      <Flex
        align="center"
        justify="space-between"
        gap="8px"
        minW={minW}
        h={h}
        px={px}
        border="1px solid"
        borderColor={borderColor}
        borderRadius={rounded}
        bg={bg}
        color={color}
        fontSize="13px"
        fontWeight="600"
        transition="background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease"
        _hover={{ bg: '#FFF8F1' }}
        _active={{ bg: '#FFF4E8' }}
      >
        <Text as="span" fontSize="13px" fontWeight="600" lineHeight="1" color="inherit">
          {label}
        </Text>
        <ChevronIcon isOpen={isOpen} color={typeof color === 'string' ? color : '#F59E42'} />
      </Flex>
    </Button>
  );
}