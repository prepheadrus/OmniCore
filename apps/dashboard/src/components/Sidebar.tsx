'use client';

import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Undo,
  Package,
  Users,
  Truck,
  FileText,
  Tags,
  RefreshCcw,
  Settings,
  HelpCircle,
  LogOut,
  Layers,
  Rss,
  Wand2,
  ArrowRightLeft,
  TrendingUp,
  PackageCheck,
  Building2,
  ScanBarcode,
  Bot,
  Megaphone,
  Star,
  FlaskConical,
  Scale,
  Brain,
  MessageCircle,
  Activity,
  ArrowRightLeft as AdvancedRma,
  Crosshair,
  GitPullRequest,
  ShoppingCart as AutoProc,
  Printer
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
        { name: 'Raporlar', icon: FileText, href: '/reports' },
      ],
    },
    {
      title: 'OPERASYON',
      items: [
        { name: 'Siparişler', icon: ShoppingCart, href: '/orders' },
        { name: 'Akıllı Yönlendirme', icon: GitPullRequest, href: '/order-routing' },
        { name: 'Gelişmiş İade (RMA)', icon: AdvancedRma, href: '/advanced-rma' },
        { name: 'Etiket Şablonları', icon: Printer, href: '/template-designer' },
        { name: 'Sipariş Karşılama', icon: PackageCheck, href: '/fulfillment-pipeline' },
        { name: 'Kargo & Lojistik', icon: Truck, href: '/shipments' },
        { name: 'İadeler', icon: Undo, href: '/returns' },
        { name: 'Ürünler', icon: Package, href: '/products' },
        { name: 'Envanter', icon: Package, href: '/inventory' },
        { name: 'Depo Yönetimi (WMS)', icon: Building2, href: '/warehouse-management' },
        { name: 'Barkod Okuma (WMS)', icon: ScanBarcode, href: '/barcode-scanner' },
        { name: 'Katalog & Feed', icon: Rss, href: '/feeds' },
        { name: 'Stok Senkronizasyonu', icon: ArrowRightLeft, href: '/stock-sync' },
        { name: 'Müşteriler', icon: Users, href: '/customers' },
        { name: 'Müşteri Soruları', icon: HelpCircle, href: '/customers/questions' },
        { name: 'Canlı Destek', icon: MessageCircle, href: '/customers/chat' },
      ],
    },
    {
      title: 'EKONOMİ',
      items: [
        { name: 'Tedarikçiler', icon: Truck, href: '/procurement/suppliers' },
        { name: 'Otonom Satınalma', icon: AutoProc, href: '/auto-procurement' },
        { name: 'Satınalma Siparişleri', icon: FileText, href: '/procurement/purchase-orders' },
        { name: 'Alım Faturaları', icon: FileText, href: '/procurement/invoices' },
        { name: 'Akıllı Fiyatlandırma', icon: Tags, href: '/pricing' },
        { name: 'Kargo Karşılaştırma', icon: Scale, href: '/carrier-rates' },
        { name: 'Pazarlama & Reklam', icon: Megaphone, href: '/campaigns' },
        { name: 'Finansal Zeka', icon: TrendingUp, href: '/roi-profit' },
      ],
    },
    {
      title: 'ZEKA & SİSTEM',
      items: [
        { name: 'Otomasyon Merkezi', icon: Bot, href: '/automation' },
        { name: 'Pazar Yeri Sağlığı', icon: Activity, href: '/marketplace-health' },
        { name: 'Öneri Motoru', icon: Crosshair, href: '/recommendations' },
        { name: 'A/B Test', icon: FlaskConical, href: '/ab-testing' },
        { name: 'AI İçerik Stüdyosu', icon: Wand2, href: '/ai-content' },
        { name: 'AI SEO Motoru', icon: Brain, href: '/ai-seo' },
        { name: 'Listeleme Kalitesi', icon: Star, href: '/listing-quality' },
        { name: 'Senkronizasyon', icon: RefreshCcw, href: '/sync' },
        { name: 'Log & İzleme', icon: FileText, href: '/audit' },
        { name: 'Marka Koruma & MAP', icon: ShieldAlert, href: '/brand-protection' },
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
                    className={`flex items-center space-x-3 px-3 py-1.5 rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'bg-white text-[#2d3435] shadow-sm ring-1 ring-black/5'
                        : 'text-[#5a6061] hover:bg-[#e8ecec] hover:text-[#2d3435]'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-[#2d3435]' : 'text-[#848d8f]'}
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="pt-4 mt-auto border-t border-[#dde4e5] space-y-0.5">
        <Link
          href="/settings"
          className={`flex items-center space-x-3 px-3 py-1.5 rounded-md transition-colors duration-150 ${
            pathname === '/settings'
              ? 'bg-white text-[#2d3435] shadow-sm ring-1 ring-black/5'
              : 'text-[#5a6061] hover:bg-[#e8ecec] hover:text-[#2d3435]'
          }`}
        >
          <Settings size={16} className="text-[#848d8f]" />
          <span className="font-medium">Ayarlar</span>
        </Link>
        <button className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-md text-[#5a6061] hover:bg-[#fcecec] hover:text-[#e03131] transition-colors duration-150">
          <LogOut size={16} className="text-[#848d8f]" />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
