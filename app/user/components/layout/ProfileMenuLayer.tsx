'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Portal, Text } from '@chakra-ui/react';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { useProfileMenu } from '@/app/user/components/providers/ProfileMenuProvider';

export default function ProfileMenuLayer() {
  const router = useRouter();
  const { logout } = useAuth();
  const { isOpen, anchor, closeProfileMenu, showCommunitySwitch, onToggleProfileMode } =
    useProfileMenu();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProfileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeProfileMenu]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (menuRef.current?.contains(target)) return;

      closeProfileMenu();
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen, closeProfileMenu]);

  const menuWidth = 180;
  const defaultTop = 64;
  const defaultLeft = typeof window !== 'undefined' ? window.innerWidth - 24 : 0;
  const computedTop = anchor?.top ?? defaultTop;
  const computedLeft = anchor
    ? Math.max(16, anchor.left - menuWidth)
    : Math.max(16, defaultLeft - menuWidth);

  if (!isOpen) return null;

  return (
    <Portal>
      <Box position="fixed" inset="0" zIndex="110">
        <Box
          ref={menuRef}
          position="absolute"
          top={`${computedTop}px`}
          left={`${computedLeft}px`}
          w="180px"
          overflow="hidden"
          rounded="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          py="2"
          boxShadow="lg"
        >
          {showCommunitySwitch ? (
            <>
              <MenuButton
                onClick={() => {
                  closeProfileMenu();
                  onToggleProfileMode?.();
                }}
              >
                실명/익명 전환
              </MenuButton>
              <Box my="2" h="1px" bg="gray.100" />
            </>
          ) : null}

          <MenuButton
            onClick={() => {
              closeProfileMenu();
              router.push('/user/mypage');
            }}
          >
            커뮤니티
          </MenuButton>
          <MenuButton
            onClick={() => {
              closeProfileMenu();
              router.push('/user/mypage');
            }}
          >
            캠퍼스
          </MenuButton>
          <MenuButton
            onClick={() => {
              closeProfileMenu();
              router.push('/user/mypage/settings');
            }}
          >
            설정
          </MenuButton>
          <Box my="2" h="1px" bg="gray.100" />
          <MenuButton
            color="red.500"
            hoverBg="red.50"
            hoverColor="red.600"
            onClick={() => {
              closeProfileMenu();
              void logout().finally(() => {
                router.push('/user/community');
              });
            }}
          >
            로그아웃
          </MenuButton>
        </Box>
      </Box>
    </Portal>
  );
}

function MenuButton({
  children,
  onClick,
  color = 'gray.700',
  hoverBg = 'gray.50',
  hoverColor = 'orange.600',
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
  hoverBg?: string;
  hoverColor?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      justifyContent="flex-start"
      w="full"
      rounded="none"
      bg="transparent"
      px="4"
      py="2.5"
      fontSize="sm"
      fontWeight="500"
      color={color}
      _hover={{ bg: hoverBg, color: hoverColor }}
    >
      <Text>{children}</Text>
    </Button>
  );
}
