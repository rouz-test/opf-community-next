'use client';

import type { PropsWithChildren } from 'react';
import { Flex } from '@chakra-ui/react';

export default function PageContainer({ children }: PropsWithChildren) {
  return (
    <Flex direction="column" gap="24px">
      {children}
    </Flex>
  );
}
