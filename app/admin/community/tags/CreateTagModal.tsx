'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ColorPicker,
  Flex,
  Grid,
  Text,
  parseColor,
} from '@chakra-ui/react';
import AdminButton from '@/app/admin/components/ui/button';
import AdminCard from '@/app/admin/components/ui/card';
import AdminBadge from '@/app/admin/components/ui/badge';
import AdminTextField from '@/app/admin/components/ui/text-field';

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
    </svg>
  );
}

export type TagFormValues = {
  name: string;
  textColor: string;
  bgColor: string;
};

type CreateTagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TagFormValues) => void;
  initialValues?: TagFormValues | null;
  title?: string;
  submitLabel?: string;
  existingTagNames?: string[];
};

const initialFormValues: TagFormValues = {
  name: '',
  textColor: '#C2410C',
  bgColor: '#FFEDD5',
};

function getSafeColor(value: string, fallback: string) {
  try {
    return parseColor(value || fallback)
  } catch {
    return parseColor(fallback)
  }
}

function withAlpha(hex: string, alphaHex: string = '66') {
  // supports #RRGGBB -> #RRGGBBAA
  if (!hex) return hex;
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex; // fallback if not in expected format
}

type ColorFieldPickerProps = {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}

function ColorFieldPicker({ label, value, fallback, onChange }: ColorFieldPickerProps) {
  return (
    <ColorPicker.Root
      value={getSafeColor(value, fallback)}
      onValueChange={(details) => onChange(details.value.toString('hex'))}
      positioning={{ placement: 'bottom-start' }}
      lazyMount
      size="xs"
      variant="outline"
    >
      <Flex direction="column" gap="8px" align="center" textAlign="center">
        <Text fontSize="12px" fontWeight="600" color="#4B5563">
          {label}
        </Text>
        <ColorPicker.HiddenInput />
        <ColorPicker.Control>
          <ColorPicker.Input
            h="34px"
            w="96px"
            borderRadius="6px"
            borderColor="#D1D5DB"
            fontSize="11px"
            color="#111827"
            textAlign="center"
            _placeholder={{ color: '#C2C7CF' }}
            _focus={{
              borderColor: '#D1D5DB',
              boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
              outline: 'none',
            }}
            _focusVisible={{
              borderColor: '#D1D5DB',
              boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
              outline: 'none',
            }}
          />
          <ColorPicker.Trigger />
        </ColorPicker.Control>
        <ColorPicker.Positioner>
          <ColorPicker.Content>
            <ColorPicker.Area />
            <ColorPicker.Sliders />
          </ColorPicker.Content>
        </ColorPicker.Positioner>
      </Flex>
    </ColorPicker.Root>
  )
}

