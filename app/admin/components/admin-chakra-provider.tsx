

'use client';

import type { PropsWithChildren } from 'react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

// Remove Chakra global CSS to prevent conflicts with existing Tailwind styles
const { globalCss: _removedGlobalCss, ...restConfig } = defaultConfig as any;
const adminSystem = createSystem(restConfig);

export default function AdminChakraProvider({ children }: PropsWithChildren) {
  return <ChakraProvider value={adminSystem}>{children}</ChakraProvider>;
}