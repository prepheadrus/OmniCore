import '../global.css';

import AiChatInterface from '../../components/AiChatInterface';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { ChannelProvider } from '../../contexts/ChannelContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <ChannelProvider>
        {/* Sidebar Structure */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative bg-[#f9f9f9]">

        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-[#f9f9f9]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

        {/* Floating Components */}
        <AiChatInterface />
      </ChannelProvider>
    </SettingsProvider>
  );
}
