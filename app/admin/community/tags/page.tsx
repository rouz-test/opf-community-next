'use client';
import { useState } from 'react';
import type { DragEvent } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
} from '@chakra-ui/react';
import AdminIconButton from '@/app/admin/components/ui/icon-button';
import { DragHandleIcon, EditIcon, DeleteIcon } from '@/app/admin/components/ui/icons';
import PageContainer from '@/app/admin/components/page/page-container';
import PageHeader from '@/app/admin/components/page/page-header';
import AdminButton from '@/app/admin/components/ui/button';
import AdminCard from '@/app/admin/components/ui/card';
import AdminBadge from '@/app/admin/components/ui/badge';
import AdminSwitch from '@/app/admin/components/ui/switch';
import CreateTagModal, { type TagFormValues } from './CreateTagModal';
import BaseModal from '@/app/admin/components/modal/base-modal';

type TagItem = TagFormValues & {
  count: string;
  countAccent?: boolean;
  isVisible: boolean;
  isFixed?: boolean;
};

const initialTags: TagItem[] = [
  { name: '미지정', count: '195,405', textColor: '#6B7280', bgColor: '#F3F4F6', isVisible: true, isFixed: true },
  { name: '마케팅', count: '195,405', textColor: '#F59E42', bgColor: '#FFF1E8', isVisible: true },
  { name: '프로덕트', count: '193', textColor: '#5B5CE2', bgColor: '#ECEBFF', isVisible: true },
  { name: '인사', count: '32,344', textColor: '#EC4899', bgColor: '#FDE7F3', isVisible: false },
  { name: 'MVP', count: '0', textColor: '#3B82F6', bgColor: '#DBEAFE', isVisible: true },
  { name: '마케팅', count: '195,405', textColor: '#F59E42', bgColor: '#FFF1E8', countAccent: true, isVisible: true },
  { name: '마케팅', count: '195,405', textColor: '#F59E42', bgColor: '#FFF1E8', countAccent: true, isVisible: false },
  { name: '마케팅', count: '195,405', textColor: '#F59E42', bgColor: '#FFF1E8', countAccent: true, isVisible: true },
];

export default function CommunityTagsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [deletingTagIndex, setDeletingTagIndex] = useState<number | null>(null);
  const [tags, setTags] = useState<TagItem[]>(initialTags);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleToggleVisibility = (targetIndex: number, checked: boolean) => {
    setTags((prev) =>
      prev.map((tag, index) =>
        index === targetIndex ? { ...tag, isVisible: checked } : tag,
      ),
    );
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, index: number) => {
    if (index === 0) return;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDraggingIndex(index);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    if (index === 0 || draggingIndex === null || draggingIndex === index) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();

    if (draggingIndex === null || draggingIndex === targetIndex || targetIndex === 0) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    setTags((prev) => {
      const next = [...prev];
      const [movedItem] = next.splice(draggingIndex, 1);
      next.splice(targetIndex, 0, movedItem);
      return next;
    });

    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleCreateTag = (values: TagFormValues) => {
    setTags((prev) => [
      ...prev,
      {
        ...values,
        count: '0',
        isVisible: true,
      },
    ]);
  };

  const handleOpenEdit = (index: number) => {
    setEditingTagIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (values: TagFormValues) => {
    if (editingTagIndex === null) return;

    setTags((prev) =>
      prev.map((tag, index) =>
        index === editingTagIndex ? { ...tag, ...values } : tag,
      ),
    );
  };

  const handleDeleteTag = (targetIndex: number) => {
    setDeletingTagIndex(targetIndex);
  };

  const handleConfirmDelete = () => {
    if (deletingTagIndex === null) return;

    setTags((prev) => prev.filter((_, index) => index !== deletingTagIndex));

    if (editingTagIndex === deletingTagIndex) {
      setEditingTagIndex(null);
      setIsEditModalOpen(false);
    }

    setDeletingTagIndex(null);
  };

  const editingTag = editingTagIndex !== null ? tags[editingTagIndex] ?? null : null;
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
          right={
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
          }
        />

        <Flex direction="column" gap="12px">
          {tags.map((tag, index) => {
            const isFirst = index === 0;
            const isDragging = draggingIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <Box
                key={`${tag.name}-${index}`}
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
                      draggable={!isFirst}
                      cursor={isFirst ? 'default' : isDragging ? 'grabbing' : 'grab'}
                      onDragStart={(event) => handleDragStart(event, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {!isFirst ? <DragHandleIcon /> : null}
                    </Flex>

                    <AdminBadge
                      tone="gray"
                      minW="56px"
                      px="12px"
                      py="4px"
                      fontSize="11px"
                      fontWeight="600"
                      color={tag.textColor}
                      bg={tag.bgColor}
                      borderColor="transparent"
                    >
                      {tag.name}
                    </AdminBadge>

                    <Text minW="72px" fontSize="14px" fontWeight="500" color={tag.countAccent ? '#F59E42' : '#374151'}>
                      {tag.count}
                    </Text>

                    <Flex ml="auto" align="center" gap="20px" color="#111827">
                      <AdminSwitch
                        checked={tag.isVisible}
                        onCheckedChange={(checked) => handleToggleVisibility(index, checked)}
                      />
                      {!isFirst ? (
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

                {isFirst ? <Box my="16px" borderTop="1px solid" borderColor="#E5E7EB" /> : null}
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
        initialValues={editingTag}
        title="태그 수정"
        submitLabel="저장"
        existingTagNames={tags.map((tag) => tag.name)}
      />
      <BaseModal
        isOpen={deletingTagIndex !== null}
        title="태그 삭제"
        onClose={() => setDeletingTagIndex(null)}
        footer={
          <Flex align="center" gap="12px">
            <AdminButton
              type="button"
              variantStyle="outline"
              size="md"
              flex="1"
              onClick={() => setDeletingTagIndex(null)}
            >
              취소
            </AdminButton>
            <AdminButton
              type="button"
              variantStyle="primary"
              size="md"
              flex="1"
              bg="#EF4444"
              borderColor="#EF4444"
              _hover={{ bg: '#DC2626', borderColor: '#DC2626' }}
              onClick={handleConfirmDelete}
            >
              삭제
            </AdminButton>
          </Flex>
        }
      >
        <Flex direction="column" gap="8px">
          <Text fontSize="14px" color="#374151">
            {deletingTag ? `‘${deletingTag.name}’ 태그를 삭제하시겠습니까?` : '선택한 태그를 삭제하시겠습니까?'}
          </Text>
          
        </Flex>
      </BaseModal>
    </>
  );
}