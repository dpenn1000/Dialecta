import type { Metadata } from 'next';
import '@/styles/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dialecta',
  description: 'A platform for constructive dialogue, informed debate, and idea-first discourse.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
