'use client';
import { useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import {
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import AdminIconButton from '@/app/admin/components/ui/icon-button';
import { DragHandleIcon, EditIcon, DeleteIcon } from '@/app/admin/components/ui/icons';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminButton from '@/app/admin/components/ui/button';
import { toaster } from '@/app/admin/components/ui/toaster';
import AdminCard from '@/app/admin/components/ui/card';
import AdminTagBadge from '@/app/admin/components/ui/tag/tag-badge';
import AdminSwitch from '@/app/admin/components/ui/switch';
import CreateTagModal, { type TagFormValues } from './CreateTagModal';
import BaseModal from '@/app/admin/components/modal/base-modal';
import { createTag, deleteTag, getTags, updateTag } from '@/lib/tags';
import type { Tag } from '@/types/tag';

type TagItem = TagFormValues & {
  id: string;
  count: string;
  countAccent?: boolean;
  isVisible: boolean;
  isFixed?: boolean;
};

const mapTagToTagItem = (tag: Tag): TagItem => ({
  id: tag.id,
  name: tag.name,
  textColor: tag.style.textColor,
  bgColor: tag.style.bgColor,
  count: '0',
  isVisible: tag.isDefault ? true : tag.status === 'active',
  isFixed: tag.isDefault,
});

const sortTagsByOrder = (items: Tag[]) =>
  [...items].sort((a, b) => a.sortOrder - b.sortOrder);

export default function CommunityTagsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [deletingTagIndex, setDeletingTagIndex] = useState<number | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      try {
        const fetchedTags = await getTags();

        if (!isMounted) return;

        setTags(sortTagsByOrder(fetchedTags).map(mapTagToTagItem));
      } catch (error) {
        console.error('[CommunityTagsPage] failed to load tags:', error);

        toaster.create({
          description: '태그 목록을 불러오지 못했습니다.',
          type: 'error',
          duration: 2000,
        });
      }
    };

    void loadTags();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleVisibility = async (targetIndex: number, checked: boolean) => {
    const targetTag = tags[targetIndex];
    if (!targetTag) return;

    try {
      const updatedTag = await updateTag({
        id: targetTag.id,
        name: targetTag.name,
        textColor: targetTag.textColor,
        bgColor: targetTag.bgColor,
        status: checked ? 'active' : 'inactive',
      });

      setTags((prev) =>
        prev.map((tag, index) =>
          index === targetIndex ? mapTagToTagItem(updatedTag) : tag,
        ),
      );
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '태그 상태를 변경하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, index: number) => {
    const targetTag = tags[index];
    if (!targetTag || targetTag.isFixed) return;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDraggingIndex(index);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    const targetTag = tags[index];
    if (!targetTag || targetTag.isFixed || draggingIndex === null || draggingIndex === index) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();

    const targetTag = tags[targetIndex];
    if (!targetTag || targetTag.isFixed || draggingIndex === null || draggingIndex === targetIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    const previousTags = tags;
    const nextTags = [...tags];
    const [movedItem] = nextTags.splice(draggingIndex, 1);

    if (!movedItem) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    nextTags.splice(targetIndex, 0, movedItem);
    setTags(nextTags);
    setDraggingIndex(null);
    setDragOverIndex(null);

    try {
      for (const [index, tag] of nextTags.entries()) {
        await updateTag({
          id: tag.id,
          name: tag.name,
          textColor: tag.textColor,
          bgColor: tag.bgColor,
          status: tag.isVisible ? 'active' : 'inactive',
          sortOrder: index + 1,
        });
      }
      toaster.create({
        description: '태그 순서가 변경되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      setTags(previousTags);

      const message = error instanceof Error
        ? error.message
        : '태그 순서를 저장하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleCreateTag = async (values: TagFormValues) => {
    try {
      const createdTag = await createTag({
        name: values.name,
        textColor: values.textColor,
        bgColor: values.bgColor,
      });

      setTags((prev) => [...prev, mapTagToTagItem(createdTag)]);

      toaster.create({
        description: '태그가 추가되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '태그를 저장하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleOpenEdit = (index: number) => {
    setEditingTagIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (values: TagFormValues) => {
    if (editingTagIndex === null) return;

    const editingTag = tags[editingTagIndex];
    if (!editingTag) return;

    try {
      const updatedTag = await updateTag({
        id: editingTag.id,
        name: values.name,
        textColor: values.textColor,
        bgColor: values.bgColor,
      });

      setTags((prev) =>
        prev.map((tag, index) =>
          index === editingTagIndex ? mapTagToTagItem(updatedTag) : tag,
        ),
      );

      setIsEditModalOpen(false);
      setEditingTagIndex(null);

      toaster.create({
        description: '태그가 수정되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '태그를 수정하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  const handleDeleteTag = (targetIndex: number) => {
    setDeletingTagIndex(targetIndex);
  };

  const handleConfirmDelete = async () => {
    if (deletingTagIndex === null) return;

    const deletingTag = tags[deletingTagIndex];
    if (!deletingTag) return;

    try {
      await deleteTag(deletingTag.id);

      setTags((prev) => prev.filter((_, index) => index !== deletingTagIndex));

      if (editingTagIndex === deletingTagIndex) {
        setEditingTagIndex(null);
        setIsEditModalOpen(false);
      }

      setDeletingTagIndex(null);

      toaster.create({
        description: '태그가 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '태그를 삭제하지 못했습니다.';

      toaster.create({
        description: message,
        type: 'error',
        duration: 2000,
      });
    }
  };

  const editingTag = editingTagIndex !== null ? tags[editingTagIndex] ?? null : null;
  const editingTagValues = editingTag
    ? {
        name: editingTag.name,
        textColor: editingTag.textColor,
        bgColor: editingTag.bgColor,
      }
    : null;
  const deletingTag = deletingTagIndex !== null ? tags[deletingTagIndex] ?? null : null;

  return (
    <>
      <PageContainer>
        <PageHeader
          left={
            <Text as="h1" fontSize="20px" fontWeight="600" lineHeight="1" color="#111827">
              태그 관리
            </Text>
          }
          right={null}
        />

        <Flex justify="flex-end" mb="16px">
          <AdminButton
            type="button"
            variantStyle="primary"
            size="sm"
            borderRadius="12px"
            bg="#F59E42"
            color="white"
            _hover={{ bg: '#EC8A2E' }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Text as="span" fontSize="18px" lineHeight="1">+</Text>
            <Text as="span">태그 추가</Text>
          </AdminButton>
        </Flex>

        <Flex direction="column" gap="12px">
          {tags.map((tag, index) => {
            const isFixedTag = !!tag.isFixed;
            const isDragging = draggingIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <Box
                key={`${tag.name}-${tag.textColor}-${tag.bgColor}-${index}`}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={(event) => handleDrop(event, index)}
              >
                <AdminCard
                  minH="62px"
                  borderRadius="12px"
                  px="24px"
                  py="0"
                  opacity={isDragging ? 0.55 : 1}
                  borderColor={isDragOver ? '#F59E42' : undefined}
                  boxShadow={isDragOver ? '0 0 0 2px rgba(245, 158, 66, 0.16)' : undefined}
                  transition="opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
                >
                  <Flex minH="62px" align="center" gap="16px">
                    <Flex
                      w="20px"
                      align="center"
                      justify="center"
                      color="#4B5563"
                      draggable={!isFixedTag}
                      cursor={isFixedTag ? 'default' : isDragging ? 'grabbing' : 'grab'}
                      onDragStart={(event) => handleDragStart(event, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {!isFixedTag ? <DragHandleIcon /> : null}
                    </Flex>

                    <AdminTagBadge
                      tag={{
                        id: tag.id,
                        name: tag.name,
                        textColor: tag.textColor,
                        bgColor: tag.bgColor,
                        isDefault: !!tag.isFixed,
                        status: tag.isVisible ? 'active' : 'inactive',
                        sortOrder: index + 1,
                      }}
                    />

                    <Text minW="72px" fontSize="14px" fontWeight="500" color={tag.countAccent ? '#F59E42' : '#374151'}>
                      {tag.count}
                    </Text>

                    <Flex ml="auto" align="center" gap="20px" color="#111827">
                      <AdminSwitch
                        checked={tag.isVisible}
                        onCheckedChange={(checked) => handleToggleVisibility(index, checked)}
                      />
                      {!isFixedTag ? (
                        <>
                          <AdminIconButton aria-label="태그 수정" onClick={() => handleOpenEdit(index)}>
                            <EditIcon />
                          </AdminIconButton>
                          <AdminIconButton aria-label="태그 삭제" onClick={() => handleDeleteTag(index)}>
                            <DeleteIcon />
                          </AdminIconButton>
                        </>
                      ) : null}
                    </Flex>
                  </Flex>
                </AdminCard>

                {isFixedTag ? <Box my="16px" borderTop="1px solid" borderColor="#E5E7EB" /> : null}
              </Box>
            );
          })}
        </Flex>

        <Text fontSize="13px" fontWeight="500" color="#4B5563">
          항목 수 : {tags.length}
        </Text>
      </PageContainer>
      <CreateTagModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTag}
        existingTagNames={tags.map((tag) => tag.name)}
      />
      <CreateTagModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTagIndex(null);
        }}
        onSubmit={handleSubmitEdit}
        initialValues={editingTagValues}
        title="태그 수정"
        submitLabel="저장"
        existingTagNames={tags
          .filter((_, index) => index !== editingTagIndex)
          .map((tag) => tag.name)}
      />
      <BaseModal
        isOpen={deletingTagIndex !== null}
        title="태그 삭제"
        onClose={() => setDeletingTagIndex(null)}
        footer={
          <Flex gap="8px" w="100%">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              onClick={() => setDeletingTagIndex(null)}
              flex={1}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              onClick={handleConfirmDelete}
              flex={1}
            >
              삭제하기
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" fontWeight="600" color="#111827">
            선택한 태그를 삭제하시겠습니까?
          </Text>
          <Text fontSize="13px" color="#6B7280">
            {deletingTag ? `삭제 대상: ${deletingTag.name}` : ''}
          </Text>
        </Flex>
      </BaseModal>
    </>
  );
}