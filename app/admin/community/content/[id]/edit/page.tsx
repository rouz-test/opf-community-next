'use client';

import { useParams } from 'next/navigation';

import CommunityContentFormPage from '@/app/admin/community/content/_components/community-content-form-page';

export default function CommunityContentEditPage() {
  const params = useParams<{ id: string }>();
  const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return <CommunityContentFormPage contentId={contentId} />;
}