export default function CreateTagModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title = '태그 추가',
  submitLabel = '추가',
  existingTagNames = [],
}: CreateTagModalProps) {
  const [formValues, setFormValues] = useState<TagFormValues>(initialFormValues);

  useEffect(() => {
    if (isOpen) {
      setFormValues(initialValues ?? initialFormValues);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleChange = (field: keyof TagFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const trimmedName = formValues.name.trim();
  const normalizedCurrentName = trimmedName.toLowerCase();
  const normalizedInitialName = initialValues?.name.trim().toLowerCase() ?? '';
  const isDuplicateName =
    normalizedCurrentName.length > 0 &&
    normalizedCurrentName !== normalizedInitialName &&
    existingTagNames.some((name) => name.trim().toLowerCase() === normalizedCurrentName);

  const nameErrorText =
    formValues.name.length > 10
      ? '태그명은 10자 이내로 입력해주세요.'
      : isDuplicateName
      ? '중복된 태그명은 사용할 수 없습니다.'
      : undefined;

  const handleSubmit = () => {
    if (isDuplicateName || formValues.name.length > 10) return;

    onSubmit({
      name: formValues.name.trim() || '새로운 태그',
      textColor: formValues.textColor.trim() || '#C2410C',
      bgColor: formValues.bgColor.trim() || '#FFEDD5',
    });
    onClose();
  };

  return (
    <Flex position="fixed" inset="0" zIndex="50" align="center" justify="center" bg="rgba(0,0,0,0.35)" px="16px">
      <AdminCard w="100%" maxW="430px" borderRadius="16px" p="24px" boxShadow="0 20px 40px rgba(17,24,39,0.18)" border="none">
        <Flex align="flex-start" justify="space-between" gap="16px">
          <Text fontSize="15px" fontWeight="600" color="#4B5563">
            {title}
          </Text>
          <Button
            type="button"
            unstyled
            onClick={onClose}
            display="inline-flex"
            h="24px"
            w="24px"
            alignItems="center"
            justifyContent="center"
            color="#9CA3AF"
            aria-label="모달 닫기"
          >
            <CloseIcon />
          </Button>
        </Flex>

        <Box mt="12px" borderTop="1px solid" borderColor="#F3F4F6" />

        <Flex direction="column" gap="16px" mt="16px">
          <AdminTextField
            label="태그명"
            value={formValues.name}
            onChange={(e) => handleChange('name', e.target.value)}
            type="text"
            placeholder="태그명을 작성해 주세요. (10글자 이내)"
            maxLength={10}
            errorText={nameErrorText}
          />

          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="16px">
            <ColorFieldPicker
              label="텍스트 색상"
              value={formValues.textColor}
              fallback="#C2410C"
              onChange={(value) => handleChange('textColor', value)}
            />
            <ColorFieldPicker
              label="배경 색상"
              value={formValues.bgColor}
              fallback="#FFEDD5"
              onChange={(value) => handleChange('bgColor', value)}
            />
          </Grid>

          <Box borderRadius="12px" bg="#F9FAFB" px="16px" py="20px" textAlign="center">
            <Text fontSize="11px" fontWeight="500" color="#B8BDC7">
              미리보기
            </Text>
            <Flex mt="12px" justify="center" gap="24px" wrap="wrap">
              <Flex direction="column" align="center" gap="8px">
                <Text fontSize="10px" fontWeight="500" color="#9CA3AF">
                  기본값
                </Text>
                <AdminBadge
                  tone="orange"
                  px="12px"
                  py="4px"
                  fontSize="11px"
                  fontWeight="600"
                  color={formValues.textColor || '#C2410C'}
                  bg={formValues.bgColor || '#FFEDD5'}
                  borderWidth="1px"
                  borderColor={withAlpha(formValues.textColor || '#C2410C')}
                >
                  {formValues.name.trim() || '새로운 태그'}
                </AdminBadge>
              </Flex>

              <Flex direction="column" align="center" gap="8px">
                <Text fontSize="10px" fontWeight="500" color="#9CA3AF">
                  선택값
                </Text>
                <AdminBadge
                  tone="orange"
                  px="12px"
                  py="4px"
                  fontSize="11px"
                  fontWeight="600"
                  color={formValues.bgColor || '#FFEDD5'}
                  bg={formValues.textColor || '#C2410C'}
                  borderWidth="1px"
                  borderColor={withAlpha(formValues.bgColor || '#FFEDD5')}
                >
                  {formValues.name.trim() || '새로운 태그'}
                </AdminBadge>
              </Flex>
            </Flex>
            <Text mt="12px" fontSize="11px" color="#C2C7CF">
              게시글 목록 및 상세 화면에서 기본값/선택값 상태에 따라 위와 같이 표시됩니다.
            </Text>
          </Box>
        </Flex>

        <Flex mt="28px" align="center" gap="12px">
          <AdminButton
            type="button"
            variantStyle="outline"
            size="md"
            flex="1"
            onClick={onClose}
          >
            취소
          </AdminButton>
          <AdminButton type="button" variantStyle="primary" size="md" flex="1" onClick={handleSubmit}>
            {submitLabel}
          </AdminButton>
        </Flex>
      </AdminCard>
    </Flex>
  );
}
