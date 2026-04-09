

'use client';

import { Flex, IconButton, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu';
import type { ReactNode } from 'react';

type AdminTablePaginationItem =
  | { type: 'first' }
  | { type: 'prev' }
  | { type: 'page'; value: number | string; isActive?: boolean }
  | { type: 'ellipsis'; value?: ReactNode }
  | { type: 'next' }
  | { type: 'last' };

type AdminTablePaginationProps = {
  items: AdminTablePaginationItem[];
  onItemClick?: (item: AdminTablePaginationItem) => void;
};

type PageButtonProps = {
  children: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

function PageButton({ children, isActive = false, onClick }: PageButtonProps) {
  return (
    <Flex
      minW="32px"
      h="36px"
      px="6px"
      align="center"
      justify="center"
      borderRadius="9999px"
      bg={isActive ? '#E98A1F' : 'transparent'}
      color={isActive ? '#FFFFFF' : '#111827'}
      fontSize="13px"
      fontWeight={isActive ? '700' : '600'}
      cursor="pointer"
      userSelect="none"
      transition="background-color 0.2s ease, color 0.2s ease"
      _hover={{ bg: isActive ? '#E98A1F' : '#F3F4F6' }}
      onClick={onClick}
    >
      {children}
    </Flex>
  );
}

type NavButtonProps = {
  icon: ReactNode;
  onClick?: () => void;
};

function NavButton({ icon, onClick }: NavButtonProps) {
  return (
    <IconButton
      aria-label="pagination navigation"
      variant="ghost"
      size="sm"
      minW="28px"
      h="28px"
      color="#6B7280"
      _hover={{ bg: '#F3F4F6', color: '#111827' }}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  );
}

export default function AdminTablePagination({ items, onItemClick }: AdminTablePaginationProps) {
  return (
    <Flex align="center" gap="4px">
      {items.map((item, index) => {
        if (item.type === 'first') {
          return (
            <NavButton
              key={`pagination-first-${index}`}
              icon={<LuChevronsLeft size={16} />}
              onClick={() => onItemClick?.(item)}
            />
          );
        }

        if (item.type === 'prev') {
          return (
            <NavButton
              key={`pagination-prev-${index}`}
              icon={<LuChevronLeft size={16} />}
              onClick={() => onItemClick?.(item)}
            />
          );
        }

        if (item.type === 'next') {
          return (
            <NavButton
              key={`pagination-next-${index}`}
              icon={<LuChevronRight size={16} />}
              onClick={() => onItemClick?.(item)}
            />
          );
        }

        if (item.type === 'last') {
          return (
            <NavButton
              key={`pagination-last-${index}`}
              icon={<LuChevronsRight size={16} />}
              onClick={() => onItemClick?.(item)}
            />
          );
        }

        if (item.type === 'ellipsis') {
          return (
            <Flex
              key={`pagination-ellipsis-${index}`}
              minW="24px"
              h="36px"
              align="center"
              justify="center"
              color="#6B7280"
              fontSize="13px"
              fontWeight="600"
              userSelect="none"
            >
              {item.value ?? '...'}
            </Flex>
          );
        }

        return (
          <PageButton
            key={`pagination-page-${item.value}-${index}`}
            isActive={item.isActive}
            onClick={() => onItemClick?.(item)}
          >
            <Text as="span" lineHeight="1">
              {item.value}
            </Text>
          </PageButton>
        );
      })}
    </Flex>
  );
}

export type { AdminTablePaginationItem, AdminTablePaginationProps };