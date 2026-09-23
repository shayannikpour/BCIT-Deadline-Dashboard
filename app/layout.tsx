import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bcit-deadlines.vercel.app'),
  title: "Big D's Dashboard",
  description:
    'Shared BCIT deadlines with personal checklists and to-dos for Fall 2026.',
  openGraph: {
    title: "Big D's Dashboard",
    description: 'Assignments and quizzes, all in one place.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Big D's Dashboard",
    description: 'Assignments and quizzes, all in one place.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
