import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
} from '@chakra-ui/react';
import { BadgeCheck, RefreshCw } from 'lucide-react';
import { CommunityWriteAction } from '@/app/user/components/community/CommunityWriteAction';
import { getCommunityIdentityLabel } from '@/app/user/lib/community-identity';

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
  const identityLabel = getCommunityIdentityLabel(anonymousMode ? 'anonymous' : 'real');

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
            <Icon as={BadgeCheck} boxSize="3" color="blue.500" />
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
    <Box overflow="hidden" rounded="lg" borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm">
      <Box position="relative" h="24" bgGradient="linear(to-br, orange.400, orange.500)">
        <Flex
          position="absolute"
          top="3"
          right="3"
          rounded="full"
          borderWidth="1px"
          borderColor="whiteAlpha.500"
          bg="whiteAlpha.700"
          px="2"
          py="0.5"
          fontSize="xs"
          fontWeight="500"
          backdropFilter="blur(8px)"
        >
          {!anonymousMode ? (
            <Text color="blue.700">✓ 실명 인증</Text>
          ) : (
            <Text color="gray.700">익명 기본값</Text>
          )}
        </Flex>
      </Box>

      <Box position="relative" px="6">
        <Flex position="absolute" top="-12" left="50%" transform="translateX(-50%)">
          <IconButton
            type="button"
            onClick={onProfileClick}
            aria-label="프로필 메뉴 열기"
            title="프로필 메뉴"
            rounded="full"
            p="0"
            minW="auto"
            h="24"
            w="24"
            bg="transparent"
            _hover={{ bg: 'transparent' }}
            _active={{ bg: 'transparent' }}
          >
            {displayedAvatar ? (
              <Image
                src={displayedAvatar}
                alt={displayedName}
                h="24"
                w="24"
                rounded="full"
                borderWidth="4px"
                borderColor="white"
                objectFit="cover"
                boxShadow="lg"
              />
            ) : (
              <Flex
                h="24"
                w="24"
                align="center"
                justify="center"
                rounded="full"
                borderWidth="4px"
                borderColor="white"
                bg="gray.900"
                fontSize="sm"
                fontWeight="700"
                color="white"
                boxShadow="lg"
              >
                익명
              </Flex>
            )}
          </IconButton>
        </Flex>
      </Box>

      <Box px="6" pb="5" pt="14" textAlign="center">
        <HStack mb="1" justify="center" gap="2">
          <Heading size="sm" color="gray.900">
            {displayedName}
          </Heading>
          {!anonymousMode ? <Icon as={BadgeCheck} boxSize="4" color="blue.500" /> : null}
        </HStack>

        <Text fontSize="sm" color="gray.600">
          {anonymousMode ? '게시글과 댓글 작성 시 익명으로 기본 설정됩니다.' : currentUser.position}
        </Text>

        {showWriteButton && onWriteClick ? (
          <>
            <CommunityWriteAction variant="sidebar" onClick={onWriteClick} />

            <Button
              type="button"
              onClick={onToggleProfileMode}
              mt="3"
              w="full"
              gap="2"
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.200"
              bg="gray.50"
              px="4"
              py="2.5"
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
              _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
            >
              <Icon as={RefreshCw} boxSize="4" />
              <Text>{identityLabel} 기본값</Text>
            </Button>
          </>
        ) : (
          <>
            <Grid mt="4" templateColumns="repeat(2, minmax(0, 1fr))" gap="2" rounded="lg" bg="gray.50" p="3">
              <Box>
                <Text fontWeight="600" color="gray.900">
                  {currentUser.postsCount}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  작성 글
                </Text>
              </Box>
              <Box>
                <Text fontWeight="600" color="gray.900">
                  {currentUser.commentsCount}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  댓글
                </Text>
              </Box>
            </Grid>

            <Button
              type="button"
              onClick={onToggleProfileMode}
              mt="4"
              w="full"
              gap="2"
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.200"
              bg="gray.50"
              px="4"
              py="2.5"
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
              _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
            >
              <Icon as={RefreshCw} boxSize="4" />
              <Text>{identityLabel} 기본값</Text>
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
