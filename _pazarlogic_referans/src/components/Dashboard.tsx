'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  ShoppingCart, DollarSign, Package, Plug, Rss,
  ArrowUpRight, AlertTriangle, Clock, Activity,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardData {
  orders: { total: number; pending: number; processing: number; shipped: number; delivered: number; cancelled: number; today: number };
  revenue: { total: number; today: number; averageOrderValue: number; monthlyTrend: { month: string; revenue: number }[] };
  products: { total: number; lowStock: number; outOfStock: number; totalCategories: number };
  marketplace: { ordersPerMarketplace: { marketplace: string; orders: number; revenue: number }[] };
  integrations: { connected: number; disconnected: number };
  feeds: { total: number; active: number; lastImport: string | null };
  recentActivity: { id: string; action: string; entity: string; details: string; createdAt: string }[];
}

interface LowStockProduct { id: string; name: string; sku: string; stock: number; category: string }

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MARKETPLACE_COLORS: Record<string, string> = {
  trendyol: '#3b82f6', hepsiburada: '#f97316', 'amazon tr': '#f59e0b', n11: '#8b5cf6',
};

const STATUS_CFG: Record<string, { label: string; bar: string; text: string }> = {
  pending:    { label: 'Beklemede',     bar: 'bg-slate-300',   text: 'text-slate-700' },
  processing: { label: 'Hazırlanıyor',   bar: 'bg-blue-400',    text: 'text-blue-700' },
  shipped:    { label: 'Kargoda',        bar: 'bg-amber-400',   text: 'text-amber-700' },
  delivered:  { label: 'Teslim Edildi',  bar: 'bg-emerald-500', text: 'text-emerald-700' },
  cancelled:  { label: 'İptal',          bar: 'bg-red-400',     text: 'text-red-700' },
};

const ACTION_COLORS: [RegExp, string][] = [
  [/giriş/i,   'bg-blue-100 text-blue-700'],
  [/create|oluştur/i, 'bg-green-100 text-green-700'],
  [/update|güncelle/i, 'bg-amber-100 text-amber-700'],
  [/delete|sil/i,      'bg-red-100 text-red-700'],
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const mpColor = (name: string) => {
  const l = name.toLowerCase();
  for (const [k, c] of Object.entries(MARKETPLACE_COLORS)) if (l.includes(k)) return c;
  return '#64748b';
};

const actionBadge = (a: string) => ACTION_COLORS.find(([r]) => r.test(a))?.[1] ?? 'bg-slate-100 text-slate-700';

const stockBadge = (s: number) =>
  s === 0 ? 'bg-red-100 text-red-700 border-red-200' : s <= 5 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200';

const relTime = (d: string) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'Az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  if (s < 604800) return `${Math.floor(s / 86400)} gün önce`;
  return new Date(d).toLocaleDateString('tr-TR');
};

