
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPageIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user/mypage/community');
  }, [router]);

  return null;
}
