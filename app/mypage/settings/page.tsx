'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mypage/settings/profile');
  }, [router]);

  return null;
}