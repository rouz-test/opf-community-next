'use client';

import { Box, Flex, Grid, Image, Input, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/app/user/components/providers/AuthProvider';
import { Button } from '@/app/user/components/ui/button';
import { toaster } from '@/app/user/components/ui/toaster';
import type { UserAccount, UserProfileBundle } from '@/types/user';

function Field({
  label,
  placeholder,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <Box>
      <Text mb="8px" fontSize="14px" fontWeight="700" color="#111827">
        {label}
      </Text>
      <Input
        h="48px"
        borderRadius="14px"
        borderColor="#E5E7EB"
        bg={readOnly ? '#F9FAFB' : '#FFFFFF'}
        px="16px"
        fontSize="14px"
        color={readOnly ? '#9CA3AF' : '#111827'}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        _placeholder={{ color: '#9CA3AF' }}
        _focus={{
          borderColor: '#FDBA74',
          boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.14)',
        }}
      />
    </Box>
  );
}

export default function MyPageSettingsProfilePage() {
  const { currentUser, setCurrentUserByAccountId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/mock/users?accountId=${currentUser.accountId}`, {
          cache: 'no-store',
        });
        const data = (await response.json().catch(() => null)) as UserProfileBundle | { message?: string } | null;

        if (!response.ok || !data || !('account' in data)) {
          throw new Error((data as { message?: string } | null)?.message || '프로필 정보를 불러오지 못했습니다.');
        }

        if (!isMounted) return;

        setAccount(data.account);
        setAvatarPreview(data.account.profile.avatar || '/images/profiles/real-large.png');
        setCompany(data.account.profile.company ?? '');
        setPosition(data.account.profile.position ?? '');
      } catch (error) {
        if (!isMounted) return;

        toaster.create({
          type: 'error',
          description: error instanceof Error ? error.message : '프로필 정보를 불러오지 못했습니다.',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser.accountId]);

  const handleSelectImage = (file: File | undefined) => {
    if (!file) return;

    if (!/^image\/(png|jpe?g|svg\+xml|webp)$/.test(file.type)) {
      toaster.create({
        type: 'error',
        description: 'PNG, JPG, SVG, WEBP 이미지만 업로드할 수 있습니다.',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toaster.create({
        type: 'error',
        description: '10MB 이하 이미지만 업로드할 수 있습니다.',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!account || isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/mock/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: account.accountId,
          profile: {
            avatar: avatarPreview,
            company,
            position,
          },
        }),
      });
      const data = (await response.json().catch(() => null)) as UserAccount | { message?: string } | null;

      if (!response.ok || !data || !('accountId' in data)) {
        throw new Error((data as { message?: string } | null)?.message || '프로필 정보를 저장하지 못했습니다.');
      }

      setAccount(data);
      await setCurrentUserByAccountId(data.accountId);
      toaster.create({
        type: 'success',
        description: '프로필 정보가 저장되었습니다.',
      });
    } catch (error) {
      toaster.create({
        type: 'error',
        description: error instanceof Error ? error.message : '프로필 정보를 저장하지 못했습니다.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box mx="auto" w="100%" maxW="960px">
      <Box>
        <Text fontSize="20px" fontWeight="700" color="#111827">
          프로필
        </Text>
        <Text mt="4px" fontSize="14px" color="#6B7280">
          커뮤니티에 노출될 실명 프로필 정보를 관리합니다.
        </Text>
      </Box>

      <Box
        mt="24px"
        borderWidth="1px"
        borderColor="#E5E7EB"
        borderRadius="28px"
        bg="#FFFFFF"
        px={{ base: '20px', sm: '32px' }}
        py={{ base: '24px', sm: '36px' }}
        boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
      >
        <Flex direction="column" gap="32px">
          <Box as="section">
            <Text fontSize="14px" fontWeight="700" color="#111827">
              프로필 사진
            </Text>
            <Flex direction="column" align="flex-start" gap="16px" mt="20px">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                hidden
                onChange={(event) => {
                  handleSelectImage(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
              <Box
                h="64px"
                w="64px"
                overflow="hidden"
                borderRadius="9999px"
                borderWidth="1px"
                borderColor="#E5E7EB"
              >
                <Image
                  src={avatarPreview || '/images/profiles/real-large.png'}
                  alt={account?.verification.realName ?? currentUser.name}
                  h="100%"
                  w="100%"
                  objectFit="cover"
                />
              </Box>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isSaving}
              >
                사진 업로드
              </Button>
              <Text fontSize="12px" color="#9CA3AF">
                *10MB 이하 PNG / JPG / SVG 파일만 업로드해 주세요.
              </Text>
            </Flex>
          </Box>

          <Box as="section">
            <Grid gap="24px" templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }}>
              <Field label="이름" value={account?.verification.realName ?? currentUser.name} readOnly />
              <Field label="연결된 이메일" value={account?.auth.socialEmail ?? ''} readOnly />
            </Grid>

            <Grid gap="24px" mt="24px" templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }}>
              <Field label="소속" value={company} onChange={setCompany} placeholder="소속명을 입력해 주세요." />
              <Field
                label="직책"
                value={position}
                onChange={setPosition}
                placeholder="직책을 입력해 주세요."
              />
            </Grid>
          </Box>

          <Flex justify="flex-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={isSaving}
              disabled={isLoading || !account}
              onClick={handleSave}
            >
              저장
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
