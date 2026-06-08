
import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko" style={{ colorScheme: 'light', backgroundColor: '#ffffff' }}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body style={{ backgroundColor: '#ffffff' }}>{children}</body>
    </html>
  );
}
