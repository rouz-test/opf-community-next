import { adminSidebarSections } from '../sidebar/admin-sidebar-data';

export function getAdminBreadcrumb(pathname: string) {
  for (const section of adminSidebarSections) {
    const matchedItem = section.items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

    if (matchedItem) {
      return [section.title, matchedItem.label];
    }
  }

  if (pathname === '/admin') {
    return ['관리자'];
  }

  return ['관리자'];
}

export function formatBreadcrumbLabel(label: string) {
  if (label === '회원 목록') return '회원목록';
  if (label === '관리자 목록') return '관리자 목록';
  return label;
}
