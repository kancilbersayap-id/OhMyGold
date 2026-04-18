import './globals.css';
import { Geist_Mono } from 'next/font/google';
import MainLayout from '@/components/layout/MainLayout';

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'OhMyGold',
  description: 'Gold portfolio dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geistMono.variable}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
