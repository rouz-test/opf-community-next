'use client';

import {
  Box,
  Flex,
  Portal,
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

type AdminTableRootProps = {
  children: ReactNode;
} & React.ComponentProps<typeof Table.Root>;

type AdminTableHeadProps = {
  children: ReactNode;
} & React.ComponentProps<typeof Table.Header>;

type AdminTableBodyProps = {
  children: ReactNode;
} & React.ComponentProps<typeof Table.Body>;

export function AdminTableRoot({ children, ...rest }: AdminTableRootProps) {
  return (
    <Table.Root size="sm" variant="line" tableLayout="fixed" {...rest}>
      {children}
    </Table.Root>
  );
}

export function AdminTableHead({ children, ...rest }: AdminTableHeadProps) {
  return <Table.Header {...rest}>{children}</Table.Header>;
}

export function AdminTableBody({ children, ...rest }: AdminTableBodyProps) {
  return <Table.Body {...rest}>{children}</Table.Body>;
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
      bg="#F3F4F6"
      color="#374151"
      fontSize="12px"
      fontWeight="700"
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
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const resolvedTooltipLabel =
    typeof tooltipLabel === 'string'
      ? tooltipLabel
      : typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined;

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

  const updateTooltipPosition = () => {
    const element = textRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    setTooltipPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  };

  const textElement = (
    <Box
      ref={textRef}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      minW="0"
      maxW="100%"
      w="100%"
      display="block"
      title={isTruncated ? resolvedTooltipLabel : undefined}
      onMouseEnter={() => {
        if (!resolvedTooltipLabel || !isTruncated) return;
        updateTooltipPosition();
        setIsTooltipOpen(true);
      }}
      onMouseLeave={() => {
        setIsTooltipOpen(false);
      }}
      onFocus={() => {
        if (!resolvedTooltipLabel || !isTruncated) return;
        updateTooltipPosition();
        setIsTooltipOpen(true);
      }}
      onBlur={() => {
        setIsTooltipOpen(false);
      }}
      {...rest}
    >
      {children}
    </Box>
  );

  if (!resolvedTooltipLabel) {
    return textElement;
  }

  return (
    <>
      {textElement}
      {isTooltipOpen && isTruncated ? (
        <Portal>
          <Box
            position="fixed"
            top={`${tooltipPosition.top - 8}px`}
            left={`${tooltipPosition.left}px`}
            transform="translate(-50%, -100%)"
            zIndex="tooltip"
            maxW="420px"
            px="10px"
            py="8px"
            borderRadius="8px"
            bg="rgba(17, 24, 39, 0.96)"
            color="#FFFFFF"
            fontSize="12px"
            lineHeight="1.5"
            boxShadow="0 10px 24px rgba(15, 23, 42, 0.22)"
            whiteSpace="normal"
            wordBreak="break-word"
            pointerEvents="none"
          >
            {resolvedTooltipLabel}
          </Box>
        </Portal>
      ) : null}
    </>
  );
}
