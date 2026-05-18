

'use client';

import type { PropsWithChildren } from 'react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

// Remove Chakra global CSS to prevent conflicts with existing Tailwind styles
const adminSystem = createSystem({
  ...defaultConfig,
  globalCss: undefined,
});

export default function AdminChakraProvider({ children }: PropsWithChildren) {
  return <ChakraProvider value={adminSystem}>{children}</ChakraProvider>;
}
