'use client';

import type { ReactNode } from 'react';
import { Box, Flex } from '@chakra-ui/react';

type PageHeaderProps = {
  left: ReactNode;
  right: ReactNode;
};

export default function PageHeader({ left, right }: PageHeaderProps) {
  return (
    <Box as="section">
      <Flex align="flex-end" justify="space-between" gap="16px">
        <Box minW="0">{left}</Box>
        <Box flexShrink={0}>{right}</Box>
      </Flex>
    </Box>
  );
}
