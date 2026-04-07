'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type MobileNavContextValue = {
  isOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      openNav: () => setIsOpen(true),
      closeNav: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error('useMobileNav must be used within MobileNavProvider');
  }
  return context;
}