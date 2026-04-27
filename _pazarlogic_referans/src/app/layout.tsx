import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PazarLogic - Pazaryeri Entegrasyon Paneli',
  description: 'Cok kanalli e-ticaret entegrasyon yonetim paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
