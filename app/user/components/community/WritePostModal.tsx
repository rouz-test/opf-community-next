'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { X, Image as ImageIcon, Bold, Italic, Link as LinkIcon, List } from 'lucide-react';
import { useAuth } from '@/app/user/components/providers/AuthProvider';
import {
  getCommunityIdentityLabel,
  normalizeLegacyCommunityIdentity,
  type CommunityIdentityMode,
} from '@/app/user/lib/community-identity';

export type WritePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    nickname: string;
    avatar: string;
    position: string;
  };
};

const WRITE_ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const WRITE_MAX_FILE_SIZE = 10 * 1024 * 1024;
const WRITE_MAX_IMAGES = 10;
const WRITE_MAX_TITLE_LENGTH = 200;
const WRITE_AVAILABLE_TAGS = [
  '창업',
  '스타트업',
  '개발',
  '마케팅',
  '투자',
  '네트워킹',
  '피드백',
  '협업',
];

type WriteErrors = {
  title?: string;
  content?: string;
  images?: string;
};

const toolbarButtonStyles = {
  minW: 'auto',
  h: 'auto',
  rounded: 'lg',
  bg: 'transparent',
  p: '2',
  color: 'gray.600',
  _hover: { bg: 'white' },
} as const;

export function WritePostModal({ isOpen, onClose, currentUser }: WritePostModalProps) {
  const { defaultCommunityIdentity } = useAuth();
  const normalizedDefaultIdentity =
    normalizeLegacyCommunityIdentity(defaultCommunityIdentity) ?? 'real';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPromotion, setIsPromotion] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [profileModeOverride, setProfileModeOverride] = useState<CommunityIdentityMode | null>(null);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [errors, setErrors] = useState<WriteErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setIsPromotion(false);
    setImages([]);
    setImagePreviews([]);
    setProfileModeOverride(null);
    setIsTagDropdownOpen(false);
    setShowCloseConfirm(false);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCloseAttempt = () => {
    if (title.trim() || content.trim() || selectedTags.length > 0 || images.length > 0) {
      setShowCloseConfirm(true);
      return;
    }

    handleClose();
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length <= WRITE_MAX_TITLE_LENGTH) {
      setTitle(value);
      setErrors((prev) => ({ ...prev, title: undefined }));
      return;
    }

    setErrors((prev) => ({ ...prev, title: '제목은 최대 200자까지 입력할 수 있습니다.' }));
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > WRITE_MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: '이미지는 한 게시글당 최대 10장까지 첨부할 수 있습니다.',
      }));
      return;
    }

    for (const file of files) {
      if (!WRITE_ALLOWED_FORMATS.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: 'JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다.',
        }));
        return;
      }

      if (file.size > WRITE_MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          images: '이미지 파일은 개당 최대 10MB까지 업로드할 수 있습니다.',
        }));
        return;
      }
    }

    setErrors((prev) => ({ ...prev, images: undefined }));
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setImagePreviews((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const applyFormat = (format: 'bold' | 'italic' | 'link' | 'list') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || '텍스트'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || '텍스트'}*`;
        break;
      case 'link':
        formattedText = `[${selectedText || '링크 텍스트'}](URL)`;
        break;
      case 'list':
        formattedText = `\n• ${selectedText || '항목'}`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    setErrors((prev) => ({ ...prev, content: undefined }));

    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const toggleAllTags = () => {
    if (selectedTags.length === WRITE_AVAILABLE_TAGS.length) {
      setSelectedTags([]);
      return;
    }

    setSelectedTags([...WRITE_AVAILABLE_TAGS]);
  };

  const handleSubmit = () => {
    const nextErrors: WriteErrors = {};

    if (!title.trim()) {
      nextErrors.title = '제목을 입력해 주세요.';
    }

    if (!content.trim()) {
      nextErrors.content = '내용을 입력해 주세요.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    window.alert(
      `${getCommunityIdentityLabel(profileMode)}으로 게시글이 등록된 것처럼 처리했습니다. 실제 저장은 아직 연결되지 않았습니다.`,
    );
    handleClose();
  };

  const profileMode = profileModeOverride ?? normalizedDefaultIdentity;
  const isAnonymous = profileMode === 'anonymous';
  const displayedName = isAnonymous ? '익명' : currentUser.name;
  const identityDescription = isAnonymous
    ? '익명으로 작성 시 기본 프로필 이미지와 "익명"으로 표시됩니다.'
    : '실명으로 작성 시 팔로우와 프로필 정보가 함께 노출됩니다.';

  return (
    <>
      <Flex
        position="fixed"
        inset="0"
        zIndex="80"
        align="center"
        justify="center"
        bg="blackAlpha.600"
        px={{ base: '0', md: '4' }}
        onClick={handleCloseAttempt}
      >
        <Box
          display="flex"
          h={{ base: '100%', md: 'auto' }}
          maxH={{ md: '92vh' }}
          w="full"
          maxW={{ md: '6xl' }}
          flexDirection="column"
          overflow="hidden"
          bg="white"
          boxShadow="2xl"
          rounded={{ base: 'none', md: '3xl' }}
          onClick={(event) => event.stopPropagation()}
        >
          <Flex align="center" justify="space-between" borderBottomWidth="1px" borderColor="gray.200" px={{ base: '5', md: '6' }} py={{ base: '4', md: '5' }}>
            <Box>
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="700" color="gray.900">
                글쓰기
              </Text>
            </Box>
            <Button
              type="button"
              onClick={handleCloseAttempt}
              minW="auto"
              rounded="lg"
              p="2"
              bg="transparent"
              color="gray.500"
              _hover={{ bg: 'gray.100', color: 'gray.700' }}
              aria-label="글쓰기 모달 닫기"
            >
              <Icon as={X} boxSize="5" />
            </Button>
          </Flex>

          <Box flex="1" overflowY="auto">
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, minmax(0, 1fr))' }} gap="6" p={{ base: '5', md: '6' }}>
              <Box gridColumn={{ base: 'auto', md: 'span 3 / span 3' }}>
                <Stack gap="6">
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'stretch', md: 'center' }}
                    justify="space-between"
                    gap="4"
                    rounded="2xl"
                    borderWidth="1px"
                    borderColor="gray.100"
                    bg="gray.50"
                    p="4"
                  >
                    <HStack gap="3" align="center">
                      {isAnonymous ? (
                        <Flex h="12" w="12" align="center" justify="center" rounded="full" bg="gray.900" fontSize="xs" fontWeight="700" color="white" ring="2px" ringColor="white">
                          익명
                        </Flex>
                      ) : (
                        <Image
                          src={currentUser.avatar}
                          alt="작성자 프로필 이미지"
                          h="12"
                          w="12"
                          rounded="full"
                          objectFit="cover"
                          borderWidth="2px"
                          borderColor="white"
                        />
                      )}
                      <Box>
                        <Text fontWeight="600" color="gray.900">
                          {displayedName}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {isAnonymous ? '기본 익명 프로필' : currentUser.position}
                        </Text>
                      </Box>
                    </HStack>

                    <Stack gap="2" align={{ base: 'stretch', md: 'flex-end' }}>
                      <Button
                        type="button"
                        onClick={() =>
                          setProfileModeOverride(profileMode === 'real' ? 'anonymous' : 'real')
                        }
                        rounded="lg"
                        borderWidth="1px"
                        borderColor="gray.200"
                        bg="white"
                        px="4"
                        py="2"
                        fontSize="sm"
                        fontWeight="500"
                        color="gray.700"
                        _hover={{ bg: 'gray.100' }}
                      >
                        {profileMode === 'real' ? '익명으로 작성' : '실명으로 작성'}
                      </Button>
                      <Text fontSize="xs" color="gray.500" maxW={{ md: '260px' }} textAlign={{ base: 'left', md: 'right' }}>
                        현재 기본값은 {getCommunityIdentityLabel(normalizedDefaultIdentity)}입니다. 이 글에만
                        임시로 변경할 수 있습니다.
                      </Text>
                    </Stack>
                  </Flex>

                  <Text mt="-2" px="1" fontSize="xs" color="gray.500">
                    {identityDescription}
                  </Text>

                  <Box>
                    <Text px="1" mb="2" fontSize="sm" fontWeight="500" color="gray.700">
                      제목
                    </Text>
                    <Input
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="제목을 입력해 주세요."
                      rounded="xl"
                      borderColor="gray.200"
                      px="4"
                      py="3"
                      h="auto"
                      fontSize={{ base: 'base', md: 'lg' }}
                      fontWeight="500"
                      color="gray.900"
                      _placeholder={{ color: 'gray.400' }}
                      _focusVisible={{
                        borderColor: 'orange.500',
                        boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35)',
                      }}
                    />
                    <Flex mt="2" align="center" justify="space-between" px="1">
                      <Box>
                        {errors.title ? (
                          <Text fontSize="sm" color="red.500">
                            {errors.title}
                          </Text>
                        ) : null}
                      </Box>
                      <Text
                        fontSize="xs"
                        fontWeight={title.length >= WRITE_MAX_TITLE_LENGTH - 10 ? '600' : '400'}
                        color={title.length >= WRITE_MAX_TITLE_LENGTH - 10 ? 'orange.500' : 'gray.400'}
                      >
                        {title.length}/{WRITE_MAX_TITLE_LENGTH}
                      </Text>
                    </Flex>
                  </Box>

                  <Box>
                    <Text px="1" mb="2" fontSize="sm" fontWeight="500" color="gray.700">
                      내용
                    </Text>

                    <HStack flexWrap="wrap" gap="1" rounded="xl" borderWidth="1px" borderColor="gray.200" bg="gray.50" p="2">
                      <Button type="button" onClick={() => applyFormat('bold')} title="굵게" {...toolbarButtonStyles}>
                        <Icon as={Bold} boxSize="4" />
                      </Button>
                      <Button type="button" onClick={() => applyFormat('italic')} title="기울임" {...toolbarButtonStyles}>
                        <Icon as={Italic} boxSize="4" />
                      </Button>
                      <Button type="button" onClick={() => applyFormat('link')} title="링크" {...toolbarButtonStyles}>
                        <Icon as={LinkIcon} boxSize="4" />
                      </Button>
                      <Button type="button" onClick={() => applyFormat('list')} title="목록" {...toolbarButtonStyles}>
                        <Icon as={List} boxSize="4" />
                      </Button>
                    </HStack>

                    <Textarea
                      ref={contentRef}
                      value={content}
                      onChange={(event) => {
                        setContent(event.target.value);
                        setErrors((prev) => ({ ...prev, content: undefined }));
                      }}
                      placeholder="내용을 입력해 주세요."
                      minH={{ base: '320px', md: '420px' }}
                      resize="none"
                      rounded="xl"
                      borderColor="gray.200"
                      px="4"
                      py="3"
                      mt="2"
                      fontSize={{ base: 'sm', md: 'base' }}
                      color="gray.900"
                      _placeholder={{ color: 'gray.400' }}
                      _focusVisible={{
                        borderColor: 'orange.500',
                        boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35)',
                      }}
                    />

                    {errors.content ? (
                      <Text mt="2" px="1" fontSize="sm" color="red.500">
                        {errors.content}
                      </Text>
                    ) : null}
                  </Box>
                </Stack>
              </Box>

              <Box gridColumn={{ base: 'auto', md: 'span 1 / span 1' }}>
                <Stack gap="6">
                  <Box>
                    <Text px="1" mb="3" fontSize="sm" fontWeight="500" color="gray.700">
                      태그 선택
                    </Text>

                    {selectedTags.length > 0 ? (
                      <Box rounded="xl" borderWidth="1px" borderColor="orange.100" bg="orange.50" p="3" mb="3">
                        <HStack flexWrap="wrap" gap="2">
                          {selectedTags.map((tag) => (
                            <Button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              minW="auto"
                              h="auto"
                              gap="1"
                              rounded="full"
                              bg="orange.500"
                              px="2.5"
                              py="1"
                              fontSize="xs"
                              fontWeight="500"
                              color="white"
                              _hover={{ bg: 'orange.600' }}
                            >
                              <Text>#{tag}</Text>
                              <Icon as={X} boxSize="3" />
                            </Button>
                          ))}
                        </HStack>
                      </Box>
                    ) : null}

                    <Box position="relative">
                      <Button
                        type="button"
                        onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                        justifyContent="space-between"
                        w="full"
                        rounded="xl"
                        borderWidth="1px"
                        borderColor="gray.200"
                        bg="white"
                        px="3"
                        py="2.5"
                        fontSize="sm"
                        fontWeight="400"
                        color="gray.700"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Text>
                          {selectedTags.length > 0 ? `${selectedTags.length}개 선택됨` : '태그 선택'}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.400"
                          transform={isTagDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                          transition="transform 0.2s"
                        >
                          ▾
                        </Text>
                      </Button>

                      {isTagDropdownOpen ? (
                        <Box
                          position="absolute"
                          top="full"
                          zIndex="10"
                          mt="2"
                          w="full"
                          rounded="2xl"
                          borderWidth="1px"
                          borderColor="gray.200"
                          bg="white"
                          p="3"
                          boxShadow="xl"
                        >
                          <HStack flexWrap="wrap" gap="1.5">
                            <Button
                              type="button"
                              onClick={toggleAllTags}
                              rounded="full"
                              borderWidth="1px"
                              borderColor={
                                selectedTags.length === WRITE_AVAILABLE_TAGS.length
                                  ? 'orange.500'
                                  : 'gray.300'
                              }
                              bg={
                                selectedTags.length === WRITE_AVAILABLE_TAGS.length
                                  ? 'orange.500'
                                  : 'white'
                              }
                              px="2.5"
                              py="1.5"
                              h="auto"
                              fontSize="xs"
                              fontWeight="500"
                              color={
                                selectedTags.length === WRITE_AVAILABLE_TAGS.length
                                  ? 'white'
                                  : 'gray.700'
                              }
                              _hover={{
                                bg:
                                  selectedTags.length === WRITE_AVAILABLE_TAGS.length
                                    ? 'orange.600'
                                    : 'gray.50',
                              }}
                            >
                              {selectedTags.length === WRITE_AVAILABLE_TAGS.length ? '✓ 전체' : '전체'}
                            </Button>

                            {WRITE_AVAILABLE_TAGS.map((tag) => {
                              const isSelected = selectedTags.includes(tag);

                              return (
                                <Button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  rounded="full"
                                  bg={isSelected ? 'orange.500' : 'gray.100'}
                                  px="2.5"
                                  py="1.5"
                                  h="auto"
                                  fontSize="xs"
                                  fontWeight="500"
                                  color={isSelected ? 'white' : 'gray.700'}
                                  _hover={{ bg: isSelected ? 'orange.600' : 'gray.200' }}
                                >
                                  {isSelected ? '✓ ' : ''}#{tag}
                                </Button>
                              );
                            })}
                          </HStack>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>

                  <Box>
                    <Text px="1" mb="3" fontSize="sm" fontWeight="500" color="gray.700">
                      이미지 첨부
                    </Text>

                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      w="full"
                      rounded="2xl"
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor="gray.300"
                      bg="gray.50"
                      p="4"
                      h="auto"
                      _hover={{ borderColor: 'orange.300', bg: 'orange.50' }}
                    >
                      <Flex direction="column" align="center" justify="center" textAlign="center">
                        <Flex
                          mb="2"
                          h="10"
                          w="10"
                          align="center"
                          justify="center"
                          rounded="full"
                          bg="white"
                          transition="colors 0.2s"
                        >
                          <Icon as={ImageIcon} boxSize="5" color="gray.400" />
                        </Flex>
                        <Text fontSize="xs" fontWeight="600" color="gray.700">
                          이미지 업로드
                        </Text>
                        <Text mt="1" fontSize="xs" color="gray.500">
                          클릭해서 파일 선택
                        </Text>
                      </Flex>
                    </Button>

                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleImageSelect}
                      display="none"
                    />

                    <Box mt="3" rounded="xl" borderWidth="1px" borderColor="blue.100" bg="blue.50" p="3">
                      <Text mb="1" fontSize="xs" fontWeight="700" color="blue.800">
                        업로드 가이드
                      </Text>
                      <Stack gap="1" fontSize="xs" color="blue.700">
                        <Text>• JPG, PNG, WebP 지원</Text>
                        <Text>• 파일당 최대 10MB</Text>
                        <Text>• 최대 10장까지 첨부 가능</Text>
                      </Stack>
                    </Box>

                    {imagePreviews.length > 0 ? (
                      <Stack mt="3" gap="2">
                        <Text px="1" fontSize="xs" fontWeight="500" color="gray.700">
                          첨부 ({imagePreviews.length}/{WRITE_MAX_IMAGES})
                        </Text>
                        <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="2">
                          {imagePreviews.map((preview, index) => (
                            <Box
                              key={`${preview}-${index}`}
                              position="relative"
                              aspectRatio="1 / 1"
                              role="group"
                            >
                              <Image
                                src={preview}
                                alt={`업로드 미리보기 ${index + 1}`}
                                h="full"
                                w="full"
                                rounded="xl"
                                borderWidth="1px"
                                borderColor="gray.200"
                                objectFit="cover"
                              />
                              <Button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                position="absolute"
                                top="-1.5"
                                right="-1.5"
                                minW="auto"
                                rounded="full"
                                bg="red.500"
                                p="1"
                                color="white"
                                opacity={{ base: 1, md: 0 }}
                                boxShadow="md"
                                transition="opacity 0.2s"
                                _hover={{ bg: 'red.600' }}
                                _groupHover={{ opacity: 1 }}
                                aria-label="이미지 제거"
                              >
                                <Icon as={X} boxSize="3" />
                              </Button>
                            </Box>
                          ))}
                        </Grid>
                      </Stack>
                    ) : null}

                    {errors.images ? (
                      <Box mt="3" rounded="xl" borderWidth="1px" borderColor="red.200" bg="red.50" p="3">
                        <Text fontSize="xs" color="red.600">
                          {errors.images}
                        </Text>
                      </Box>
                    ) : null}
                  </Box>

                  <Box>
                    <Text px="1" mb="3" fontSize="sm" fontWeight="500" color="gray.700">
                      게시글 유형
                    </Text>

                    <Box rounded="2xl" borderWidth="1px" borderColor="gray.200" bg="white" p="3">
                      <Flex rounded="xl" bg="gray.100" p="1">
                        <Button
                          type="button"
                          onClick={() => setIsPromotion(false)}
                          flex="1"
                          rounded="lg"
                          bg={!isPromotion ? 'white' : 'transparent'}
                          px="4"
                          py="2"
                          fontSize="sm"
                          fontWeight="500"
                          color={!isPromotion ? 'gray.900' : 'gray.500'}
                          boxShadow={!isPromotion ? 'sm' : 'none'}
                          _hover={{ color: !isPromotion ? 'gray.900' : 'gray.700' }}
                        >
                          일반글
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setIsPromotion(true)}
                          flex="1"
                          rounded="lg"
                          bg={isPromotion ? 'orange.500' : 'transparent'}
                          px="4"
                          py="2"
                          fontSize="sm"
                          fontWeight="500"
                          color={isPromotion ? 'white' : 'gray.500'}
                          boxShadow={isPromotion ? 'sm' : 'none'}
                          _hover={{ bg: isPromotion ? 'orange.600' : 'transparent', color: isPromotion ? 'white' : 'gray.700' }}
                        >
                          홍보글
                        </Button>
                      </Flex>

                      <Text mt="3" fontSize="xs" lineHeight="5" color="gray.500">
                        {isPromotion
                          ? '홍보성 게시물로 표시되는 UI 상태입니다.'
                          : '일반적인 커뮤니티 게시글로 표시되는 UI 상태입니다.'}
                      </Text>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Box>

          <Flex justify="flex-end" gap="2" borderTopWidth="1px" borderColor="gray.200" px={{ base: '5', md: '6' }} py={{ base: '4', md: '5' }}>
            <Button
              type="button"
              onClick={handleCloseAttempt}
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.200"
              bg="white"
              px="4"
              py="2.5"
              fontSize="sm"
              fontWeight="500"
              color="gray.700"
              _hover={{ bg: 'gray.50' }}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              rounded="lg"
              bg="black"
              px="4"
              py="2.5"
              fontSize="sm"
              fontWeight="500"
              color="white"
              _hover={{ bg: 'gray.800' }}
            >
              게시하기
            </Button>
          </Flex>
        </Box>
      </Flex>

      {showCloseConfirm ? (
        <Flex position="fixed" inset="0" zIndex="90" align="center" justify="center" bg="blackAlpha.500" px="4">
          <Box w="full" maxW="sm" rounded="2xl" bg="white" p="6" boxShadow="2xl">
            <Text textAlign="center" fontSize="base" fontWeight="500" color="gray.900">
              작성 중인 내용이 있습니다. 닫으시겠어요?
            </Text>
            <Text mt="2" textAlign="center" fontSize="sm" color="gray.500">
              저장 기능은 아직 연결되지 않아, 닫으면 입력 내용이 사라집니다.
            </Text>

            <Flex mt="5" align="center" gap="3">
              <Button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                flex="1"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.200"
                bg="white"
                px="4"
                py="2.5"
                fontSize="sm"
                fontWeight="500"
                color="gray.700"
                _hover={{ bg: 'gray.50' }}
              >
                계속 작성
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                flex="1"
                rounded="lg"
                bg="orange.500"
                px="4"
                py="2.5"
                fontSize="sm"
                fontWeight="500"
                color="white"
                _hover={{ bg: 'orange.600' }}
              >
                닫기
              </Button>
            </Flex>
          </Box>
        </Flex>
      ) : null}
    </>
  );
}
