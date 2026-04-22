'use client';

import { Box, Button, Flex, Grid, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';

import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminSwitch from '@/app/admin/components/ui/switch';
import ContentEditor from '@/app/admin/components/editor/content-editor';
import tagsData from '@/data/mock/tags.json';
import type { Tag } from '@/types/tag';

const allTags = tagsData as Tag[];
const defaultTag = allTags.find((tag) => tag.isDefault) ?? null;
const tags = allTags.filter((tag) => !tag.isDefault);

const initialSelectedTagIds = tags
  .filter((tag) => tag.status === 'active')
  .slice(0, 4)
  .map((tag) => tag.id);

function withAlpha(hex: string, alphaHex: string = '66') {
  if (!hex) return hex;
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex;
}

export default function CommunityContentCreatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p></p>');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialSelectedTagIds);
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

  const submitPayload = {
    title: title.trim() || '제목 없음',
    tagIds: resolvedTagIds,
    body: content,
    flags: {
      isNotice,
      isPinned,
    },
  };

  const handleSaveDraft = () => {
    setLastAction('draft');
    console.log('draft payload', {
      ...submitPayload,
      publicationStatus: 'draft',
    });
  };

  const handlePublish = () => {
    setLastAction('publish');
    console.log('publish payload', {
      ...submitPayload,
      publicationStatus: 'published',
    });
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
            />

            <Text
              fontSize="12px"
              textAlign="right"
              color={isError ? '#EF4444' : isWarning ? '#F59E42' : '#9CA3AF'}
            >
              {title.length} / 50
            </Text>

            <Box h="2px" bg="#F59E42" />

            <ContentEditor value={content} onChange={setContent} minHeight="500px" />
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
            <Button
              type="button"
              h="44px"
              variant="outline"
              borderColor="#D1D5DB"
              color="#374151"
              bg="#FFFFFF"
              fontSize="14px"
              fontWeight="700"
              _hover={{ bg: '#F9FAFB' }}
              onClick={handleSaveDraft}
            >
              임시저장
            </Button>
            <Button
              type="button"
              h="44px"
              bg="#F59E42"
              color="#FFFFFF"
              fontSize="14px"
              fontWeight="700"
              _hover={{ bg: '#E8892F' }}
              onClick={handlePublish}
            >
              발행하기
            </Button>
          </Flex>
          <Box borderTopWidth="1px" borderTopColor="#E5E7EB" pt="12px">
            <Text fontSize="12px" fontWeight="700" color="#6B7280" mb="6px">
              현재 작성 상태
            </Text>
            <Text fontSize="12px" color="#9CA3AF" lineHeight="1.7" whiteSpace="pre-wrap">
              {JSON.stringify(
                {
                  title: title.trim() || '(비어 있음)',
                  tagIds: resolvedTagIds,
                  content,
                  flags: {
                    isNotice,
                    isPinned,
                  },
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