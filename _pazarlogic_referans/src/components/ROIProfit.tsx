'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  TrendingUp, TrendingDown, DollarSign, Target, BarChart3, ArrowUpRight,
  ArrowDownRight, Minus, PieChart, Percent, ShoppingCart, Package,
  Download, FileSpreadsheet, Printer, RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChannelROI {
  channel: string; channelName: string; revenue: number; cost: number;
  commission: number; cargo: number; netProfit: number; roi: number;
  margin: number; avgOrderValue: number; costPerOrder: number;
  commissionRate: number; orders: number; tax: number; discount: number;
}

interface ProductROI {
  productId: string; productName: string; sku: string; channel: string;
  channelName: string; category: string; revenue: number; cost: number;
  commission: number; cargoCost: number; netProfit: number; roi: number; margin: number;
}

interface MonthlyData {
  month: string; revenue: number; cost: number; commission: number;
  cargo: number; netProfit: number; orders: number;
}

interface Summary {
  totalRevenue: number; totalCost: number; totalCommission: number;
  totalCargo: number; totalNetProfit: number; totalROI: number;
  totalOrders: number; avgOrderValue: number;
  bestChannel: ChannelROI | null; worstChannel: ChannelROI | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

const CHANNEL_COLORS: Record<string, string> = {
  trendyol: '#3b82f6', hepsiburada: '#f97316', 'amazon tr': '#f59e0b', n11: '#8b5cf6',
};

function roiColor(roi: number) { return roi > 40 ? 'text-emerald-600' : roi > 20 ? 'text-blue-600' : roi > 0 ? 'text-amber-600' : 'text-red-600'; }
function roiBadge(roi: number) { return roi > 40 ? 'bg-emerald-100 text-emerald-700' : roi > 20 ? 'bg-blue-100 text-blue-700' : roi > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'; }

function exportToCSV(data: ChannelROI[] | ProductROI[] | MonthlyData[], filename: string, type: string) {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];
  if (type === 'channel') {
    headers = ['Kanal', 'Gelir', 'Maliyet', 'Komisyon', 'Net Kar', 'ROI %'];
    rows = (data as ChannelROI[]).map(c => [c.channelName, c.revenue, c.cost, c.commission, c.netProfit, c.roi]);
  } else if (type === 'product') {
    headers = ['Urun', 'Kanal', 'Net Kar', 'ROI'];
    rows = (data as ProductROI[]).map(p => [p.productName, p.channelName, p.netProfit, p.roi]);
  } else {
    headers = ['Ay', 'Gelir', 'Maliyet', 'Komisyon', 'Net Kar', 'Siparis'];
    rows = (data as MonthlyData[]).map(m => [m.month, m.revenue, m.cost, m.commission, m.netProfit, m.orders]);
  }
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ROIProfit() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<{ summary: Summary; channelROI: ChannelROI[]; productROI: ProductROI[]; monthlyData: MonthlyData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('channels');

  useEffect(() => {
    fetch('/api/roi').then(r => r.json()).then(d => setData(d && typeof d === 'object' && !Array.isArray(d) ? d : null)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-200" />)}</div>
          <div className="h-80 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const { summary, channelROI, productROI, monthlyData } = data;

  const bestProducts = [...productROI].sort((a, b) => b.roi - a.roi).slice(0, 10);
  const worstProducts = [...productROI].sort((a, b) => a.roi - b.roi).slice(0, 10);
  const maxRevenue = Math.max(...channelROI.map(c => c.revenue), 1);
  const maxProfit = Math.max(...monthlyData.map(m => Math.abs(m.netProfit)), 1);

  const handleExport = () => {
    if (activeTab === 'channels') exportToCSV(channelROI, 'roi-kanal.csv', 'channel');
    else if (activeTab === 'products') exportToCSV(productROI, 'roi-urun.csv', 'product');
    else exportToCSV(monthlyData, 'roi-aylik.csv', 'monthly');
  };

  const handleExcel = () => {
    if (activeTab === 'channels') exportToCSV(channelROI, 'roi-kanal.xlsx', 'channel');
    else if (activeTab === 'products') exportToCSV(productROI, 'roi-urun.xlsx', 'product');
    else exportToCSV(monthlyData, 'roi-aylik.xlsx', 'monthly');
  };

  const handleRefresh = () => {
    setLoading(true);
    fetch('/api/roi').then(r => r.json()).then(d => setData(d && typeof d === 'object' && !Array.isArray(d) ? d : null)).finally(() => setLoading(false));
  };

  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            ROI &amp; Kar Analizi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kanal ve urun bazli karlilik analizi</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button size="sm" variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" onClick={handleRefresh}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Toplam Gelir</p><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50"><DollarSign className="h-4 w-4 text-blue-600" /></div></div>
          <p className="text-xl font-bold text-slate-900">{fmt(summary.totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">{fmtNum(summary.totalOrders)} siparis</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Net Kar</p><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50"><TrendingUp className="h-4 w-4 text-emerald-600" /></div></div>
          <p className={cn('text-xl font-bold', summary.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(summary.totalNetProfit)}</p>
          <p className="text-xs text-slate-400 mt-1">Komisyon: {fmt(summary.totalCommission)}</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Genel ROI</p><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50"><Percent className="h-4 w-4 text-violet-600" /></div></div>
          <p className={cn('text-xl font-bold', roiColor(summary.totalROI))}>{summary.totalROI.toFixed(1)}%</p>
          <Progress value={Math.min(summary.totalROI, 100)} className="mt-2 h-1.5" />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Ort. Siparis Degeri</p><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50"><ShoppingCart className="h-4 w-4 text-amber-600" /></div></div>
          <p className="text-xl font-bold text-slate-900">{fmt(summary.avgOrderValue)}</p>
          <p className="text-xs text-slate-400 mt-1">Kargo: {fmt(summary.totalCargo)}</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="channels" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white shadow-sm border">
          <TabsTrigger value="channels" className="gap-2"><PieChart className="h-4 w-4" />Kanal Analizi</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" />Urun Karliligi</TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2"><BarChart3 className="h-4 w-4" />Aylık Trend</TabsTrigger>
        </TabsList>

        {/* Tab 1: Channel Analysis */}
        <TabsContent value="channels">
          <div className="space-y-6">
            <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Kanal Bazli Gelir Karsilastirmasi</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelROI.map(ch => {
                    const color = CHANNEL_COLORS[ch.channel] || '#64748b';
                    return (
                      <div key={ch.channel} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} /><span className="text-sm font-medium text-slate-700">{ch.channelName}</span><Badge variant="outline" className="text-xs">{ch.orders} siparis</Badge></div>
                          <div className="flex items-center gap-3"><span className="text-xs text-slate-400">Gelir: {fmt(ch.revenue)}</span><span className="text-xs text-slate-400">Komisyon: {fmt(ch.commission)} ({(ch.commissionRate * 100).toFixed(0)}%)</span><Badge className={cn('text-xs', roiBadge(ch.roi))}>ROI %{ch.roi}</Badge></div>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="h-full rounded-l-full bg-emerald-500 transition-all duration-500" style={{ width: `${(ch.netProfit / ch.revenue) * 100}%` }} title={`Net Kar: ${fmt(ch.netProfit)}`} />
                          <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(ch.cost / ch.revenue) * 100}%` }} title={`Maliyet: ${fmt(ch.cost)}`} />
                          <div className="h-full bg-red-300 transition-all duration-500" style={{ width: `${(ch.commission / ch.revenue) * 100}%` }} title={`Komisyon: ${fmt(ch.commission)}`} />
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-400"><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-500" /> Net Kar</span><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-amber-400" /> Maliyet</span><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-red-300" /> Komisyon</span></div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Detayli Kanal Raporu</CardTitle></CardHeader>
              <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 font-medium text-slate-600">Kanal</th><th className="text-right py-3 px-4 font-medium text-slate-600">Gelir</th><th className="text-right py-3 px-4 font-medium text-slate-600">Maliyet</th><th className="text-right py-3 px-4 font-medium text-slate-600">Komisyon</th><th className="text-right py-3 px-4 font-medium text-slate-600">Kargo</th><th className="text-right py-3 px-4 font-medium text-slate-600">Net Kar</th><th className="text-right py-3 px-4 font-medium text-slate-600">ROI %</th><th className="text-right py-3 px-4 font-medium text-slate-600">Marj %</th></tr></thead><tbody>{channelROI.map(ch => (<tr key={ch.channel} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{ch.channelName}</td><td className="py-3 px-4 text-right">{fmt(ch.revenue)}</td><td className="py-3 px-4 text-right text-slate-500">{fmt(ch.cost)}</td><td className="py-3 px-4 text-right text-red-500">-{fmt(ch.commission)}</td><td className="py-3 px-4 text-right text-red-500">-{fmt(ch.cargo)}</td><td className={cn('py-3 px-4 text-right font-semibold', ch.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(ch.netProfit)}</td><td className={cn('py-3 px-4 text-right font-semibold', roiColor(ch.roi))}>{ch.roi.toFixed(1)}%</td><td className={cn('py-3 px-4 text-right font-medium', ch.margin >= 0 ? 'text-emerald-600' : 'text-red-600')}>{ch.margin.toFixed(1)}%</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Product Profitability */}
        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-emerald-500" />En Karli Urunler</CardTitle></CardHeader>
              <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs">Urun</th><th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs">Kanal</th><th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs">Net Kar</th><th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs">ROI</th></tr></thead><tbody>{bestProducts.map(p => (<tr key={p.productId} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2.5 px-3 font-medium text-slate-800 max-w-[140px] truncate">{p.productName}</td><td className="py-2.5 px-3"><Badge variant="outline" className="text-xs">{p.channelName}</Badge></td><td className={cn('py-2.5 px-3 text-right font-semibold', p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(p.netProfit)}</td><td className="py-2.5 px-3 text-right"><Badge className={cn('text-xs', roiBadge(p.roi))}>{p.roi.toFixed(1)}%</Badge></td></tr>))}</tbody></table></div></CardContent>
            </Card>
            <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><ArrowDownRight className="h-4 w-4 text-red-500" />En Az Karli Urunler</CardTitle></CardHeader>
              <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs">Urun</th><th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs">Kanal</th><th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs">Net Kar</th><th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs">ROI</th></tr></thead><tbody>{worstProducts.map(p => (<tr key={p.productId} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2.5 px-3 font-medium text-slate-800 max-w-[140px] truncate">{p.productName}</td><td className="py-2.5 px-3"><Badge variant="outline" className="text-xs">{p.channelName}</Badge></td><td className={cn('py-2.5 px-3 text-right font-semibold', p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(p.netProfit)}</td><td className="py-2.5 px-3 text-right"><Badge className={cn('text-xs', roiBadge(p.roi))}>{p.roi.toFixed(1)}%</Badge></td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Monthly Trend */}
        <TabsContent value="monthly">
          <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Aylık Kar Trendi</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-5">
                {monthlyData.map((m, i) => {
                  const netPct = Math.max((Math.abs(m.netProfit) / maxProfit) * 100, 5);
                  const revPct = (m.revenue / Math.max(...monthlyData.map(x => x.revenue))) * 100;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 w-32">{m.month}</span>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Gelir: <strong className="text-slate-700">{fmt(m.revenue)}</strong></span>
                          <span>Maliyet: <strong className="text-slate-700">{fmt(m.cost)}</strong></span>
                          <span>Komisyon: <strong className="text-red-500">-{fmt(m.commission)}</strong></span>
                          <span className={cn('font-semibold', m.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>Net: {fmt(m.netProfit)}</span>
                          <span>{m.orders} siparis</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2"><span className="text-[10px] text-slate-400 w-10 text-right">Gelir</span><div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${revPct}%` }} /></div></div>
                      <div className="flex items-center gap-2"><span className="text-[10px] text-slate-400 w-10 text-right">Net</span><div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden"><div className={cn('h-full rounded-full transition-all duration-500', m.netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500')} style={{ width: `${netPct}%` }} /></div></div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
