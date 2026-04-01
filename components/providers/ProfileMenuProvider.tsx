'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type OpenProfileMenuOptions = {
  showCommunitySwitch?: boolean;
  onToggleProfileMode?: () => void;
  anchor?: ProfileMenuAnchor;
};

type ProfileMenuAnchor = {
  top: number;
  left: number;
};

type ProfileMenuContextValue = {
  isOpen: boolean;
  anchor: ProfileMenuAnchor | null;
  showCommunitySwitch: boolean;
  onToggleProfileMode?: (() => void) | undefined;
  openProfileMenu: (options?: OpenProfileMenuOptions) => void;
  closeProfileMenu: () => void;
};

const ProfileMenuContext = createContext<ProfileMenuContextValue | null>(null);

export function ProfileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<ProfileMenuAnchor | null>(null);
  const [showCommunitySwitch, setShowCommunitySwitch] = useState(false);
  const [onToggleProfileMode, setOnToggleProfileMode] = useState<(() => void) | undefined>(
    undefined,
  );

  const closeProfileMenu = () => {
    setIsOpen(false);
    setAnchor(null);
    setShowCommunitySwitch(false);
    setOnToggleProfileMode(undefined);
  };

  const openProfileMenu = (options?: OpenProfileMenuOptions) => {
    setShowCommunitySwitch(Boolean(options?.showCommunitySwitch));
    setOnToggleProfileMode(() => options?.onToggleProfileMode);
    setAnchor(options?.anchor ?? null);
    setIsOpen(true);
  };

  const value = useMemo(
    () => ({
      isOpen,
      anchor,
      showCommunitySwitch,
      onToggleProfileMode,
      openProfileMenu,
      closeProfileMenu,
    }),
    [isOpen, anchor, showCommunitySwitch, onToggleProfileMode],
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