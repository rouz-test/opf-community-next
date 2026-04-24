'use client';

import { Box, Button, Flex, Portal, Text } from '@chakra-ui/react';
import { Archive, Edit3, Megaphone, MoreVertical, Pin, PinOff, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CommunityContent } from '@/types/community-content';

type ContentActionMenuProps = {
  content: CommunityContent;
  isSubmitting?: boolean;
  onArchiveToggle: () => void;
  onPinnedToggle: () => void;
  onNoticeToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ContentActionMenu({
  content,
  isSubmitting = false,
  onArchiveToggle,
  onPinnedToggle,
  onNoticeToggle,
  onEdit,
  onDelete,
}: ContentActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const updateMenuPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const menuHeight = 280;
    const top = Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - menuHeight - 8));
    const right = Math.max(8, window.innerWidth - rect.right);

    setMenuPosition({ top, right });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    updateMenuPosition();

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const handleClick = (cb: () => void) => {
    setIsOpen(false);
    cb();
  };

  return (
    <Box ref={rootRef} display="inline-flex" position="relative" onClick={(event) => event.stopPropagation()}>
      <Button
        variant="ghost"
        size="sm"
        minW="36px"
        px="8px"
        color="#6B7280"
        disabled={isSubmitting}
        onClick={(event) => {
          event.stopPropagation();
          updateMenuPosition();
          setIsOpen((p) => !p);
        }}
      >
        <MoreVertical size={18} />
      </Button>

      {isOpen && (
        <Portal>
          <Box
            ref={panelRef}
            position="fixed"
            top={`${menuPosition.top}px`}
            right={`${menuPosition.right}px`}
            zIndex="popover"
            minW="180px"
            maxH="280px"
            overflowY="auto"
            borderWidth="1px"
            borderColor="#E5E7EB"
            borderRadius="12px"
            bg="#FFFFFF"
            boxShadow="0 16px 32px rgba(15, 23, 42, 0.12)"
            py="6px"
            onClick={(event) => event.stopPropagation()}
          >
            {/* 보관 */}
            <Button w="100%" variant="ghost" justifyContent="flex-start" px="12px" onClick={() => handleClick(onArchiveToggle)}>
              <Archive size={15} />
              <Text ml="8px">
                {content.status === 'archived' ? '노출 전환' : '보관'}
              </Text>
            </Button>

            {/* 고정 */}
            <Button w="100%" variant="ghost" justifyContent="flex-start" px="12px" onClick={() => handleClick(onPinnedToggle)}>
              {content.flags.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
              <Text ml="8px">
                {content.flags.isPinned ? '고정 해제' : '고정'}
              </Text>
            </Button>

            {/* 공지 */}
            <Button w="100%" variant="ghost" justifyContent="flex-start" px="12px" onClick={() => handleClick(onNoticeToggle)}>
              <Megaphone size={15} />
              <Text ml="8px">
                {content.flags.isNotice ? '공지 해제' : '공지 지정'}
              </Text>
            </Button>

            <Box h="1px" bg="#F3F4F6" my="6px" />

            {/* 수정 */}
            <Button w="100%" variant="ghost" justifyContent="flex-start" px="12px" onClick={() => handleClick(onEdit)}>
              <Edit3 size={15} />
              <Text ml="8px">수정</Text>
            </Button>

            {/* 삭제 */}
            <Button w="100%" variant="ghost" justifyContent="flex-start" px="12px" color="#DC2626" onClick={() => handleClick(onDelete)}>
              <Trash2 size={15} />
              <Text ml="8px">삭제</Text>
            </Button>
          </Box>
        </Portal>
      )}
    </Box>
  );
}