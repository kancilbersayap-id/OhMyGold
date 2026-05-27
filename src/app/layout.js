import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import MainLayout from '@/components/layout/MainLayout';
import { getLocale, getT } from '@/i18n/server';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export async function generateMetadata() {
  const t = await getT();
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
