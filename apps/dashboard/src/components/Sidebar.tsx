'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Undo,
  Radar,
  Tags,
  RefreshCcw,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Ürün Kataloğu', icon: Package, href: '/products' },
    { name: 'Siparişler', icon: ShoppingCart, href: '/orders' },
    { name: 'İadeler', icon: Undo, href: '/returns' },
    { name: 'Tedarikçiler', icon: Truck, href: '/procurement/suppliers' },
    { name: 'Alım Faturaları', icon: FileText, href: '/procurement/purchase-orders' },
    { name: 'Rekabet Radarı', icon: Radar, href: '/radar' },
    { name: 'Otonom Fiyatlandırma', icon: Tags, href: '/pricing' },
    { name: 'Senkronizasyon', icon: RefreshCcw, href: '/sync' },
    { name: 'Ayarlar', icon: Settings, href: '/settings' },
  ];

  return (
    <aside
      className={`bg-slate-900 text-white transition-all duration-300 flex flex-col relative ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Sidebar Header / Logo Area */}
      <div className="h-14 flex items-center justify-center border-b border-slate-800">
        {!isCollapsed && (
          <span className="text-lg font-bold tracking-wider text-indigo-400">OmniCore</span>
        )}
        {isCollapsed && (
          <span className="text-lg font-bold text-indigo-400">OC</span>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 bg-slate-800 rounded-full p-1 border border-slate-700 hover:bg-slate-700 transition-colors z-10 text-white"
        title={isCollapsed ? 'Genişlet' : 'Daralt'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md p-2 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                  } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={18} className={isCollapsed ? '' : 'mr-2.5'} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer Area (Optional) */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          OmniCore v1.0
        </div>
      )}
    </aside>
  );
}
