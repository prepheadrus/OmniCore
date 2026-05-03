'use client';

import {
  LayoutDashboard, ShoppingCart, Package, DollarSign, FileText,
  Truck, Warehouse, BarChart3, Globe, Cog, Webhook,
  ChevronLeft, ChevronRight, Users, RotateCcw, Bot, PackageOpen, Megaphone, ScrollText,
  Rss, Target, ArrowRightLeft, TrendingUp, Sparkles, GitBranch,
  FileCode, Cpu, Shield, Brain, Search, MessageCircle,
  Banknote, PackageCheck, Activity, Percent, Mail, Split, PackageSearch,
  Share2, ScanBarcode, Layers, Trophy, Building2, Zap, Waypoints, Award,
  PenTool, ShieldAlert, BellRing, CalendarDays, Landmark, Calculator, Receipt,
  MessageCircleQuestion, ShieldCheck, Crosshair, Wallet, MessageSquareHeart, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore, type PageKey } from '@/store/useAppStore';

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const navGroups = [
  {
    name: 'ANA MENÜ',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { key: 'orders', label: 'Siparişler (OMS)', icon: <ShoppingCart className="h-5 w-5" /> },
      { key: 'products', label: 'Ürün & Stok', icon: <Package className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'FEED & FİYAT',
    items: [
      { key: 'feeds', label: 'Ürün Feed Yönetimi', icon: <Rss className="h-5 w-5" /> },
      { key: 'feed-templates', label: 'Feed Şablonları', icon: <FileCode className="h-5 w-5" /> },
      { key: 'feed-optimizer', label: 'Feed Optimizasyonu', icon: <Shield className="h-5 w-5" /> },
      { key: 'smart-pricing', label: 'Akıllı Fiyatlandırma', icon: <Target className="h-5 w-5" /> },
      { key: 'stock-sync', label: 'Stok Senkronizasyonu', icon: <ArrowRightLeft className="h-5 w-5" /> },
      { key: 'roi-profit', label: 'ROI & Kar Analizi', icon: <TrendingUp className="h-5 w-5" /> },
      { key: 'commission-tracker', label: 'Komisyon & Masraf Takibi', icon: <Receipt className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'İŞLEMLER',
    items: [
      { key: 'fulfillment', label: 'Sipariş Karşılama', icon: <GitBranch className="h-5 w-5" /> },
      { key: 'shipments', label: 'Kargo & Lojistik', icon: <Truck className="h-5 w-5" /> },
      { key: 'returns', label: 'İade Yönetimi', icon: <RotateCcw className="h-5 w-5" /> },
      { key: 'warehouse', label: 'Depo (WMS)', icon: <Warehouse className="h-5 w-5" /> },
      { key: 'barcode-scanner', label: 'Barkod Tarayıcı', icon: <ScanBarcode className="h-5 w-5" /> },
      { key: 'bulk-operations', label: 'Toplu Ürün İşlemleri', icon: <Layers className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'PAZARYERİ',
    items: [
      { key: 'content-rules', label: 'İçerik Optimizasyonu', icon: <Sparkles className="h-5 w-5" /> },
      { key: 'data-automation', label: 'Veri Otomasyonu', icon: <Cpu className="h-5 w-5" /> },
      { key: 'automation', label: 'Otomasyonlar', icon: <Bot className="h-5 w-5" /> },
      { key: 'campaigns', label: 'Kampanyalar', icon: <Megaphone className="h-5 w-5" /> },
      { key: 'pricing', label: 'Fiyat Yönetimi', icon: <DollarSign className="h-5 w-5" /> },
      { key: 'listing-quality', label: 'Listeleme Kalitesi', icon: <PackageCheck className="h-5 w-5" /> },
      { key: 'ab-testing', label: 'A/B Test', icon: <Split className="h-5 w-5" /> },
      { key: 'carrier-rates', label: 'Kargo Karşılaştırma', icon: <Truck className="h-5 w-5" /> },
      { key: 'buy-box', label: 'Buy Box Optimizasyonu', icon: <Trophy className="h-5 w-5" /> },
      { key: 'dynamic-repricer', label: 'Dinamik Repricer', icon: <Zap className="h-5 w-5" /> },
      { key: 'smart-order-rules', label: 'Akıllı Sipariş Kuralları', icon: <Waypoints className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'YÖNETİM',
    items: [
      { key: 'customers', label: 'Müşteriler (CRM)', icon: <Users className="h-5 w-5" /> },
      { key: 'suppliers', label: 'Tedarikçiler', icon: <PackageOpen className="h-5 w-5" /> },
      { key: 'invoices', label: 'E-Fatura', icon: <FileText className="h-5 w-5" /> },
      { key: 'purchase-orders', label: 'Satınalma Siparişleri', icon: <ShoppingCart className="h-5 w-5" /> },
      { key: 'dropshipping', label: 'Dropshipping', icon: <PackageSearch className="h-5 w-5" /> },
      { key: 'multi-currency', label: 'Çoklu Döviz', icon: <Banknote className="h-5 w-5" /> },
      { key: 'inventory-forecast', label: 'Envanter Tahmin', icon: <Activity className="h-5 w-5" /> },
      { key: 'email-campaigns', label: 'E-posta Kampanyaları', icon: <Mail className="h-5 w-5" /> },
      { key: 'micro-export', label: 'Mikro İhracat', icon: <Globe className="h-5 w-5" /> },
      { key: 'b2b-management', label: 'B2B / Toptan', icon: <Building2 className="h-5 w-5" /> },
      { key: 'bundle-management', label: 'Paket / Combo', icon: <Layers className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'YAPAY ZEKA',
    items: [
      { key: 'ai-seo', label: 'AI SEO Motoru', icon: <Brain className="h-5 w-5" /> },
      { key: 'ai-content', label: 'AI İçerik Stüdyosu', icon: <PenTool className="h-5 w-5" /> },
      { key: 'advertising', label: 'Reklam Yönetimi', icon: <Megaphone className="h-5 w-5" /> },
      { key: 'competitor-prices', label: 'Rakip Fiyat Analizi', icon: <Search className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'DESTEK',
    items: [
      { key: 'live-chat', label: 'Canlı Destek Chat', icon: <MessageCircle className="h-5 w-5" /> },
      { key: 'customer-questions', label: 'Müşteri Soruları', icon: <MessageCircleQuestion className="h-5 w-5" /> },
      { key: 'review-analysis', label: 'Yorum & Değerlendirme', icon: <MessageSquareHeart className="h-5 w-5" /> },
      { key: 'sales-trends', label: 'Satış Trend Analizi', icon: <Zap className="h-5 w-5" /> },
      { key: 'smart-alerts', label: 'Akıllı Bildirimler', icon: <BellRing className="h-5 w-5" /> },
      { key: 'brand-protection', label: 'Marka Koruma & MAP', icon: <ShieldAlert className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'SOSYAL TİCARET',
    items: [
      { key: 'social-commerce', label: 'Sosyal Ticaret', icon: <Share2 className="h-5 w-5" /> },
      { key: 'performance-scorecard', label: 'Performans Skoru', icon: <Award className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'PLANLAMA',
    items: [
      { key: 'product-launches', label: 'Lansman Takvimi', icon: <CalendarDays className="h-5 w-5" /> },
      { key: 'tax-compliance', label: 'Vergi & Gümrük', icon: <Landmark className="h-5 w-5" /> },
      { key: 'profit-simulator', label: 'Kar Simülatörü', icon: <Calculator className="h-5 w-5" /> },
      { key: 'opportunity-finder', label: 'Fırsat Bulucu', icon: <Crosshair className="h-5 w-5" /> },
      { key: 'cash-flow', label: 'Nakit Akış', icon: <Wallet className="h-5 w-5" /> },
    ] as NavItem[],
  },
  {
    name: 'SİSTEM',
    items: [
      { key: 'reports', label: 'Raporlar', icon: <BarChart3 className="h-5 w-5" /> },
      { key: 'price-monitor', label: 'Akakçe & Rakip İzleme', icon: <Eye className="h-5 w-5" /> },
      { key: 'kvkk-compliance', label: 'KVKK & Veri Yönetimi', icon: <ShieldCheck className="h-5 w-5" /> },
      { key: 'audit', label: 'Log & İzleme', icon: <ScrollText className="h-5 w-5" /> },
      { key: 'settings', label: 'Entegrasyonlar', icon: <Cog className="h-5 w-5" /> },
      { key: 'webhooks', label: 'API & Webhook', icon: <Webhook className="h-5 w-5" /> },
    ] as NavItem[],
  },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700/50">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <span className="text-sm font-black text-white">P</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">PazarLogic</span>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg mx-auto" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <span className="text-sm font-black text-white">P</span>
          </div>
        )}
      </div>

      <nav className="mt-2 flex flex-col gap-0.5 px-2 overflow-y-auto" style={{ height: 'calc(100vh - 4.5rem)' }}>
        {navGroups.map((group) => (
          <div key={group.name} className="mb-1">
            {sidebarOpen && (
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group.name}</span>
              </div>
            )}
            {group.items.map((item) => {
              const isActive = currentPage === item.key;
              const btn = (
                <Button
                  key={item.key}
                  variant="ghost"
                  onClick={() => setCurrentPage(item.key)}
                  className={`w-full justify-start gap-3 h-9 font-medium transition-all ${
                    sidebarOpen ? 'px-3' : 'px-0 justify-center'
                  } ${isActive ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="text-[13px] truncate">{item.label}</span>}
                  {isActive && sidebarOpen && <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />}
                </Button>
              );
              if (!sidebarOpen) {
                return (
                  <Tooltip key={item.key} delayDuration={0}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return btn;
            })}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50">
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
