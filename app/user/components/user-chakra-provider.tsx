'use client';

import type { PropsWithChildren } from 'react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

const userSystem = createSystem({
  ...defaultConfig,
  globalCss: {
    'input, textarea, select': {
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    'input:focus, input:focus-visible, textarea:focus, textarea:focus-visible, select:focus, select:focus-visible': {
      outline: 'none',
    },
  },
});

export default function UserChakraProvider({ children }: PropsWithChildren) {
  return <ChakraProvider value={userSystem}>{children}</ChakraProvider>;
}
