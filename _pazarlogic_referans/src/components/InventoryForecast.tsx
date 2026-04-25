'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Package,
  BarChart3,
  RefreshCw,
  Zap,
  ShieldAlert,
  Activity,
} from 'lucide-react';

interface ForecastItem {
  id: string;
  product: string;
  sku: string;
  currentStock: number;
  dailySales: number;
  daysOfStock: number;
  reorderPoint: number;
  suggestedOrder: number;
  trend: 'artan' | 'düşen' | 'stabil';
  predicted: number;
  actual: number;
}

interface ChartData {
  name: string;
  tahmin: number;
  gerçek: number;
}

const trendConfig = {
  artan: { label: 'Artan', icon: TrendingUp, cls: 'text-emerald-600', bg: 'bg-emerald-100' },
  düşen: { label: 'Düşen', icon: TrendingDown, cls: 'text-red-600', bg: 'bg-red-100' },
  stabil: { label: 'Stabil', icon: Minus, cls: 'text-amber-600', bg: 'bg-amber-100' },
};

const demoItems: ForecastItem[] = [
  { id: '1', product: 'Kablosuz Kulaklık Pro', sku: 'KK-001', currentStock: 45, dailySales: 12, daysOfStock: 3, reorderPoint: 100, suggestedOrder: 200, trend: 'artan', predicted: 180, actual: 165 },
  { id: '2', product: 'Akıllı Saat V2', sku: 'AS-002', currentStock: 120, dailySales: 8, daysOfStock: 15, reorderPoint: 80, suggestedOrder: 0, trend: 'stabil', predicted: 95, actual: 100 },
  { id: '3', product: 'USB-C Hızlı Şarj', sku: 'UC-003', currentStock: 300, dailySales: 25, daysOfStock: 12, reorderPoint: 200, suggestedOrder: 150, trend: 'artan', predicted: 280, actual: 290 },
  { id: '4', product: 'Bluetooth Hoparlör Mini', sku: 'BH-004', currentStock: 20, dailySales: 5, daysOfStock: 4, reorderPoint: 50, suggestedOrder: 100, trend: 'düşen', predicted: 60, actual: 55 },
  { id: '5', product: 'Tablet Kılıfı Premium', sku: 'TK-005', currentStock: 500, dailySales: 15, daysOfStock: 33, reorderPoint: 150, suggestedOrder: 0, trend: 'stabil', predicted: 450, actual: 470 },
  { id: '6', product: 'Mekanik Klavye RGB', sku: 'MK-006', currentStock: 8, dailySales: 3, daysOfStock: 2, reorderPoint: 30, suggestedOrder: 80, trend: 'artan', predicted: 40, actual: 35 },
  { id: '7', product: 'Gaming Mouse', sku: 'GM-007', currentStock: 200, dailySales: 10, daysOfStock: 20, reorderPoint: 100, suggestedOrder: 0, trend: 'stabil', predicted: 180, actual: 190 },
  { id: '8', product: 'Webcam HD 1080p', sku: 'WC-008', currentStock: 35, dailySales: 7, daysOfStock: 5, reorderPoint: 40, suggestedOrder: 60, trend: 'artan', predicted: 50, actual: 45 },
  { id: '9', product: 'Powerbank 20000mAh', sku: 'PB-009', currentStock: 150, dailySales: 6, daysOfStock: 25, reorderPoint: 80, suggestedOrder: 0, trend: 'düşen', predicted: 130, actual: 140 },
  { id: '10', product: 'Kulaklık Standı', sku: 'KS-010', currentStock: 60, dailySales: 2, daysOfStock: 30, reorderPoint: 20, suggestedOrder: 0, trend: 'stabil', predicted: 55, actual: 58 },
];

function getStockColor(days: number) {
  if (days < 7) return 'text-red-600';
  if (days < 14) return 'text-amber-600';
  return 'text-emerald-600';
}

function getStockBg(days: number) {
  if (days < 7) return 'bg-red-100';
  if (days < 14) return 'bg-amber-100';
  return 'bg-emerald-100';
}

