'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Zap,
  Search, Layers, ArrowUpDown, Wifi, WifiOff, ArrowRightLeft,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChannelStock {
  channelId: string; channelName: string; channelPlatform: string;
  stock: number; status: string; lastSync: string; diff: number;
}

interface StockSyncProduct {
  productId: string; productName: string; sku: string; barcode: string;
  baseStock: number; price: number; category: string;
  channels: ChannelStock[]; overallStatus: string;
}

interface Summary {
  totalProducts: number; synced: number; syncing: number; error: number; pending: number;
  totalChannels: number; lastFullSync: string;
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
  trendyol: '#3b82f6', hepsiburada: '#f97316', amazon: '#f59e0b', n11: '#8b5cf6', website: '#10b981',
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('tr-TR').format(n);
const relTime = (d: string) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  return `${Math.floor(s / 86400)} gün önce`;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StockSync() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<{ products: StockSyncProduct[]; channels: { id: string; name: string; platform: string }[]; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    fetch('/api/stock-sync')
      .then(r => r.json())
      .then(d => setData(d && typeof d === 'object' && !Array.isArray(d) ? d : null))
      .finally(() => setLoading(false));
  }, []);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    await new Promise(r => setTimeout(r, 2500));
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
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-200" />)}</div>
          <div className="h-96 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            Stok Senkronizasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tüm kanallardaki stok durumunu gerçek zamanlı izleyin</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Son sync: {relTime(summary.lastFullSync)}
          </Badge>
          <Button onClick={handleSyncAll} disabled={syncingAll} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', syncingAll && 'animate-spin')} />
            {syncingAll ? 'Senkronize Ediliyor...' : 'Tümünü Senkronize Et'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Toplam Ürün', value: fmtNum(summary.totalProducts), icon: Layers, bg: 'bg-slate-500', lightBg: 'bg-slate-50', color: 'text-slate-600' },
          { label: 'Senkron', value: fmtNum(summary.synced), icon: CheckCircle, bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Senkronize Ediliyor', value: fmtNum(summary.syncing), icon: RefreshCw, bg: 'bg-blue-500', lightBg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Hatalı', value: fmtNum(summary.error), icon: XCircle, bg: 'bg-red-500', lightBg: 'bg-red-50', color: 'text-red-600' },
          { label: 'Bekleyen', value: fmtNum(summary.pending), icon: Clock, bg: 'bg-amber-500', lightBg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
                  </div>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', s.lightBg)}>
                    <Icon className={cn('h-5 w-5', s.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sync Progress */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">Genel Senkronizasyon İlerlemesi</span>
            </div>
            <span className="text-sm text-slate-500">{summary.synced}/{summary.totalProducts} ürün</span>
          </div>
          <div className="flex h-3 bg-slate-100 rounded-full overflow-hidden">
            {summary.totalProducts > 0 && [
              { pct: (summary.synced / summary.totalProducts) * 100, color: 'bg-emerald-500' },
              { pct: (summary.syncing / summary.totalProducts) * 100, color: 'bg-blue-500' },
              { pct: (summary.error / summary.totalProducts) * 100, color: 'bg-red-500' },
              { pct: (summary.pending / summary.totalProducts) * 100, color: 'bg-amber-400' },
            ].map((seg, i) => seg.pct > 0 ? (
              <div key={i} className={cn('h-full transition-all duration-500', seg.color)} style={{ width: `${seg.pct}%` }} />
            ) : null)}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Senkron</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Devam Ediyor</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Hata</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Bekliyor</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Ürün adı veya SKU ara..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Durum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="synced">Senkron</SelectItem>
                <SelectItem value="syncing">Devam Ediyor</SelectItem>
                <SelectItem value="error">Hatalı</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kanal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kanallar</SelectItem>
                {data.channels.map(ch => (
                  <SelectItem key={ch.platform} value={ch.platform}>{ch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Stock Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600 min-w-[200px]">Ürün</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">SKU</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Temel Stok</th>
                  {data.channels.map(ch => (
                    <th key={ch.id} className="text-center py-3 px-4 font-medium text-slate-600 min-w-[120px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[ch.platform] || '#64748b' }} />
                        {ch.name}
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan={4 + data.channels.length} className="py-12 text-center text-slate-400">Stok senkronizasyonu bulunamadı</td></tr>
                ) : (
                  filteredProducts.map(product => {
                    const sc = statusConfig[product.overallStatus] || statusConfig.pending;
                    const ScIcon = sc.icon;
                    return (
                      <tr key={product.productId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-800 truncate max-w-[200px]">{product.productName}</p>
                            <p className="text-xs text-slate-400">{product.category}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">{product.sku}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn('inline-flex items-center justify-center h-8 w-16 rounded-lg font-semibold text-sm',
                            product.baseStock === 0 ? 'bg-red-100 text-red-700' :
                            product.baseStock <= 5 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {product.baseStock}
                          </span>
                        </td>
                        {product.channels.map(ch => {
                          const diff = ch.diff;
                          return (
                            <td key={ch.channelId} className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn('inline-flex items-center justify-center h-7 w-14 rounded-md font-medium text-xs',
                                  ch.status === 'error' ? 'bg-red-100 text-red-700' :
                                  ch.status === 'syncing' ? 'bg-blue-100 text-blue-700' :
                                  ch.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                )}>
                                  {ch.stock}
                                </span>
                                {diff !== 0 && (
                                  <span className={cn('text-[10px] font-medium', diff > 0 ? 'text-emerald-600' : 'text-red-500')}>
                                    {diff > 0 ? '+' : ''}{diff}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-center">
                          <Badge className={cn('text-xs gap-1', sc.bg.replace('bg-', 'bg-'), sc.color.replace('text-', 'text-'))}>
                            <ScIcon className="h-3 w-3" />
                            {sc.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredProducts.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {filteredProducts.length} ürün gösteriliyor (toplam {data.products.length})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
