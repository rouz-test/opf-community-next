'use client';

import { Icon, Input, InputGroup, type InputProps } from '@chakra-ui/react';
import type { ComponentProps } from 'react';

import SearchIcon from '@/app/user/components/icons/SearchIcon';

type UserSearchFieldProps = InputProps & {
  iconColor?: string;
  iconSize?: number | string;
  onValueChange?: (value: string) => void;
  rootProps?: ComponentProps<typeof InputGroup>;
};

export function UserSearchField({
  iconColor = 'gray.400',
  iconSize = '16px',
  onChange,
  onValueChange,
  rootProps,
  borderRadius = '10px',
  borderWidth = '0',
  bg = 'white',
  boxShadow = '0 10px 24px rgba(223, 223, 223, 0.9)',
  py = '2.5',
  pr = '4',
  fontSize = 'sm',
  _focus,
  _focusVisible,
  ...inputProps
}: UserSearchFieldProps) {
  const focusStyle = {
    outline: 'none',
    borderColor: 'orange.500',
    boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.35), 0 12px 28px rgba(255, 105, 0, 0.24)',
  };

  return (
    <InputGroup
      {...rootProps}
      startElement={<Icon as={SearchIcon} boxSize={iconSize} color={iconColor} />}
    >
      <Input
        type="text"
        borderRadius={borderRadius}
        borderWidth={borderWidth}
        bg={bg}
        boxShadow={boxShadow}
        py={py}
        pr={pr}
        fontSize={fontSize}
        _focus={_focus ?? focusStyle}
        _focusVisible={_focusVisible ?? focusStyle}
        onChange={(event) => {
          onValueChange?.(event.target.value);
          onChange?.(event);
        }}
        {...inputProps}
      />
    </InputGroup>
  );
}
