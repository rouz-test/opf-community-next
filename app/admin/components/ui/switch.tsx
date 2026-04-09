'use client';

import { Switch } from '@chakra-ui/react';

type AdminSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export default function AdminSwitch({
  checked,
  disabled = false,
  onCheckedChange,
}: AdminSwitchProps) {
  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={(details) => onCheckedChange(!!details.checked)}
    >
      <Switch.HiddenInput />
      <Switch.Control
        w="44px"
        h="24px"
        borderRadius="9999px"
        display="flex"
        alignItems="center"
        px="2px"
        bg={checked ? '#F59E42' : '#E5E7EB'}
        transition="background-color 0.2s ease"
        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        <Switch.Thumb bg="white" boxShadow="sm" w="20px" h="20px" />
      </Switch.Control>
    </Switch.Root>
  );
}
