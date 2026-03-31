'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type OpenProfileMenuOptions = {
  showCommunitySwitch?: boolean;
  onToggleProfileMode?: () => void;
};

type ProfileMenuContextValue = {
  isOpen: boolean;
  showCommunitySwitch: boolean;
  onToggleProfileMode?: (() => void) | undefined;
  openProfileMenu: (options?: OpenProfileMenuOptions) => void;
  closeProfileMenu: () => void;
};

const ProfileMenuContext = createContext<ProfileMenuContextValue | null>(null);

export function ProfileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCommunitySwitch, setShowCommunitySwitch] = useState(false);
  const [onToggleProfileMode, setOnToggleProfileMode] = useState<(() => void) | undefined>(
    undefined,
  );

  const closeProfileMenu = () => {
    setIsOpen(false);
    setShowCommunitySwitch(false);
    setOnToggleProfileMode(undefined);
  };

  const openProfileMenu = (options?: OpenProfileMenuOptions) => {
    setShowCommunitySwitch(Boolean(options?.showCommunitySwitch));
    setOnToggleProfileMode(() => options?.onToggleProfileMode);
    setIsOpen(true);
  };

  const value = useMemo(
    () => ({
      isOpen,
      showCommunitySwitch,
      onToggleProfileMode,
      openProfileMenu,
      closeProfileMenu,
    }),
    [isOpen, showCommunitySwitch, onToggleProfileMode],
  );

  return <ProfileMenuContext.Provider value={value}>{children}</ProfileMenuContext.Provider>;
}

export function useProfileMenu() {
  const context = useContext(ProfileMenuContext);

  if (!context) {
    throw new Error('useProfileMenu must be used within ProfileMenuProvider');
  }

  return context;
}