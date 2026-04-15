"use client";

import React from 'react';
import { Bell, User, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">

      {/* Breadcrumb Area (Static for now) */}
      <div className="flex items-center text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600 transition-colors">OmniCore</Link>
        <ChevronRight size={16} className="mx-2 text-slate-400" />
        <span className="font-medium text-slate-900">Dashboard</span>
      </div>

      {/* Right Actions Area */}
      <div className="flex items-center space-x-6">

        {/* Channel Selection Dropdown */}
        <div className="hidden md:block w-48">
          <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
            <SelectTrigger>
              <SelectValue placeholder="Kanal Seçin" />
            </SelectTrigger>
            <SelectContent>
              {availableChannels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar (Static Mock) */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Arama yap..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          {/* Notification Badge */}
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Dropdown (Static Mock) */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">Yönetici User</span>
            <span className="text-xs text-slate-500">Süper Admin</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
            <User size={18} />
          </div>
        </div>

      </div>
    </header>
  );
}
