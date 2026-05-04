"use client";

import React from 'react';
import { Bell, User, Search, Settings } from 'lucide-react';
import { useChannel } from '../contexts/ChannelContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnicore/ui/components/ui/select";

export default function Header() {
  const { availableChannels, selectedChannelId, setSelectedChannelId } = useChannel();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex justify-between items-center h-12 px-6 w-full sticky top-0 z-40 bg-[#f9f9f9] text-[#2d3435] text-[13px] leading-tight antialiased shadow-none border-none">

      {/* Breadcrumb Area (Static for now) - Will replace with search to match design */}
      <div className="flex-1 max-w-md flex items-center bg-[#f2f4f4] rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#5f5e61] focus-within:bg-white transition-colors">
        <Search size={18} className="text-[#5a6061] mr-2" />
        <input
          type="text"
          placeholder="Sipariş, ürün veya müşteri ara..."
          className="bg-transparent border-none w-full text-[13px] text-[#2d3435] placeholder:text-[#5a6061] focus:ring-0 p-0"
        />
      </div>

      {/* Right Actions Area */}
      <div className="flex items-center space-x-6">

        {/* Channel Selection Dropdown */}
        <div className="hidden md:block w-48">
          {mounted ? (
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger>
                <SelectValue placeholder="Kanal Seçin" className="text-[13px]" />
              </SelectTrigger>
              <SelectContent>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          )}
        </div>

        {/* Notifications */}
        <button className="p-1.5 text-[#5a6061] hover:bg-[#ebeeef] hover:text-[#2d3435] rounded-full transition-colors relative">
          <Bell size={20} />
          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Settings */}
        <button className="p-1.5 text-[#5a6061] hover:bg-[#ebeeef] hover:text-[#2d3435] rounded-full transition-colors">
          <Settings size={20} />
        </button>

        {/* User Profile Dropdown (Static Mock) */}
        <div className="flex items-center space-x-3 cursor-pointer group ml-2">
          <div className="flex flex-col text-right hidden md:flex">
            <span className="text-[13px] font-medium text-[#2d3435]">Yönetici User</span>
            <span className="text-[11px] text-[#5a6061]">Süper Admin</span>
          </div>
          <div className="h-7 w-7 rounded-full bg-[#dde4e5] flex items-center justify-center text-[#2d3435] border border-[#adb3b4]/15 overflow-hidden">
            <User size={16} />
          </div>
        </div>

      </div>
    </header>
  );
}
