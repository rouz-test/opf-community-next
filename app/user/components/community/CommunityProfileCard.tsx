import {
  Box,
  Flex,
  Icon,
  IconButton,
  Image,
  Text,
} from '@chakra-ui/react';
import { Button } from '@/app/user/components/ui/button';
import CheckBadgeIcon from '@/app/user/components/icons/CheckBadgeIcon';
import PenIcon from '@/app/user/components/icons/PenIcon';
import RotateIcon from '@/app/user/components/icons/RotateIcon';

export type CommunityProfileCardProps = {
  profileMode: 'real' | 'anonymous' | 'nickname';
  onToggleProfileMode: () => void;
  onProfileClick?: () => void;
  onWriteClick?: () => void;
  showWriteButton?: boolean;
  variant?: 'sidebar' | 'header';
  currentUser: {
    name: string;
    nickname: string;
    avatar: string;
    position: string;
    postsCount: number;
    commentsCount: number;
  };
};

const isAnonymousMode = (mode: CommunityProfileCardProps['profileMode']) => mode !== 'real';

export function CommunityProfileCard({
  profileMode,
  onToggleProfileMode,
  onProfileClick,
  onWriteClick,
  showWriteButton = false,
  currentUser,
  variant = 'sidebar',
}: CommunityProfileCardProps) {
  const anonymousMode = isAnonymousMode(profileMode);
  const displayedName = anonymousMode ? '익명' : currentUser.name;
  const displayedAvatar = anonymousMode ? '' : currentUser.avatar;

  if (variant === 'header') {
    return (
      <Box position="relative" flexShrink={0}>
        <IconButton
          type="button"
          onClick={onProfileClick}
          aria-label="프로필 메뉴 열기"
          title="프로필 메뉴"
          rounded="full"
          p="0"
          minW="auto"
          h="9"
          w="9"
          bg="transparent"
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
        >
          {displayedAvatar ? (
            <Image
              src={displayedAvatar}
              alt={displayedName}
              h="9"
              w="9"
              rounded="full"
              objectFit="cover"
              ring="1px"
              ringColor="gray.200"
            />
          ) : (
            <Flex
              h="9"
              w="9"
              align="center"
              justify="center"
              rounded="full"
              bg="gray.900"
              fontSize="xs"
              fontWeight="700"
              color="white"
              ring="1px"
              ringColor="gray.200"
            >
              익명
            </Flex>
          )}
        </IconButton>

        {!anonymousMode ? (
          <Flex
            position="absolute"
            top="-1"
            right="-1"
            h="4"
            w="4"
            align="center"
            justify="center"
            rounded="full"
            bg="white"
            boxShadow="sm"
            ring="1px"
            ringColor="gray.200"
          >
            <Icon as={CheckBadgeIcon} boxSize="3" color="#11B3E9" />
          </Flex>
        ) : (
          <Flex
            position="absolute"
            top="-1"
            right="-1"
            minW="4"
            h="4"
            align="center"
            justify="center"
            rounded="full"
            bg="gray.900"
            px="1"
            fontSize="9px"
            fontWeight="700"
            lineHeight="none"
            color="white"
            boxShadow="sm"
            ring="1px"
            ringColor="white"
          >
            N
          </Flex>
        )}
      </Box>
    );
  }

  return (
    <Box
      borderRadius="20px"
      bg="white"
      p="6"
      boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
    >
      <Flex align="center" gap="4">
        <IconButton
          type="button"
          onClick={onProfileClick}
          aria-label="프로필 메뉴 열기"
          title="프로필 메뉴"
          rounded="full"
          p="0"
          minW="auto"
          h="16"
          w="16"
          bg="transparent"
          flexShrink={0}
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
        >
          {displayedAvatar ? (
            <Image
              src={displayedAvatar}
              alt={displayedName}
              h="16"
              w="16"
              rounded="full"
              objectFit="cover"
            />
          ) : (
            <Flex
              h="16"
              w="16"
              align="center"
              justify="center"
              rounded="full"
              bgGradient="linear(to-br, orange.300, orange.500)"
              fontSize="sm"
              fontWeight="700"
              color="white"
            >
              익명
            </Flex>
          )}
        </IconButton>

        <Box minW="0" textAlign="left">
          <Flex align="center" gap="2">
            <Text fontSize="18px" fontWeight="700" color="gray.900" lineHeight="1.2">
              {displayedName}
            </Text>
            {!anonymousMode ? <Icon as={CheckBadgeIcon} boxSize="16px" color="#11B3E9" /> : null}
          </Flex>

          <Text mt="2" fontSize="14px" color="gray.500" lineHeight="1.5">
            {anonymousMode ? '익명 기본값' : '코마소프트'}
          </Text>
          <Text fontSize="14px" color="gray.500" lineHeight="1.5">
            {anonymousMode ? '커뮤니티 활동' : currentUser.position}
          </Text>
        </Box>
      </Flex>

      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={onToggleProfileMode}
        mt="6"
        w="full"
        gap="3"
        fontSize="14px"
        fontWeight="700"
        color="#4B5563"
      >
        <Icon as={RotateIcon} boxSize="14px" />
        <Text>계정 전환</Text>
      </Button>

      {showWriteButton && onWriteClick ? (
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onWriteClick}
          mt="3"
          w="full"
          gap="3"
          fontSize="14px"
          fontWeight="700"
        >
          <Icon as={PenIcon} boxSize="14px" />
          <Text>글쓰기</Text>
        </Button>
      ) : null}
    </Box>
  );
}
