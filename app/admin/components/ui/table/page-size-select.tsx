

import { Box, Button, Flex, Text } from '@chakra-ui/react';

import { ChevronDownIcon } from '@/app/admin/components/ui/icons';

export type AdminPageSizeSelectProps = {
  value: number;
  options: readonly number[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: number) => void;
};

export default function AdminPageSizeSelect({
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: AdminPageSizeSelectProps) {
  return (
    <Box position="relative">
      <Button
        type="button"
        variant="outline"
        h="40px"
        px="12px"
        borderRadius="8px"
        borderColor="#F59E42"
        bg="#FFFFFF"
        color="#F59E42"
        fontSize="13px"
        fontWeight="600"
        _hover={{ bg: '#FFF7ED' }}
        onClick={onToggle}
      >
        <Flex align="center" gap="4px">
          <Text as="span">{value}</Text>
          <ChevronDownIcon />
        </Flex>
      </Button>

      {isOpen ? (
        <Box
          position="absolute"
          top="calc(100% + 8px)"
          right="0"
          minW="88px"
          borderWidth="1px"
          borderColor="#E5E7EB"
          borderRadius="12px"
          bg="#FFFFFF"
          boxShadow="0 12px 32px rgba(17, 24, 39, 0.12)"
          p="6px"
          zIndex={20}
        >
          <Flex direction="column" gap="2px">
            {options.map((option) => {
              const isActive = option === value;

              return (
                <Button
                  key={option}
                  type="button"
                  variant="ghost"
                  justifyContent="flex-start"
                  h="34px"
                  px="10px"
                  borderRadius="8px"
                  bg={isActive ? '#FFF7ED' : '#FFFFFF'}
                  color={isActive ? '#F59E42' : '#374151'}
                  fontSize="13px"
                  fontWeight={isActive ? '700' : '500'}
                  _hover={{ bg: '#F9FAFB' }}
                  onClick={() => onSelect(option)}
                >
                  {option}
                </Button>
              );
            })}
          </Flex>
        </Box>
      ) : null}
    </Box>
  );
}