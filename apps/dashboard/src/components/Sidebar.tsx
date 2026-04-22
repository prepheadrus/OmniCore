'use client';

import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Undo,
  Package,
  Users,
  Truck,
  FileText,
  Radar,
  Tags,
  RefreshCcw,
  Settings,
  HelpCircle,
  LogOut,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'GÖRÜNÜM',
      items: [
        { name: 'Panel', icon: LayoutDashboard, href: '/' },
        { name: 'Analizler', icon: BarChart2, href: '/analytics' },
      ],
    },
    {
      title: 'OPERASYON',
      items: [
        { name: 'Siparişler', icon: ShoppingCart, href: '/orders' },
        { name: 'İadeler', icon: Undo, href: '/returns' },
        { name: 'Envanter', icon: Package, href: '/inventory' },
        { name: 'Müşteriler', icon: Users, href: '/customers' },
      ],
    },
    {
      title: 'EKONOMİ',
      items: [
        { name: 'Tedarikçiler', icon: Truck, href: '/procurement/suppliers' },
        { name: 'Alım Faturaları', icon: FileText, href: '/procurement/invoices' },
      ],
    },
    {
      title: 'ZEKA & SİSTEM',
      items: [
        { name: 'Rekabet Radarı', icon: Radar, href: '/radar' },
        { name: 'Otonom Fiyatlandırma', icon: Tags, href: '/pricing' },
        { name: 'Senkronizasyon', icon: RefreshCcw, href: '/sync' },
      ],
    },
  ];

  return (
    <aside className="flex flex-col py-4 px-3 space-y-1 h-screen w-64 fixed left-0 top-0 bg-[#f2f4f4] border-r border-[#dde4e5] z-30 text-[13px] tracking-tight">
      {/* Logo Area */}
      <div className="px-3 mb-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-md bg-[#5f5e61] flex items-center justify-center text-white shadow-sm">
          <Layers size={18} />
        </div>
        <div>
          <h1 className="text-[14px] font-bold text-[#2d3435]">OmniCore Ops</h1>
          <p className="text-[11px] text-[#5a6061]">B2B Yönetimi</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto pr-2 custom-scrollbar">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-[#5a6061] uppercase tracking-wider mb-1.5">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-sm duration-200 ease-in-out font-medium ${
                      isActive
                        ? 'bg-white text-[#2d3435] shadow-sm'
                        : 'text-[#5a6061] hover:text-[#2d3435] hover:bg-[#ebeeef]/50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#2d3435]' : 'text-[#5a6061]'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-0.5 pt-4 border-t border-[#dde4e5]">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2 text-[#5a6061] hover:text-[#2d3435] hover:bg-[#ebeeef]/50 duration-200 ease-in-out rounded-sm font-medium"
        >
          <Settings size={18} />
          <span>Ayarlar</span>
        </Link>
        <Link
          href="/support"
          className="flex items-center space-x-3 px-3 py-2 text-[#5a6061] hover:text-[#2d3435] hover:bg-[#ebeeef]/50 duration-200 ease-in-out rounded-sm font-medium"
        >
          <HelpCircle size={18} />
          <span>Destek</span>
        </Link>
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 text-[#5a6061] hover:text-[#2d3435] hover:bg-[#ebeeef]/50 duration-200 ease-in-out rounded-sm font-medium"
        >
          <LogOut size={18} />
          <span>Çıkış</span>
        </button>
      </div>
    </aside>
  );
}
