'use client';

import { toaster } from '@/app/admin/components/ui/toaster';

function copyWithFallback(url: string) {
  const textarea = document.createElement('textarea');
  textarea.value = url;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export async function copyContentUrlToClipboard(contentId: string) {
  const url = `${window.location.origin}/admin/community/content/${contentId}`;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      copyWithFallback(url);
    }

    toaster.create({
      title: '콘텐츠 URL이 복사되었습니다.',
      type: 'success',
      duration: 1800,
    });
  } catch {
    toaster.create({
      title: 'URL 복사에 실패했습니다.',
      description: '브라우저 권한을 확인한 뒤 다시 시도해주세요.',
      type: 'error',
      duration: 2200,
    });
  }
}