function Skel({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([dash, prods]) => {
        setData(dash && typeof dash === 'object' && !Array.isArray(dash) ? dash : null);
        setLowStock(
          (Array.isArray(prods) ? prods : [])
            .filter((p: LowStockProduct) => p.stock <= 10)
            .sort((a: LowStockProduct, b: LowStockProduct) => a.stock - b.stock),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Loading skeleton ---------- */
  if (loading || !data) {
    return (
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <div className="mb-6"><Skel className="h-8 w-52 mb-2" /><Skel className="h-4 w-72" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skel className="h-4 w-24 mb-3" /><Skel className="h-7 w-28 mb-2" /><Skel className="h-3 w-20" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((k) => (
            <Card key={k}><CardHeader className="pb-3"><Skel className="h-5 w-52" /></CardHeader>
              <CardContent className="space-y-4">{Array.from({ length: 5 }).map((_, j) => <div key={j} className="flex items-center gap-3"><Skel className="h-4 w-24" /><Skel className="flex-1 h-6" /><Skel className="h-4 w-10" /></div>)}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Derived data ---------- */
  const kpis = [
    { title: 'Toplam Siparişler', value: data.orders.total.toLocaleString('tr-TR'), icon: <ShoppingCart className="h-5 w-5 text-white" />, bg: 'bg-blue-500', trend: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />, sub: `${data.orders.today} bugün` },
    { title: 'Toplam Gelir', value: fmt(data.revenue.total), icon: <DollarSign className="h-5 w-5 text-white" />, bg: 'bg-emerald-500', trend: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />, sub: `₺${data.revenue.today.toLocaleString('tr-TR')} bugün` },
    { title: 'Bugün Sipariş', value: String(data.orders.today), icon: <Activity className="h-5 w-5 text-white" />, bg: 'bg-violet-500', trend: null, sub: `₺${data.revenue.today.toLocaleString('tr-TR')} gelir` },
    { title: 'Aktif Ürünler', value: String(data.products.total), icon: <Package className="h-5 w-5 text-white" />, bg: 'bg-amber-500', trend: data.products.lowStock > 0 ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> : null, sub: data.products.lowStock > 0 ? `${data.products.lowStock} düşük stok` : 'Stok yeterli' },
    { title: 'Bağlı Entegrasyonlar', value: String(data.integrations.connected), icon: <Plug className="h-5 w-5 text-white" />, bg: 'bg-teal-500', trend: null, sub: `${data.integrations.disconnected} bağlı değil` },
    { title: "Aktif Feed'ler", value: `${data.feeds.active}/${data.feeds.total}`, icon: <Rss className="h-5 w-5 text-white" />, bg: 'bg-indigo-500', trend: null, sub: data.feeds.lastImport ? `Son: ${relTime(data.feeds.lastImport)}` : 'Henüz import yok' },
  ];

  const mp = data.marketplace.ordersPerMarketplace;
  const maxOrders = Math.max(...mp.map((m) => m.orders), 1);

  const statuses = [
    { key: 'pending', n: data.orders.pending }, { key: 'processing', n: data.orders.processing },
    { key: 'shipped', n: data.orders.shipped }, { key: 'delivered', n: data.orders.delivered },
    { key: 'cancelled', n: data.orders.cancelled },
  ];
  const total = data.orders.total || 1;

  /* ---------- Render ---------- */
  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gösterge Paneli</h1>
          <p className="text-sm text-slate-500 mt-0.5">PazarLogic — tüm entegrasyonlarınızın genel görünümü</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-3 py-1">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Canlı
        </Badge>
      </div>

      {/* Row 1 — KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpis.map((k, i) => (
          <Card key={i} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{k.title}</p>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110', k.bg)}>{k.icon}</div>
              </div>
              <p className="text-xl font-bold text-slate-900 truncate">{k.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {k.trend}
                <span className="text-xs text-slate-500">{k.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Marketplace horizontal bar chart */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Pazaryerine Göre Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            {mp.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">Henüz sipariş bulunmuyor</p>
            ) : (
              <div className="space-y-4">
                {mp.map((m) => {
                  const color = mpColor(m.marketplace);
                  return (
                    <div key={m.marketplace}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{m.marketplace}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{fmt(m.revenue)}</span>
                          <Badge variant="secondary" className="text-xs font-semibold h-5 px-1.5" style={{ backgroundColor: `${color}15`, color }}>{m.orders}</Badge>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(m.orders / maxOrders) * 100}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Sipariş Durumu Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statuses.map(({ key, n }) => {
                const c = STATUS_CFG[key];
                const pct = total > 0 ? (n / total) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3 py-1">
                    <span className="w-28 shrink-0 text-sm font-medium text-slate-700">{c.label}</span>
                    <div className="flex-1 h-7 bg-slate-50 rounded-md overflow-hidden relative">
                      <div className={cn('h-full rounded-md transition-all duration-700 ease-out', c.bar)} style={{ width: `${Math.max(pct, 2)}%` }}>
                        <span className={cn('absolute inset-0 flex items-center justify-end pr-2 text-xs font-semibold', pct > 15 ? c.text : 'text-slate-500')}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-xs font-semibold min-w-[2.25rem] justify-center h-6', c.text)}>{n}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Low stock & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Low stock warnings */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Düşük Stok Uyarıları
              {lowStock.length > 0 && <Badge variant="secondary" className="bg-red-50 text-red-600 ml-auto">{lowStock.length} ürün</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">Tüm ürünlerde yeterli stok mevcut</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">Ürün Adı</th>
                      <th className="text-left py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">SKU</th>
                      <th className="text-left py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                      <th className="text-right py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.slice(0, 8).map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 text-slate-800 font-medium max-w-[160px] truncate">{p.name}</td>
                        <td className="py-2.5 px-2 text-slate-500 font-mono text-xs">{p.sku}</td>
                        <td className="py-2.5 px-2 hidden sm:table-cell"><Badge variant="outline" className="text-xs font-normal">{p.category}</Badge></td>
                        <td className="py-2.5 px-2 text-right">
                          <Badge variant="outline" className={cn('text-xs font-semibold', stockBadge(p.stock))}>
                            {p.stock === 0 ? 'Tükendi' : p.stock}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">Henüz aktivite bulunmuyor</p>
            ) : (
              <div className="space-y-0.5">
                {data.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="mt-0.5 shrink-0">
                      <Badge variant="outline" className={cn('text-[10px] font-medium px-1.5 py-0 h-5 capitalize', actionBadge(log.action))}>{log.action}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{log.details || `${log.action} — ${log.entity}`}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{relTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
