'use client';

import {
  Box,
  Flex,
  Table,
  Text,
  type BoxProps,
  type FlexProps,
  type TextProps,
} from '@chakra-ui/react';
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

type AdminTableProps = BoxProps & {
  children: ReactNode;
};

export default function AdminTable({ children, ...rest }: AdminTableProps) {
  return (
    <Box
      borderWidth="1px"
      borderColor="#E5E7EB"
      borderRadius="16px"
      bg="#FFFFFF"
      overflow="hidden"
      {...rest}
    >
      {children}
    </Box>
  );
}

type AdminTableHeaderProps = FlexProps & {
  title: ReactNode;
  right?: ReactNode;
};

export function AdminTableHeader({ title, right, ...rest }: AdminTableHeaderProps) {
  return (
    <Flex
      px="20px"
      py="16px"
      align="center"
      justify="space-between"
      borderBottomWidth="1px"
      borderBottomColor="#F3F4F6"
      gap="16px"
      {...rest}
    >
      <Text fontSize="16px" fontWeight="700" color="#111827">
        {title}
      </Text>
      {right ? <Box flexShrink={0}>{right}</Box> : null}
    </Flex>
  );
}

type AdminTableFooterProps = FlexProps & {
  left?: ReactNode;
  right?: ReactNode;
};

export function AdminTableFooter({ left, right, ...rest }: AdminTableFooterProps) {
  return (
    <Flex
      px="20px"
      py="16px"
      align="center"
      justify="space-between"
      borderTopWidth="1px"
      borderTopColor="#F3F4F6"
      gap="16px"
      {...rest}
    >
      <Box>{left}</Box>
      <Box>{right}</Box>
    </Flex>
  );
}

type AdminTablePrimitiveProps = {
  children: ReactNode;
};

export function AdminTableRoot({ children }: AdminTablePrimitiveProps) {
  return <Table.Root size="sm" variant="line" tableLayout="fixed">{children}</Table.Root>;
}

export function AdminTableHead({ children }: AdminTablePrimitiveProps) {
  return <Table.Header bg="#F3F4F6">{children}</Table.Header>;
}

export function AdminTableBody({ children }: AdminTablePrimitiveProps) {
  return <Table.Body>{children}</Table.Body>;
}

type AdminTableRowProps = {
  children: ReactNode;
};

export function AdminTableRow({ children }: AdminTableRowProps) {
  return (
    <Table.Row
      borderBottomWidth="1px"
      borderBottomColor="#E5E7EB"
      _hover={{ bg: '#FCFCFD' }}
    >
      {children}
    </Table.Row>
  );
}

type AdminTableColumnHeaderProps = {
  children: ReactNode;
} & React.ComponentProps<typeof Table.ColumnHeader>;

export function AdminTableColumnHeader({ children, ...rest }: AdminTableColumnHeaderProps) {
  return (
    <Table.ColumnHeader
      px="16px"
      py="14px"
      color="#374151"
      fontSize="12px"
      fontWeight="600"
      whiteSpace="nowrap"
      borderBottomWidth="1px"
      borderBottomColor="#D1D5DB"
      {...rest}
    >
      {children}
    </Table.ColumnHeader>
  );
}

type AdminTableCellProps = {
  children: ReactNode;
} & React.ComponentProps<typeof Table.Cell>;

export function AdminTableCell({ children, ...rest }: AdminTableCellProps) {
  return (
    <Table.Cell
      px="16px"
      py="12px"
      minH="44px"
      verticalAlign="middle"
      fontSize="12px"
      color="#4B5563"
      borderBottomWidth="1px"
      borderBottomColor="#E5E7EB"
      {...rest}
    >
      {children}
    </Table.Cell>
  );
}

type AdminTableEllipsisTextProps = TextProps & {
  children: ReactNode;
  tooltipLabel?: ReactNode;
};

export function AdminTableEllipsisText({
  children,
  tooltipLabel,
  ...rest
}: AdminTableEllipsisTextProps) {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const updateTruncated = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    updateTruncated();

    const resizeObserver = new ResizeObserver(() => {
      updateTruncated();
    });

    resizeObserver.observe(element);
    window.addEventListener('resize', updateTruncated);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateTruncated);
    };
  }, [children]);

  return (
    <Text
      ref={textRef}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      minW="0"
      title={
        isTruncated
          ? typeof tooltipLabel === 'string'
            ? tooltipLabel
            : typeof children === 'string' || typeof children === 'number'
            ? String(children)
            : undefined
          : undefined
      }
      {...rest}
    >
      {children}
    </Text>
  );
}
