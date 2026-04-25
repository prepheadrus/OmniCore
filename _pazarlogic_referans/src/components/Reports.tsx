'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';

interface ReportData {
  totalOrders: number; totalProducts: number; totalRevenue: number; totalShipments: number;
  ordersByMarketplace: { marketplace: string; _count: { id: number } }[];
  ordersByStatus: { status: string; _count: { id: number } }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; category: string }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const statusLabels: Record<string, string> = { pending: 'Beklemede', processing: 'Hazirlaniyor', shipped: 'Kargoda', delivered: 'Teslim Edildi', cancelled: 'Iptal' };

export default function Reports() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/reports').then((r) => r.json()).then((d) => setData(d && typeof d === 'object' && !Array.isArray(d) ? d : null)).finally(() => setLoading(false)); }, []);

  if (loading || !data) return (<div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}><h1 className="mb-6 text-2xl font-bold text-slate-800">Raporlar</h1><div className="animate-pulse"><div className="h-10 w-48 bg-slate-200 rounded mb-4"/></div></div>);

  const marketData = data.ordersByMarketplace.map((m) => ({ name: m.marketplace, value: m._count.id }));
  const statusData = data.ordersByStatus.map((s) => ({ name: statusLabels[s.status] || s.status, value: s._count.id }));
  const maxMarket = Math.max(...marketData.map((d) => d.value), 1);
  const totalStatus = statusData.reduce((a, b) => a + b.value, 0);

  return (
    <div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Raporlar & Analiz</h1><p className="text-sm text-slate-500">Detayli is zekasi raporlari</p></div>
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Genel Bakis</TabsTrigger>
          <TabsTrigger value="sales">Satis Analizi</TabsTrigger>
          <TabsTrigger value="stock">Stok Raporu</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Siparis</p><p className="text-2xl font-bold text-slate-900 mt-1">{data.totalOrders}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500"><BarChart3 className="h-5 w-5 text-white"/></div></div></CardContent></Card>
            <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Toplam Urun</p><p className="text-2xl font-bold text-slate-900 mt-1">{data.totalProducts}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500"><Package className="h-5 w-5 text-white"/></div></div></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Toplam Gelir</p><p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.totalRevenue)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Toplam Kargo</p><p className="text-2xl font-bold text-slate-900 mt-1">{data.totalShipments}</p></CardContent></Card>
          </div>
          <Card><CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Pazaryerine Gore Siparisler</CardTitle></CardHeader><CardContent><div className="space-y-3">{marketData.map((d, i) => (<div key={d.name} className="flex items-center gap-3"><span className="text-sm text-slate-600 w-28 truncate">{d.name}</span><div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(d.value / maxMarket) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}/></div><span className="text-sm font-semibold w-10 text-right">{d.value}</span></div>))}</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="sales">
          <Card className="mb-6"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Siparis Durumu Dagilimi</CardTitle></CardHeader><CardContent><div className="space-y-4">{statusData.map((d, i) => (<div key={d.name} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}/><span className="text-sm text-slate-700">{d.name}</span></div><div className="flex items-center gap-3"><span className="text-sm font-bold">{d.value}</span><span className="text-xs text-slate-400">{totalStatus > 0 ? ((d.value / totalStatus) * 100).toFixed(1) : 0}%</span></div></div>))}</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="stock">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Dusuk Stok</p><p className="text-2xl font-bold text-amber-600 mt-1">{data.lowStockProducts.filter((p)=>p.stock>0).length}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Kritik (5 ve alti)</p><p className="text-2xl font-bold text-red-600 mt-1">{data.lowStockProducts.filter((p)=>p.stock<=5).length}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Toplam Urun</p><p className="text-2xl font-bold text-slate-900 mt-1">{data.totalProducts}</p></CardContent></Card>
          </div>
          <Card><CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500"/>Dusuk Stoklu Urunler</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200"><th className="text-left py-2 font-medium text-slate-600">Urun</th><th className="text-left py-2 font-medium text-slate-600">SKU</th><th className="text-left py-2 font-medium text-slate-600">Kategori</th><th className="text-right py-2 font-medium text-slate-600">Stok</th></tr></thead><tbody>{data.lowStockProducts.map((p)=>(<tr key={p.id} className="border-b border-slate-100"><td className="py-2 text-slate-800">{p.name}</td><td className="py-2 text-slate-500">{p.sku}</td><td className="py-2"><Badge variant="outline" className="text-xs">{p.category}</Badge></td><td className="py-2 text-right"><Badge className={p.stock<=5?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}>{p.stock}</Badge></td></tr>))}</tbody></table></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
