import './global.css';

export const metadata = {
  title: 'OmniCore Dashboard',
  description: 'SaaS E-Ticaret Yönetim Platformu',
};

import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';

// Initialize the Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.className}>
      <body className="bg-slate-50 min-h-screen flex overflow-hidden">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
