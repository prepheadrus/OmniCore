'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@omnicore/ui/components/ui/card';
import { Badge } from '@omnicore/ui/components/ui/badge';
import { Button } from '@omnicore/ui/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@omnicore/ui/components/ui/tabs';
import { BarChart3, TrendingUp, Package, AlertTriangle, Download, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface ReportData {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalShipments: number;
  ordersByMarketplace: { name: string; value: number }[];
  ordersByStatus: { name: string; value: number }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; category: string }[];
}

const mockReportData: ReportData = {
  totalOrders: 1250,
  totalProducts: 450,
  totalRevenue: 285400,
  totalShipments: 1180,
  ordersByMarketplace: [
    { name: 'Trendyol', value: 650 },
    { name: 'Hepsiburada', value: 350 },
    { name: 'Amazon TR', value: 150 },
    { name: 'N11', value: 100 },
  ],
  ordersByStatus: [
    { name: 'Beklemede', value: 150 },
    { name: 'Hazırlanıyor', value: 200 },
    { name: 'Kargoda', value: 300 },
    { name: 'Teslim Edildi', value: 550 },
    { name: 'İptal', value: 50 },
  ],
  lowStockProducts: [
    { id: '1', name: 'Organik Bal 500g', sku: 'BAL-500', stock: 2, category: 'Gıda' },
    { id: '2', name: 'Zeytinyağı 1L', sku: 'ZEY-100', stock: 5, category: 'Gıda' },
    { id: '3', name: 'Filtre Kahve 250g', sku: 'KAH-250', stock: 0, category: 'İçecek' },
  ],
};

const COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export function ReportsDashboard() {
  const [loading, setLoading] = useState(false);
  const data = mockReportData;

  const maxMarket = Math.max(...data.ordersByMarketplace.map((d) => d.value), 1);
  const totalStatus = data.ordersByStatus.reduce((a, b) => a + b.value, 0);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-md" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button size="sm" variant="outline" className="h-8 text-[13px] border-slate-200">
          <Download className="h-4 w-4 mr-2" /> Dışa Aktar
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[13px] border-slate-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[13px] border-slate-200">
          <Printer className="h-4 w-4 mr-2" /> Yazdır
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[13px] border-slate-200" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Yenile
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-9 mb-6 bg-slate-100 border border-slate-200">
          <TabsTrigger value="overview" className="text-[13px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales" className="text-[13px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Satış Analizi</TabsTrigger>
          <TabsTrigger value="stock" className="text-[13px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Stok Raporu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Toplam Sipariş</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{data.totalOrders}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Toplam Ürün</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{data.totalProducts}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Toplam Gelir</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{fmt(data.totalRevenue)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Toplam Kargo</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{data.totalShipments}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-3 px-4 pt-4 border-b border-slate-100">
                <CardTitle className="text-[14px] font-semibold text-slate-800">Pazar Yerine Göre Siparişler</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {data.ordersByMarketplace.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="text-[13px] text-slate-600 w-28 truncate">{d.name}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 relative overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(d.value / maxMarket) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-[13px] font-semibold w-10 text-right text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200">
              <CardHeader className="pb-3 px-4 pt-4 border-b border-slate-100">
                <CardTitle className="text-[14px] font-semibold text-slate-800">Sipariş Durumu Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {data.ordersByStatus.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[13px] text-slate-600">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-slate-800">{d.value}</span>
                        <span className="text-[11px] text-slate-400 w-8 text-right">
                          {totalStatus > 0 ? ((d.value / totalStatus) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-3 px-4 pt-4 border-b border-slate-100">
              <CardTitle className="text-[14px] font-semibold text-slate-800">Satış Trendi</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="99%" minHeight={250}>
                <BarChart data={data.ordersByMarketplace}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.ordersByMarketplace.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Düşük Stok</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">{data.lowStockProducts.filter((p) => p.stock > 0).length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Tükenmiş (0)</p>
                  <p className="text-xl font-bold text-red-600 mt-1">{data.lowStockProducts.filter((p) => p.stock === 0).length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-slate-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Toplam Ürün</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{data.totalProducts}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none border-slate-200">
            <CardHeader className="pb-3 px-4 pt-4 border-b border-slate-100 flex flex-row items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-[14px] font-semibold text-slate-800">Kritik Stok Uyarıları</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                    <th className="py-2.5 px-4 font-medium">Ürün</th>
                    <th className="py-2.5 px-4 font-medium">SKU</th>
                    <th className="py-2.5 px-4 font-medium">Kategori</th>
                    <th className="py-2.5 px-4 text-right font-medium">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{p.sku}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant="outline" className="text-[10px] shadow-none border-slate-200 font-medium text-slate-600">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Badge className={`${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} border-0 shadow-none font-bold text-[11px]`}>
                          {p.stock} Adet
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
