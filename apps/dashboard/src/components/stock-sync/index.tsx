'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle,
  Search, Layers, ArrowRightLeft, Wifi
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChannelStock {
  channelId: string;
  channelName: string;
  channelPlatform: string;
  stock: number;
  status: string;
  lastSync: string;
  diff: number;
}

interface StockSyncProduct {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  baseStock: number;
  price: number;
  category: string;
  channels: ChannelStock[];
  overallStatus: string;
}

interface Summary {
  totalProducts: number;
  synced: number;
  syncing: number;
  error: number;
  pending: number;
  totalChannels: number;
  lastFullSync: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  synced: { label: 'Senkron', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  syncing: { label: 'Senkronize Ediliyor', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
  error: { label: 'Hata', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  pending: { label: 'Bekliyor', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const PLATFORM_COLORS: Record<string, string> = {
  trendyol: '#f27a1a', // Trendyol orange
  hepsiburada: '#ff6000', // HB orange
  amazon: '#ff9900', // Amazon orange
  n11: '#5c3ebf', // n11 purple
  website: '#10b981',
};

const fmtNum = (n: number) => new Intl.NumberFormat('tr-TR').format(n);
const relTime = (d: string) => {
  if (!d) return 'Bilinmiyor';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  return `${Math.floor(s / 86400)} gün önce`;
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_DATA = {
  summary: {
    totalProducts: 1250,
    synced: 1180,
    syncing: 45,
    error: 15,
    pending: 10,
    totalChannels: 3,
    lastFullSync: new Date(Date.now() - 5 * 60000).toISOString()
  },
  channels: [
    { id: 'ch1', name: 'Trendyol Ana Mağaza', platform: 'trendyol' },
    { id: 'ch2', name: 'Hepsiburada', platform: 'hepsiburada' },
    { id: 'ch3', name: 'N11 Mağaza', platform: 'n11' }
  ],
  products: [
    {
      productId: 'p1',
      productName: 'Erkek Pamuklu Tişört - Beyaz M',
      sku: 'TS-BEY-M-001',
      barcode: '8691234567890',
      baseStock: 145,
      price: 299.90,
      category: 'Giyim > Tişört',
      overallStatus: 'synced',
      channels: [
        { channelId: 'ch1', channelName: 'Trendyol Ana Mağaza', channelPlatform: 'trendyol', stock: 145, status: 'synced', lastSync: new Date().toISOString(), diff: 0 },
        { channelId: 'ch2', channelName: 'Hepsiburada', channelPlatform: 'hepsiburada', stock: 145, status: 'synced', lastSync: new Date().toISOString(), diff: 0 },
        { channelId: 'ch3', channelName: 'N11 Mağaza', channelPlatform: 'n11', stock: 145, status: 'synced', lastSync: new Date().toISOString(), diff: 0 }
      ]
    },
    {
      productId: 'p2',
      productName: 'Kablosuz Kulak İçi Kulaklık Pro',
      sku: 'ELK-KUL-PRO',
      barcode: '8691234567891',
      baseStock: 12,
      price: 1499.00,
      category: 'Elektronik > Kulaklık',
      overallStatus: 'syncing',
      channels: [
        { channelId: 'ch1', channelName: 'Trendyol Ana Mağaza', channelPlatform: 'trendyol', stock: 15, status: 'syncing', lastSync: new Date(Date.now() - 300000).toISOString(), diff: -3 },
        { channelId: 'ch2', channelName: 'Hepsiburada', channelPlatform: 'hepsiburada', stock: 12, status: 'synced', lastSync: new Date().toISOString(), diff: 0 },
        { channelId: 'ch3', channelName: 'N11 Mağaza', channelPlatform: 'n11', stock: 12, status: 'synced', lastSync: new Date().toISOString(), diff: 0 }
      ]
    },
    {
      productId: 'p3',
      productName: 'Spor Ayakkabı Koşu Serisi - Siyah 42',
      sku: 'AYK-KOS-SYH-42',
      barcode: '8691234567892',
      baseStock: 0,
      price: 899.50,
      category: 'Spor > Ayakkabı',
      overallStatus: 'error',
      channels: [
        { channelId: 'ch1', channelName: 'Trendyol Ana Mağaza', channelPlatform: 'trendyol', stock: 0, status: 'synced', lastSync: new Date().toISOString(), diff: 0 },
        { channelId: 'ch2', channelName: 'Hepsiburada', channelPlatform: 'hepsiburada', stock: 3, status: 'error', lastSync: new Date(Date.now() - 3600000).toISOString(), diff: -3 },
        { channelId: 'ch3', channelName: 'N11 Mağaza', channelPlatform: 'n11', stock: 0, status: 'synced', lastSync: new Date().toISOString(), diff: 0 }
      ]
    }
  ]
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StockSync() {
  const [data, setData] = useState<{ products: StockSyncProduct[]; channels: { id: string; name: string; platform: string }[]; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncingAll(false);
  };

  const filteredProducts = (data?.products || []).filter(p => {
    if (search && !p.productName.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && p.overallStatus !== filterStatus) return false;
    if (filterChannel !== 'all' && !p.channels.some(c => c.channelPlatform === filterChannel)) return false;
    return true;
  });

  /* ---------- Loading skeleton ---------- */
  if (loading || !data) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-slate-200" />)}
          </div>
          <div className="h-96 rounded-md bg-slate-200" />
        </div>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            Stok Senkronizasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tüm kanallardaki stok durumunu gerçek zamanlı izleyin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Son sync: {relTime(summary.lastFullSync)}
          </div>
          <button 
            onClick={handleSyncAll} 
            disabled={syncingAll} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
            {syncingAll ? 'Senkronize Ediliyor...' : 'Tümünü Senkronize Et'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Toplam Ürün', value: fmtNum(summary.totalProducts), icon: Layers, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Senkron', value: fmtNum(summary.synced), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Senkronize Ediliyor', value: fmtNum(summary.syncing), icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Hatalı', value: fmtNum(summary.error), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Bekleyen', value: fmtNum(summary.pending), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
              </div>
              <div className={`p-2 rounded-md border ${s.bg}`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Progress */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-800">Genel Senkronizasyon İlerlemesi</span>
          </div>
          <span className="text-sm font-medium text-slate-500">{summary.synced} / {summary.totalProducts} ürün</span>
        </div>
        <div className="flex h-2.5 bg-slate-100 rounded-full overflow-hidden">
          {summary.totalProducts > 0 && [
            { pct: (summary.synced / summary.totalProducts) * 100, color: 'bg-emerald-500' },
            { pct: (summary.syncing / summary.totalProducts) * 100, color: 'bg-blue-500' },
            { pct: (summary.error / summary.totalProducts) * 100, color: 'bg-red-500' },
            { pct: (summary.pending / summary.totalProducts) * 100, color: 'bg-amber-400' },
          ].map((seg, i) => seg.pct > 0 ? (
            <div key={i} className={`h-full transition-all duration-500 ${seg.color}`} style={{ width: `${seg.pct}%` }} />
          ) : null)}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Senkron</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Devam Ediyor</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Hata</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Bekliyor</span>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Ürün adı veya SKU ara..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="w-[180px] px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="synced">Senkron</option>
            <option value="syncing">Devam Ediyor</option>
            <option value="error">Hatalı</option>
            <option value="pending">Bekliyor</option>
          </select>
          <select 
            value={filterChannel} 
            onChange={e => setFilterChannel(e.target.value)}
            className="w-[180px] px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
          >
            <option value="all">Tüm Kanallar</option>
            {data.channels.map(ch => (
              <option key={ch.platform} value={ch.platform}>{ch.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-3 px-4 font-medium text-slate-500 w-[300px]">Ürün</th>
                <th className="py-3 px-4 font-medium text-slate-500">SKU</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-center">Temel Stok</th>
                {data.channels.map(ch => (
                  <th key={ch.id} className="py-3 px-4 font-medium text-slate-500 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[ch.platform] || '#64748b' }} />
                      {ch.name}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 font-medium text-slate-500 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4 + data.channels.length} className="py-12 text-center text-slate-500">
                    Kriterlere uygun stok senkronizasyonu bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const sc = statusConfig[product.overallStatus] || statusConfig.pending;
                  const ScIcon = sc.icon;
                  return (
                    <tr key={product.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1" title={product.productName}>{product.productName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{product.sku}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-semibold text-xs ${
                          product.baseStock === 0 ? 'bg-red-50 text-red-700' :
                          product.baseStock <= 5 ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {product.baseStock}
                        </span>
                      </td>
                      {product.channels.map(ch => {
                        const diff = ch.diff;
                        return (
                          <td key={ch.channelId} className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md font-medium text-xs ${
                                ch.status === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                                ch.status === 'syncing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                ch.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}>
                                {ch.stock}
                              </span>
                              {diff !== 0 && (
                                <span className={`text-[10px] font-medium ${diff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${sc.bg} ${sc.color}`}>
                          <ScIcon className="h-3.5 w-3.5" />
                          {sc.label}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        {filteredProducts.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
            {filteredProducts.length} ürün gösteriliyor (toplam {data.products.length})
          </div>
        )}
      </div>
    </div>
  );
}
