'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp, TrendingDown, BarChart3, Calendar, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Eye, Zap, Target, Layers,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────

const trendSummary = [
  {
    title: 'Trending Ürünler',
    value: '248',
    subtitle: 'Son 7 günde tespit edilen',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    title: 'Yükselen Kategoriler',
    value: '12',
    subtitle: 'Hızlı büyüme gösteren',
    icon: Layers,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    title: 'Satış Hacmi Artışı',
    value: '+23.4%',
    subtitle: 'Önceki haftaya göre',
    icon: ArrowUpRight,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    title: 'Fırsat Skoru',
    value: '87/100',
    subtitle: 'Genel pazar fırsatı',
    icon: Target,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
];

type TrendStatus = 'Yükselen' | 'Stabil' | 'Düşen';

interface TrendingProduct {
  id: number;
  name: string;
  category: string;
  marketplace: string;
  weeklySales: string;
  growth: number;
  trendScore: number;
  status: TrendStatus;
}

const trendingProducts: TrendingProduct[] = [
  { id: 1, name: 'Kablosuz Bluetooth Kulaklık Pro', category: 'Elektronik', marketplace: 'Trendyol', weeklySales: '1.243', growth: 34.2, trendScore: 96, status: 'Yükselen' },
  { id: 2, name: 'Akıllı Saat Ultra Fit', category: 'Elektronik', marketplace: 'Hepsiburada', weeklySales: '987', growth: 28.7, trendScore: 93, status: 'Yükselen' },
  { id: 3, name: 'Organik Argan Yağı 100ml', category: 'Kozmetik', marketplace: 'Trendyol', weeklySales: '856', growth: 45.1, trendScore: 91, status: 'Yükselen' },
  { id: 4, name: 'Yoga Matı Premium 8mm', category: 'Spor', marketplace: 'n11', weeklySales: '743', growth: 22.3, trendScore: 88, status: 'Yükselen' },
  { id: 5, name: 'LED Masa Lambası Dokunmatik', category: 'Ev & Yaşam', marketplace: 'Amazon TR', weeklySales: '691', growth: 18.6, trendScore: 85, status: 'Yükselen' },
  { id: 6, name: 'Bebek Güvenlik Koltuğu', category: 'Oyuncak', marketplace: 'Hepsiburada', weeklySales: '634', growth: 15.2, trendScore: 82, status: 'Stabil' },
  { id: 7, name: 'Stainless Steel Termos 750ml', category: 'Ev & Yaşam', marketplace: 'Trendyol', weeklySales: '589', growth: 12.8, trendScore: 79, status: 'Stabil' },
  { id: 8, name: 'Deri Sırt Çantası Laptop', category: 'Moda', marketplace: 'n11', weeklySales: '542', growth: 8.4, trendScore: 76, status: 'Stabil' },
  { id: 9, name: 'Robot Süpürge X200', category: 'Elektronik', marketplace: 'Trendyol', weeklySales: '512', growth: 52.3, trendScore: 95, status: 'Yükselen' },
  { id: 10, name: 'Bahçe Mobilyası Seti', category: 'Bahçe', marketplace: 'Hepsiburada', weeklySales: '378', growth: -5.2, trendScore: 62, status: 'Düşen' },
  { id: 11, name: 'Mutfak Robotu 5-in-1', category: 'Ev & Yaşam', marketplace: 'Amazon TR', weeklySales: '465', growth: 7.1, trendScore: 74, status: 'Stabil' },
  { id: 12, name: 'Güneş Gözlüğü Polarize', category: 'Moda', marketplace: 'Trendyol', weeklySales: '1.089', growth: 38.5, trendScore: 90, status: 'Yükselen' },
];

interface CategoryGrowth {
  name: string;
  growth: number;
  color: string;
}

const categoryGrowth: CategoryGrowth[] = [
  { name: 'Elektronik', growth: 38.5, color: 'bg-emerald-500' },
  { name: 'Moda', growth: 23.4, color: 'bg-emerald-400' },
  { name: 'Ev & Yaşam', growth: 18.7, color: 'bg-teal-500' },
  { name: 'Kozmetik', growth: 45.1, color: 'bg-emerald-600' },
  { name: 'Spor', growth: 22.3, color: 'bg-teal-400' },
  { name: 'Oyuncak', growth: 15.2, color: 'bg-cyan-500' },
  { name: 'Kitap', growth: 8.9, color: 'bg-cyan-400' },
  { name: 'Bahçe', growth: -5.2, color: 'bg-rose-400' },
];

interface MarketplaceData {
  name: string;
  totalProducts: string;
  avgPrice: string;
  salesVolume: string;
  commissionRate: string;
}

const marketplaceData: MarketplaceData[] = [
  { name: 'Trendyol', totalProducts: '45.230', avgPrice: '₺289', salesVolume: '₺12.8M', commissionRate: '%8-15' },
  { name: 'Hepsiburada', totalProducts: '38.150', avgPrice: '₺345', salesVolume: '₺11.2M', commissionRate: '%6-12' },
  { name: 'n11', totalProducts: '22.890', avgPrice: '₺212', salesVolume: '₺5.6M', commissionRate: '%5-10' },
  { name: 'Amazon TR', totalProducts: '15.430', avgPrice: '₺398', salesVolume: '₺4.1M', commissionRate: '%8-18' },
];

type DemandLevel = 'Yüksek' | 'Orta' | 'Düşük';

interface SeasonalMonth {
  name: string;
  demand: DemandLevel;
  highlight: string;
}

const seasonalCalendar: SeasonalMonth[] = [
  { name: 'Ocak', demand: 'Orta', highlight: 'Yılbaşı' },
  { name: 'Şubat', demand: 'Düşük', highlight: '' },
  { name: 'Mart', demand: 'Orta', highlight: 'Bahar' },
  { name: 'Nisan', demand: 'Yüksek', highlight: '23 Nisan' },
  { name: 'Mayıs', demand: 'Orta', highlight: 'Anneler Günü' },
  { name: 'Haziran', demand: 'Yüksek', highlight: 'Yaz Sezonu' },
  { name: 'Temmuz', demand: 'Yüksek', highlight: 'Okul' },
  { name: 'Ağustos', demand: 'Orta', highlight: 'Baba' },
  { name: 'Eylül', demand: 'Yüksek', highlight: 'Okul Dönemi' },
  { name: 'Ekim', demand: 'Orta', highlight: '' },
  { name: 'Kasım', demand: 'Yüksek', highlight: 'Efsane Cuma' },
  { name: 'Aralık', demand: 'Yüksek', highlight: 'Yılbaşı' },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function demandBadge(demand: DemandLevel) {
  const map: Record<DemandLevel, { cls: string; dot: string }> = {
    Yüksek: { cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300', dot: 'bg-red-500' },
    Orta: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300', dot: 'bg-yellow-500' },
    Düşük: { cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300', dot: 'bg-green-500' },
  };
  const m = map[demand];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {demand}
    </span>
  );
}

function statusBadge(status: TrendStatus) {
  const map: Record<TrendStatus, { cls: string }> = {
    Yükselen: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
    Stabil: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
    Düşen: { cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  };
  return <Badge variant="outline" className={map[status].cls}>{status}</Badge>;
}

// ─── Component ───────────────────────────────────────────────────────

export default function SalesTrendAnalysis() {
  const [period, setPeriod] = useState('7d');
  const maxGrowth = Math.max(...categoryGrowth.map((c) => Math.abs(c.growth)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Satış Trend Analizi
          </h2>
          <p className="text-sm text-muted-foreground">
            Pazar trendlerini keşfedin, yükselen ürünleri ve kategorileri belirleyin.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Son 24 Saat</SelectItem>
            <SelectItem value="7d">Son 7 Gün</SelectItem>
            <SelectItem value="30d">Son 30 Gün</SelectItem>
            <SelectItem value="90d">Son 90 Gün</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── 1. Trend Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {trendSummary.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── 2. Trending Products Table + 3. Category Growth ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Table */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-lg">Trending Ürünler</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              En hızlı büyüyen ürünleri haftalık verilerle inceleyin
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Ürün Adı</th>
                    <th className="px-3 py-3">Kategori</th>
                    <th className="px-3 py-3">Pazaryeri</th>
                    <th className="px-3 py-3 text-right">Haftalık Satış</th>
                    <th className="px-3 py-3 text-right">Büyüme %</th>
                    <th className="px-3 py-3 text-center">Trend Skoru</th>
                    <th className="px-3 py-3 text-center">Durum</th>
                    <th className="px-5 py-3 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trendingProducts.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-muted/50">
                      <td className="max-w-[200px] truncate px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {p.name}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-3 py-3">
                        <Badge variant="secondary" className="text-xs">{p.marketplace}</Badge>
                      </td>
                      <td className="px-3 py-3 text-right font-medium">{p.weeklySales}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 font-semibold ${p.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {p.growth >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {Math.abs(p.growth)}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                          p.trendScore >= 90 ? 'bg-emerald-500' : p.trendScore >= 75 ? 'bg-amber-500' : 'bg-rose-400'
                        }`}>
                          {p.trendScore}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">{statusBadge(p.status)}</td>
                      <td className="px-5 py-3 text-center">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                          <Eye className="h-3.5 w-3.5" />
                          Detay
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Category Growth Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-lg">Kategori Büyümesi</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Kategorilerin haftalık büyüme oranları
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryGrowth.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className={`font-semibold ${cat.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {cat.growth >= 0 ? '+' : ''}{cat.growth}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${cat.color}`}
                    style={{ width: `${(Math.abs(cat.growth) / maxGrowth) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Marketplace Comparison ── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-semibold">Pazaryeri Karşılaştırması</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {marketplaceData.map((mp) => (
            <Card key={mp.name} className="relative overflow-hidden">
              <CardContent className="p-5">
                <h4 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">{mp.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Toplam Ürün</span>
                    <span className="text-sm font-semibold">{mp.totalProducts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Ortalama Fiyat</span>
                    <span className="text-sm font-semibold">{mp.avgPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Satış Hacmi</span>
                    <span className="text-sm font-semibold text-emerald-600">{mp.salesVolume}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Komisyon Oranı</span>
                    <Badge variant="outline" className="text-xs font-medium">{mp.commissionRate}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 5. Seasonal Trend Calendar ── */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-semibold">Mevsimsel Trend Takvimi</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {seasonalCalendar.map((m) => {
            const borderMap: Record<DemandLevel, string> = {
              Yüksek: 'border-red-300 dark:border-red-700',
              Orta: 'border-yellow-300 dark:border-yellow-700',
              Düşük: 'border-green-300 dark:border-green-700',
            };
            const bgMap: Record<DemandLevel, string> = {
              Yüksek: 'bg-red-50 dark:bg-red-950/30',
              Orta: 'bg-yellow-50 dark:bg-yellow-950/30',
              Düşük: 'bg-green-50 dark:bg-green-950/30',
            };
            return (
              <Card key={m.name} className={`border-2 ${borderMap[m.demand]} ${bgMap[m.demand]}`}>
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{m.name}</p>
                  {demandBadge(m.demand)}
                  {m.highlight && (
                    <p className="text-[11px] font-medium text-muted-foreground">{m.highlight}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
