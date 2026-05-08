'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Text } from '@chakra-ui/react';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { useProfileMenu } from '@/app/user/components/providers/ProfileMenuProvider';

export default function ProfileMenuLayer() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const { isOpen, anchor, closeProfileMenu, showCommunitySwitch, onToggleProfileMode } =
    useProfileMenu();

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

  const menuWidth = 180;
  const defaultTop = 64;
  const defaultLeft = typeof window !== 'undefined' ? window.innerWidth - 24 : 0;
  const computedTop = anchor?.top ?? defaultTop;
  const computedLeft = anchor
    ? Math.max(16, anchor.left - menuWidth)
    : Math.max(16, defaultLeft - menuWidth);

  if (!isOpen) return null;

  return (
    <Box position="fixed" inset="0" zIndex="110">
      <Button
        type="button"
        aria-label="프로필 메뉴 닫기"
        onClick={closeProfileMenu}
        position="absolute"
        inset="0"
        bg="blackAlpha.200"
        _hover={{ bg: 'blackAlpha.200' }}
        _active={{ bg: 'blackAlpha.200' }}
      />

      <Box
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
            setIsLoggedIn(false);
            router.push('/user/community');
          }}
        >
          로그아웃
        </MenuButton>
      </Box>
    </Box>
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
