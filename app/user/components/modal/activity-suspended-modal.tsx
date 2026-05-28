'use client';

import { Flex, Text } from '@chakra-ui/react';

import BaseModal from '@/app/user/components/modal/base-modal';
import { Button } from '@/app/user/components/ui/button';
import { COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE } from '@/app/user/lib/community-suspension';

type ActivitySuspendedModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ActivitySuspendedModal({
  isOpen,
  onClose,
}: ActivitySuspendedModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={COMMUNITY_ACTIVITY_SUSPENDED_MESSAGE}
      footer={
        <Flex w="100%">
          <Button type="button" variant="default" onClick={onClose} flex={1}>
            확인
          </Button>
        </Flex>
      }
    >
      <Text fontSize="13px" color="#4B5563" lineHeight="1.7">
        커뮤니티 활동 정지 상태에서는 게시글과 댓글을 작성할 수 없습니다.
      </Text>
    </BaseModal>
  );
}
