'use client';

import { Switch } from '@chakra-ui/react';

type AdminSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onCheckedChange: (checked: boolean) => void;
};

export default function AdminSwitch({
  checked,
  disabled = false,
  size = 'md',
  onCheckedChange,
}: AdminSwitchProps) {
  const sizeMap = {
    sm: { trackW: '40px', trackH: '20px', thumb: '16px' },
    md: { trackW: '44px', trackH: '24px', thumb: '20px' },
    lg: { trackW: '52px', trackH: '28px', thumb: '24px' },
  };

  const { trackW, trackH, thumb } = sizeMap[size];

  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={(details) => onCheckedChange(!!details.checked)}
    >
      <Switch.HiddenInput />
      <Switch.Control
        w={trackW}
        h={trackH}
        borderRadius="9999px"
        display="flex"
        alignItems="center"
        px="2px"
        bg={checked ? '#F59E42' : '#E5E7EB'}
        transition="background-color 0.2s ease"
        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        <Switch.Thumb bg="white" boxShadow="sm" w={thumb} h={thumb} />
      </Switch.Control>
    </Switch.Root>
  );
}
