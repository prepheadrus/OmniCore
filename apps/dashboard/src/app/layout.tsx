import './global.css';

export const metadata = {
  title: 'OmniCore Dashboard',
  description: 'SaaS E-Ticaret Yönetim Platformu',
};

import { Toaster } from 'sonner';
import { Inter } from 'next/font/google';
import AiChatInterface from '../components/AiChatInterface';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

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

        {/* Sidebar Structure */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

          {/* Top Header */}
          <Header />

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

        </div>

        {/* Floating Components */}
        <AiChatInterface />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