export default function InventoryForecast() {
  const { sidebarOpen } = useAppStore();
  const [items, setItems] = useState<ForecastItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/inventory-forecast')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setItems(data.items);
          setChartData(data.items.slice(0, 7).map((i: ForecastItem) => ({
            name: i.sku,
            tahmin: i.predicted,
            gerçek: i.actual,
          })));
        } else {
          setItems(demoItems);
          setChartData(demoItems.slice(0, 7).map((i) => ({
            name: i.sku,
            tahmin: i.predicted,
            gerçek: i.actual,
          })));
        }
      })
      .catch(() => {
        setItems(demoItems);
        setChartData(demoItems.slice(0, 7).map((i) => ({
          name: i.sku,
          tahmin: i.predicted,
          gerçek: i.actual,
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    fetch('/api/inventory-forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.items)) {
          setItems(data.items);
          setChartData(data.items.slice(0, 7).map((i: ForecastItem) => ({
            name: i.sku,
            tahmin: i.predicted,
            gerçek: i.actual,
          })));
        }
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => setGenerating(false), 1500);
      });
  };

  const trackedProducts = items.length;
  const criticalStock = items.filter((i) => i.daysOfStock < 7).length;
  const avgDaysOfStock = items.length > 0
    ? Math.round(items.reduce((s, i) => s + i.daysOfStock, 0) / items.length)
    : 0;
  const totalSuggested = items.reduce((s, i) => s + i.suggestedOrder, 0);

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Envanter Tahmin</h1>
        <p className="mb-6 text-slate-500">AI destekli stok talep tahmini</p>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Envanter Tahmin</h1>
        <p className="text-slate-500 mt-1">AI destekli stok talep tahmini ve yeniden sipariş önerileri</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Takip Edilen Ürün</p>
              <p className="text-2xl font-bold mt-1">{trackedProducts}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Kritik Stok (&lt;7 gün)</p>
              <p className="text-2xl font-bold mt-1">{criticalStock}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Ort. Gün Stoğu</p>
              <p className="text-2xl font-bold mt-1">{avgDaysOfStock} gün</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Önerilen Sipariş</p>
              <p className="text-2xl font-bold mt-1">{totalSuggested.toLocaleString('tr-TR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Tahmin vs Gerçek Stok</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1" />
            )}
            {generating ? 'Tahmin Ediliyor...' : 'Tahmin Oluştur'}
          </Button>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="tahmin" name="Tahmin" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gerçek" name="Gerçek" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Stok Tahmin Tablosu</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Ürün</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">SKU</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Mevcut Stok</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Günlük Satış</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Gün Stoğu</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Yeniden Sipariş</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Öneri</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tc = trendConfig[item.trend];
                const TrendIcon = tc.icon;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800">{item.product}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-xs">{item.sku}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{item.currentStock}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">{item.dailySales}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStockColor(item.daysOfStock)} ${getStockBg(item.daysOfStock)}`}>
                        {item.daysOfStock} gün
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">{item.reorderPoint}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      {item.suggestedOrder > 0 ? (
                        <span className="text-emerald-600 font-semibold">{item.suggestedOrder}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.cls}`}>
                        <TrendIcon className="h-3 w-3" />
                        {tc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Stock Level Progress */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Stok Seviyesi Özeti</h3>
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-32 truncate">{item.sku}</span>
              <div className="flex-1">
                <Progress
                  value={Math.min((item.daysOfStock / 30) * 100, 100)}
                  className="h-2"
                />
              </div>
              <span className={`text-xs font-medium w-16 text-right ${getStockColor(item.daysOfStock)}`}>
                {item.daysOfStock} gün
              </span>
            </div>
          ))}
        </div>

        {/* Stock Summary */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <p className="text-xs text-red-500 font-medium">Kritik Stok</p>
            <p className="text-lg font-bold text-red-700">{criticalStock} ürün</p>
            <p className="text-xs text-red-400 mt-1">Acil sipariş gerekli</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-500 font-medium">Dikkat Gerektiren</p>
            <p className="text-lg font-bold text-amber-700">{items.filter((i) => i.daysOfStock >= 7 && i.daysOfStock < 14).length} ürün</p>
            <p className="text-xs text-amber-400 mt-1">7-14 gün arası stok</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-xs text-emerald-500 font-medium">Yeterli Stok</p>
            <p className="text-lg font-bold text-emerald-700">{items.filter((i) => i.daysOfStock >= 14).length} ürün</p>
            <p className="text-xs text-emerald-400 mt-1">14+ gün stok</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Toplam Mevcut</p>
            <p className="text-lg font-bold text-slate-700">{items.reduce((s, i) => s + i.currentStock, 0).toLocaleString('tr-TR')}</p>
            <p className="text-xs text-slate-400 mt-1">Birim</p>
          </div>
        </div>

        {/* Critical Stock Alerts */}
        {criticalStock > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Kritik Stok Uyarıları
            </h3>
            <div className="space-y-2">
              {items
                .filter((i) => i.daysOfStock < 7)
                .sort((a, b) => a.daysOfStock - b.daysOfStock)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-800 text-sm">{item.product}</p>
                        <p className="text-xs text-red-500">SKU: {item.sku} | Mevcut: {item.currentStock} adet</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">{item.daysOfStock} gün kaldı</p>
                      <p className="text-xs text-red-500">Öneri: {item.suggestedOrder} adet</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Trend Distribution */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Satış Trend Dağılımı</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Artan</p>
                <p className="text-xs text-slate-500">{items.filter((i) => i.trend === 'artan').length} ürün</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Düşen</p>
                <p className="text-xs text-slate-500">{items.filter((i) => i.trend === 'düşen').length} ürün</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                <Minus className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Stabil</p>
                <p className="text-xs text-slate-500">{items.filter((i) => i.trend === 'stabil').length} ürün</p>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Takip edilen ürün bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
