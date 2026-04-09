export default function SidebarSectionIcon({ title }: { title: string }) {
  if (title === '회원') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="10" cy="6" r="2.5" />
        <path d="M5.5 15.5c.8-2.2 2.4-3.5 4.5-3.5s3.7 1.3 4.5 3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (title === '관리자') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M10 3.5l1.5 2.1 2.6.4-1.9 1.8.4 2.6L10 9.3 7.4 10.4l.4-2.6L5.9 6l2.6-.4L10 3.5Z" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title === '캠퍼스') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4.5 5.5h11v9h-11z" />
        <path d="M7 5.5v9" />
      </svg>
    );
  }

  if (title === '아티클') {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 3.5h6l3 3v10H6z" />
        <path d="M12 3.5v3h3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5.5 6.5h9" strokeLinecap="round" />
      <path d="M5.5 10h6.5" strokeLinecap="round" />
      <path d="M5.5 13.5h9" strokeLinecap="round" />
    </svg>
  );
}
