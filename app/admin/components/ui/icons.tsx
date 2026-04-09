'use client';

export function DragHandleIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
      <path d="M7 5.5a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM7 11a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM7 16.5a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5z" strokeLinejoin="round" />
      <path d="M10.8 6.7l2.5 2.5" strokeLinecap="round" />
      <path d="M12.8 4.7l1.5-1.5a1.4 1.4 0 012 2l-1.5 1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DeleteIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="10" cy="10" r="6.4" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" />
    </svg>
  );
}
