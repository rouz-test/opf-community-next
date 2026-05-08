'use client';

import type { PropsWithChildren } from 'react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

const userSystem = createSystem({
  ...defaultConfig,
  globalCss: undefined,
});

export default function UserChakraProvider({ children }: PropsWithChildren) {
  return <ChakraProvider value={userSystem}>{children}</ChakraProvider>;
}
