import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://bcit-deadline-dashboard-shayan.shayannk.chatgpt.site',
  ),
  title: 'BCIT Deadline Dashboard',
  description:
    'Shared BCIT deadlines with personal checklists and to-dos for Fall 2026.',
  openGraph: {
    title: 'BCIT Deadline Dashboard',
    description: 'Assignments and quizzes, all in one place.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BCIT Deadline Dashboard',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
