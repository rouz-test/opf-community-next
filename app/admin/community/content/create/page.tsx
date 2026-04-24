'use client';

import { Box, Flex, Grid, Input, Text } from '@chakra-ui/react';
import AdminButton from '@/app/admin/components/ui/button';
import { useState } from 'react';

import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminSwitch from '@/app/admin/components/ui/switch';
import ContentEditor, { type ContentEditorJsonValue } from '@/app/admin/components/editor/content-editor';
import tagsData from '@/data/mock/tags.json';
import type { Tag } from '@/types/tag';
import { useRouter } from 'next/navigation';
import type { CommunityContentBody, CommunityContentPayload } from '@/types/community-content';

const allTags = tagsData as Tag[];
const defaultTag = allTags.find((tag) => tag.isDefault) ?? null;
const tags = allTags.filter((tag) => !tag.isDefault);


function withAlpha(hex: string, alphaHex: string = '66') {
  if (!hex) return hex;
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex;
}

function createEmptyContentBody(): CommunityContentBody {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

export default function CommunityContentCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<CommunityContentBody>(createEmptyContentBody);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isNotice, setIsNotice] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [lastAction, setLastAction] = useState<'draft' | 'publish' | null>(null);

  const isWarning = title.length >= 40 && title.length < 50;
  const isError = title.length >= 50;

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const resolvedTagIds = selectedTagIds.length > 0 ? selectedTagIds : defaultTag ? [defaultTag.id] : [];

  const createPayload = (status: 'draft' | 'published'): CommunityContentPayload => ({
    title: title.trim() || '제목 없음',
    content,
    tagIds: resolvedTagIds,
    status,
    author: {
      type: 'admin',
      id: 'admin-1',
      visibility: 'public',
      displayName: '관리자',
      identifierType: 'email',
      identifierValue: 'admin@comasoft.io',
    },
    flags: {
      isNotice,
      isPinned,
      isPromoted: false,
    },
  });

  const submitContent = async (status: 'draft' | 'published') => {
    const payload = createPayload(status);

    const response = await fetch('/api/mock/community-contents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(errorData?.message || '콘텐츠 저장에 실패했습니다.');
    }

    return response.json();
  };

  const handleSaveDraft = async () => {
    try {
      setLastAction('draft');
      await submitContent('draft');
      window.alert('임시저장이 완료되었습니다.');
      router.push('/admin/community/content');
    } catch (error) {
      console.error('draft save failed:', error);
      window.alert(error instanceof Error ? error.message : '임시저장에 실패했습니다.');
    }
  };

  const handlePublish = async () => {
    try {
      setLastAction('publish');
      await submitContent('published');
      window.alert('콘텐츠가 발행되었습니다.');
      router.push('/admin/community/content');
    } catch (error) {
      console.error('publish failed:', error);
      window.alert(error instanceof Error ? error.message : '콘텐츠 발행에 실패했습니다.');
    }
  };

  return (
    <PageContainer>
      <PageHeader left={null} right={null} />

      <Grid templateColumns="minmax(0, 1fr) 240px" gap="24px" alignItems="start">
        <Box
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="16px"
          bg="#FFFFFF"
          px="28px"
          py="26px"
          minH="760px"
        >
          <Flex direction="column" gap="20px">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 작성해 주세요."
              border="none"
              borderBottomWidth="2px"
              borderColor={isError ? '#EF4444' : isWarning ? '#F59E42' : 'transparent'}
              fontSize="28px"
              fontWeight="700"
              color="#111827"
              maxLength={50}
              _placeholder={{ color: '#C4C7CE' }}
              _focus={{ borderColor: 'transparent', boxShadow: 'none', outline: 'none' }}
              _focusVisible={{ borderColor: 'transparent', boxShadow: 'none', outline: 'none' }}
            />

            <Text
              fontSize="12px"
              textAlign="right"
              color={isError ? '#EF4444' : isWarning ? '#F59E42' : '#9CA3AF'}
            >
              {title.length} / 50
            </Text>

            <Box h="2px" bg="#F59E42" />

            <ContentEditor
              format="json"
              value={content}
              onChange={(nextValue) => setContent(nextValue as CommunityContentBody & ContentEditorJsonValue)}
              minHeight="500px"
            />
          </Flex>
        </Box>

        <Flex direction="column" gap="24px">
          <Box>
            <Text fontSize="14px" fontWeight="700" color="#111827" mb="12px">
              태그
            </Text>
            <Flex direction="column" gap="10px">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);

                return (
                  <Box
                    key={tag.id}
                    as="button"
                    h="36px"
                    borderRadius="8px"
                    borderWidth="1px"
                    borderColor={withAlpha(tag.style.textColor)}
                    bg={isSelected ? tag.style.textColor : tag.style.bgColor}
                    color={isSelected ? tag.style.bgColor : tag.style.textColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px="12px"
                    cursor="pointer"
                    transition="all 0.2s ease"
                    _hover={{ transform: 'translateY(-1px)' }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: `0 0 0 2px ${withAlpha(tag.style.textColor, '22')}`,
                    }}
                    onClick={() => {
                      handleToggleTag(tag.id);
                    }}
                  >
                    <Text fontSize="12px" fontWeight="600" lineClamp="1">
                      {tag.name}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
            <Text mt="10px" fontSize="12px" color="#9CA3AF">
              선택된 태그 {selectedTagIds.length}개{selectedTagIds.length === 0 && defaultTag ? ` · 미선택 시 ${defaultTag.name} 자동 적용` : ''}
            </Text>
          </Box>

          <Box>
            <Text fontSize="14px" fontWeight="700" color="#111827" mb="14px">
              상세
            </Text>
            <Flex direction="column" gap="14px">
              <Flex align="center" justify="space-between">
                <Text fontSize="14px" fontWeight="600" color="#374151">
                  공지
                </Text>
                <AdminSwitch checked={isNotice} onCheckedChange={setIsNotice} />
              </Flex>
              <Flex align="center" justify="space-between">
                <Text fontSize="14px" fontWeight="600" color="#374151">
                  고정
                </Text>
                <AdminSwitch checked={isPinned} onCheckedChange={setIsPinned} />
              </Flex>
            </Flex>
          </Box>

          <Flex direction="column" gap="10px" pt="8px">
            <AdminButton
              type="button"
              size="lg"
              variantStyle="outline"
              onClick={handleSaveDraft}
            >
              임시저장
            </AdminButton>
            <AdminButton
              type="button"
              size="lg"
              variantStyle="primary"
              onClick={handlePublish}
            >
              발행하기
            </AdminButton>
          </Flex>
          <Box borderTopWidth="1px" borderTopColor="#E5E7EB" pt="12px">
            <Text fontSize="12px" fontWeight="700" color="#6B7280" mb="6px">
              현재 작성 상태
            </Text>
            <Text fontSize="12px" color="#9CA3AF" lineHeight="1.7" whiteSpace="pre-wrap">
              {JSON.stringify(
                {
                  title: title.trim() || '(비어 있음)',
                  payload: createPayload(lastAction === 'draft' ? 'draft' : 'published'),
                  lastAction,
                },
                null,
                2,
              )}
            </Text>
          </Box>
        </Flex>
      </Grid>
    </PageContainer>
  );
}
