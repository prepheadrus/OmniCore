'use client';

import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  Sparkles,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Eye,
  ListPlus,
  Users,
  ArrowUpRight,
  Zap,
  Flame,
  Target,
  Package,
  ShoppingCart,
  DollarSign,
  ChevronRight,
  Clock,
  Star,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OpportunityProduct {
  id: string;
  name: string;
  category: string;
  trendScore: number;
  monthlySales: number;
  competition: 'Düşük' | 'Orta' | 'Yüksek';
  profitMargin: number;
  avgPrice: number;
  marketplaces: string[];
  growthRate: number;
  imageUrl?: string;
}

interface CategoryTrend {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  growthPercent: number;
  topMarketplace: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_OPPORTUNITIES: OpportunityProduct[] = [
  {
    id: 'opp-001',
    name: 'Akıllı Saat Bandı Pro',
    category: 'Akıllı Giyilebilir',
    trendScore: 94,
    monthlySales: 12500,
    competition: 'Orta',
    profitMargin: 38,
    avgPrice: 849,
    marketplaces: ['Trendyol', 'Hepsiburada'],
    growthRate: 67,
  },
  {
    id: 'opp-002',
    name: 'Taşınabilir USB-C Hızlı Şarj Cihazı',
    category: 'Elektronik Aksesuar',
    trendScore: 91,
    monthlySales: 18200,
    competition: 'Yüksek',
    profitMargin: 24,
    avgPrice: 299,
    marketplaces: ['Trendyol', 'n11', 'Hepsiburada'],
    growthRate: 52,
  },
  {
    id: 'opp-003',
    name: 'Organik Argan Yağı Saç Bakım Seti',
    category: 'Kozmetik & Kişisel Bakım',
    trendScore: 88,
    monthlySales: 8700,
    competition: 'Düşük',
    profitMargin: 52,
    avgPrice: 420,
    marketplaces: ['Trendyol', 'Pazarama'],
    growthRate: 43,
  },
  {
    id: 'opp-004',
    name: 'Katlanabilir Yoga Matı',
    category: 'Spor & Outdoor',
    trendScore: 85,
    monthlySales: 6300,
    competition: 'Düşük',
    profitMargin: 45,
    avgPrice: 349,
    marketplaces: ['Hepsiburada', 'Trendyol'],
    growthRate: 38,
  },
  {
    id: 'opp-005',
    name: 'Bebek Gözlem Kamerası WiFi',
    category: 'Bebek & Çocuk',
    trendScore: 83,
    monthlySales: 5400,
    competition: 'Orta',
    profitMargin: 41,
    avgPrice: 1299,
    marketplaces: ['Trendyol', 'Hepsiburada', 'n11'],
    growthRate: 35,
  },
  {
    id: 'opp-006',
    name: 'Oto Koltuk Baş Destek Yastığı',
    category: 'Otomotiv Aksesuar',
    trendScore: 79,
    monthlySales: 9800,
    competition: 'Düşük',
    profitMargin: 56,
    avgPrice: 189,
    marketplaces: ['Hepsiburada', 'Trendyol'],
    growthRate: 29,
  },
  {
    id: 'opp-007',
    name: 'Minimalist Ahşap Masa Lambası',
    category: 'Ev & Yaşam',
    trendScore: 76,
    monthlySales: 4100,
    competition: 'Orta',
    profitMargin: 47,
    avgPrice: 599,
    marketplaces: ['Trendyol', 'Morhipo'],
    growthRate: 24,
  },
  {
    id: 'opp-008',
    name: 'Dijital Deri El Çantası',
    category: 'Moda & Aksesuar',
    trendScore: 74,
    monthlySales: 7200,
    competition: 'Yüksek',
    profitMargin: 33,
    avgPrice: 799,
    marketplaces: ['Trendyol', 'Hepsiburada', 'n11'],
    growthRate: 21,
  },
  {
    id: 'opp-009',
    name: 'Akıllı Ev Sıcaklık Sensörü',
    category: 'Akıllı Ev',
    trendScore: 71,
    monthlySales: 3200,
    competition: 'Düşük',
    profitMargin: 49,
    avgPrice: 459,
    marketplaces: ['Hepsiburada', 'Amazon TR'],
    growthRate: 18,
  },
  {
    id: 'opp-010',
    name: 'Protein Karışımıcı Shake Bardak',
    category: 'Spor & Sağlık',
    trendScore: 68,
    monthlySales: 15600,
    competition: 'Orta',
    profitMargin: 62,
    avgPrice: 129,
    marketplaces: ['Trendyol', 'Hepsiburada', 'Pazarama'],
    growthRate: 15,
  },
];

const MOCK_CATEGORY_TRENDS: CategoryTrend[] = [
  { id: 'cat-01', name: 'Akıllı Giyilebilir', icon: '⌚', productCount: 3420, growthPercent: 67, topMarketplace: 'Trendyol' },
  { id: 'cat-02', name: 'Kozmetik & Bakım', icon: '🧴', productCount: 5830, growthPercent: 54, topMarketplace: 'Hepsiburada' },
  { id: 'cat-03', name: 'Spor & Outdoor', icon: '🏃', productCount: 4210, growthPercent: 43, topMarketplace: 'Trendyol' },
  { id: 'cat-04', name: 'Bebek & Çocuk', icon: '👶', productCount: 2870, growthPercent: 39, topMarketplace: 'Hepsiburada' },
  { id: 'cat-05', name: 'Akıllı Ev', icon: '🏠', productCount: 1950, growthPercent: 35, topMarketplace: 'Trendyol' },
  { id: 'cat-06', name: 'Otomotiv', icon: '🚗', productCount: 3140, growthPercent: 28, topMarketplace: 'Hepsiburada' },
  { id: 'cat-07', name: 'Ev & Yaşam', icon: '🛋️', productCount: 6720, growthPercent: 22, topMarketplace: 'Trendyol' },
  { id: 'cat-08', name: 'Moda & Aksesuar', icon: '👗', productCount: 8950, growthPercent: 19, topMarketplace: 'Trendyol' },
];

const MOCK_TREND_HISTORY = [
  { month: 'Oca', score: 62, volume: 8200 },
  { month: 'Şub', score: 58, volume: 7800 },
  { month: 'Mar', score: 65, volume: 9100 },
  { month: 'Nis', score: 71, volume: 10500 },
  { month: 'May', score: 68, volume: 9800 },
  { month: 'Haz', score: 75, volume: 11200 },
  { month: 'Tem', score: 72, volume: 10600 },
  { month: 'Ağu', score: 78, volume: 12100 },
  { month: 'Eyl', score: 82, volume: 13500 },
  { month: 'Eki', score: 79, volume: 12800 },
  { month: 'Kas', score: 86, volume: 14200 },
  { month: 'Ara', score: 91, volume: 16800 },
];

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'Tüm Platformlar' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'n11', label: 'n11' },
  { value: 'pazarama', label: 'Pazarama' },
  { value: 'amazon-tr', label: 'Amazon TR' },
  { value: 'morhipo', label: 'Morhipo' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Tüm Kategoriler' },
  { value: 'akilli-giyilebilir', label: 'Akıllı Giyilebilir' },
  { value: 'elektronik', label: 'Elektronik Aksesuar' },
  { value: 'kozmetik', label: 'Kozmetik & Kişisel Bakım' },
  { value: 'spor', label: 'Spor & Outdoor' },
  { value: 'bebek', label: 'Bebek & Çocuk' },
  { value: 'otomotiv', label: 'Otomotiv Aksesuar' },
  { value: 'ev-yasam', label: 'Ev & Yaşam' },
  { value: 'moda', label: 'Moda & Aksesuar' },
  { value: 'akilli-ev', label: 'Akıllı Ev' },
  { value: 'spor-saglik', label: 'Spor & Sağlık' },
];

const PRICE_RANGE_OPTIONS = [
  { value: 'all', label: 'Tüm Fiyatlar' },
  { value: '0-200', label: '0 - 200 ₺' },
  { value: '200-500', label: '200 - 500 ₺' },
  { value: '500-1000', label: '500 - 1.000 ₺' },
  { value: '1000+', label: '1.000 ₺ ve üzeri' },
];

const TREND_SCORE_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: '80-100', label: '80 - 100 (Yükselen)' },
  { value: '60-79', label: '60 - 79 (Potansiyel)' },
  { value: '0-59', label: '0 - 59 (Stabil)' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(n: number): string {
  return new Intl.NumberFormat('tr-TR').format(n);
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
}

function trendScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-slate-500';
}

function trendScoreBarColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-slate-400';
}

function competitionBadge(competition: string): string {
  switch (competition) {
    case 'Düşük':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Orta':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Yüksek':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return '';
  }
}

function competitionDot(competition: string): string {
  switch (competition) {
    case 'Düşük':
      return 'bg-emerald-500';
    case 'Orta':
      return 'bg-amber-500';
    case 'Yüksek':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

function marketplaceColor(mp: string): string {
  switch (mp) {
    case 'Trendyol':
      return 'bg-orange-100 text-orange-700';
    case 'Hepsiburada':
      return 'bg-blue-100 text-blue-700';
    case 'n11':
      return 'bg-purple-100 text-purple-700';
    case 'Pazarama':
      return 'bg-teal-100 text-teal-700';
    case 'Amazon TR':
      return 'bg-slate-100 text-slate-700';
    case 'Morhipo':
      return 'bg-pink-100 text-pink-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function growthIcon(rate: number) {
  if (rate >= 40) return <Flame className="h-3.5 w-3.5 text-red-500" />;
  if (rate >= 20) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  return <TrendingUp className="h-3.5 w-3.5 text-blue-500" />;
}

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                     */
/* ------------------------------------------------------------------ */

function TrendScoreBar({ score }: { score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Trend Skoru</span>
        <span className={cn('text-sm font-bold', trendScoreColor(score))}>{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', trendScoreBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function OpportunityCard({ product }: { product: OpportunityProduct }) {
  return (
    <Card className="group hover:shadow-lg hover:border-emerald-200 transition-all duration-300 overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Package className="h-3 w-3" />
              {product.category}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {growthIcon(product.growthRate)}
            <span className="text-xs font-semibold text-emerald-600">+{product.growthRate}%</span>
          </div>
        </div>

        <TrendScoreBar score={product.trendScore} />

        <Separator />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Aylık Satış</p>
            <p className="text-sm font-bold text-slate-800">{formatNumber(product.monthlySales)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Ort. Fiyat</p>
            <p className="text-sm font-bold text-slate-800">{formatCurrency(product.avgPrice)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Kâr Marjı</p>
            <p className="text-sm font-bold text-emerald-600">%{product.profitMargin}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Rekabet</p>
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', competitionDot(product.competition))} />
              <span className="text-sm font-semibold text-slate-700">{product.competition}</span>
            </div>
          </div>
        </div>

        {/* Marketplace badges */}
        <div className="flex flex-wrap gap-1.5">
          {product.marketplaces.map((mp) => (
            <Badge key={mp} className={cn('text-[10px] px-1.5 py-0', marketplaceColor(mp))} variant="secondary">
              {mp}
            </Badge>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            İncele
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5">
            <ListPlus className="h-3.5 w-3.5" />
            Listeye Ekle
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Rakip Analizi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryTrendCard({ category }: { category: CategoryTrend }) {
  return (
    <Card className="min-w-[200px] shrink-0 hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
              {category.name}
            </h4>
            <p className="text-xs text-slate-500">{formatNumber(category.productCount)} ürün</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-bold text-emerald-600">+{category.growthPercent}%</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600">
              {category.topMarketplace}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendAnalysisPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            12 Aylık Trend Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simulated bar chart with divs */}
          <div className="flex items-end gap-2 h-48 px-2">
            {MOCK_TREND_HISTORY.map((item) => {
              const maxVolume = Math.max(...MOCK_TREND_HISTORY.map((h) => h.volume));
              const height = (item.volume / maxVolume) * 100;
              const isTop = item.score >= 85;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500">{formatNumber(item.volume / 1000)}K</span>
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all duration-500 cursor-pointer',
                      isTop
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-emerald-300 hover:bg-emerald-400'
                    )}
                    style={{ height: `${height}%`, minHeight: '8px' }}
                    title={`${item.month}: Skor ${item.score}, Hacim ${formatNumber(item.volume)}`}
                  />
                  <span className="text-[10px] text-slate-500 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ortalama Büyüme</p>
                <p className="text-xl font-bold text-slate-800">%36.2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Toplam Satış Hacmi</p>
                <p className="text-xl font-bold text-slate-800">132.4K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">En Yüksek Skor</p>
                <p className="text-xl font-bold text-slate-800">94/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CompetitorComparisonPanel() {
  const products = MOCK_OPPORTUNITIES.slice(0, 6);
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          Rakip Karşılaştırma Tablosu
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Ürün</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Kategori</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Trend</th>
                <th className="text-center py-3 px-4 font-medium text-slate-600">Rekabet</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Marj %</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Aylık Satış</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Platformlar</th>
                <th className="text-center py-3 px-4 font-medium text-slate-600">Fırsat</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const opportunityScore = Math.round(
                  (p.trendScore * 0.3 + (100 - (p.competition === 'Yüksek' ? 80 : p.competition === 'Orta' ? 50 : 20)) * 0.3 + p.profitMargin * 0.2 + p.growthRate * 0.2)
                );
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{p.category}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', trendScoreBarColor(p.trendScore))}
                            style={{ width: `${p.trendScore}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-bold', trendScoreColor(p.trendScore))}>{p.trendScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={cn('text-[10px]', competitionBadge(p.competition))} variant="secondary">
                        {p.competition}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600"> %{p.profitMargin}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{formatNumber(p.monthlySales)}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.marketplaces.slice(0, 2).map((mp) => (
                          <Badge key={mp} className={cn('text-[9px] px-1 py-0', marketplaceColor(mp))} variant="secondary">
                            {mp}
                          </Badge>
                        ))}
                        {p.marketplaces.length > 2 && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-slate-100 text-slate-500">
                            +{p.marketplaces.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full',
                          opportunityScore >= 75 ? 'bg-emerald-100 text-emerald-700' : opportunityScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {opportunityScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryPanel() {
  const historyItems = [
    { id: 'h1', date: '15 Ocak 2025', query: 'Akıllı saatler', results: 12, type: 'AI Analiz' },
    { id: 'h2', date: '12 Ocak 2025', query: 'Kozmetik ürünleri', results: 24, type: 'AI Analiz' },
    { id: 'h3', date: '10 Ocak 2025', query: 'Spor ekipmanları', results: 18, type: 'Filtreleme' },
    { id: 'h4', date: '8 Ocak 2025', query: 'Bebek ürünleri', results: 9, type: 'AI Analiz' },
    { id: 'h5', date: '5 Ocak 2025', query: 'Ev dekorasyon', results: 15, type: 'Filtreleme' },
    { id: 'h6', date: '2 Ocak 2025', query: 'Otomotiv aksesuar', results: 7, type: 'AI Analiz' },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          Geçmiş Analizler
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {historyItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                  {item.query}
                </p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0 bg-slate-100 text-slate-600">
                {item.type}
              </Badge>
              <span className="text-xs text-slate-400 shrink-0">{item.results} sonuç</span>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function OpportunityFinder() {
  const { sidebarOpen } = useAppStore();

  /* ---- Local state ---- */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedTrendScore, setSelectedTrendScore] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [sortBy, setSortBy] = useState<'trend' | 'sales' | 'margin' | 'competition'>('trend');

  /* ---- Filtered & sorted data ---- */
  const filteredOpportunities = useMemo(() => {
    let data = [...MOCK_OPPORTUNITIES];

    // Platform filter
    if (selectedPlatform !== 'all') {
      const platformMap: Record<string, string> = {
        trendyol: 'Trendyol',
        hepsiburada: 'Hepsiburada',
        'n11': 'n11',
        pazarama: 'Pazarama',
        'amazon-tr': 'Amazon TR',
        morhipo: 'Morhipo',
      };
      data = data.filter((p) => p.marketplaces.includes(platformMap[selectedPlatform]));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const catMap: Record<string, string> = {
        'akilli-giyilebilir': 'Akıllı Giyilebilir',
        elektronik: 'Elektronik Aksesuar',
        kozmetik: 'Kozmetik & Kişisel Bakım',
        spor: 'Spor & Outdoor',
        bebek: 'Bebek & Çocuk',
        otomotiv: 'Otomotiv Aksesuar',
        'ev-yasam': 'Ev & Yaşam',
        moda: 'Moda & Aksesuar',
        'akilli-ev': 'Akıllı Ev',
        'spor-saglik': 'Spor & Sağlık',
      };
      data = data.filter((p) => p.category === catMap[selectedCategory]);
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      switch (selectedPriceRange) {
        case '0-200':
          data = data.filter((p) => p.avgPrice <= 200);
          break;
        case '200-500':
          data = data.filter((p) => p.avgPrice > 200 && p.avgPrice <= 500);
          break;
        case '500-1000':
          data = data.filter((p) => p.avgPrice > 500 && p.avgPrice <= 1000);
          break;
        case '1000+':
          data = data.filter((p) => p.avgPrice > 1000);
          break;
      }
    }

    // Trend score filter
    if (selectedTrendScore !== 'all') {
      switch (selectedTrendScore) {
        case '80-100':
          data = data.filter((p) => p.trendScore >= 80);
          break;
        case '60-79':
          data = data.filter((p) => p.trendScore >= 60 && p.trendScore <= 79);
          break;
        case '0-59':
          data = data.filter((p) => p.trendScore <= 59);
          break;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.marketplaces.some((mp) => mp.toLowerCase().includes(q))
      );
    }

    // Sort
    const competitionOrder: Record<string, number> = { 'Düşük': 1, 'Orta': 2, 'Yüksek': 3 };
    switch (sortBy) {
      case 'trend':
        data.sort((a, b) => b.trendScore - a.trendScore);
        break;
      case 'sales':
        data.sort((a, b) => b.monthlySales - a.monthlySales);
        break;
      case 'margin':
        data.sort((a, b) => b.profitMargin - a.profitMargin);
        break;
      case 'competition':
        data.sort((a, b) => competitionOrder[a.competition] - competitionOrder[b.competition]);
        break;
    }

    return data;
  }, [searchQuery, selectedPlatform, selectedCategory, selectedPriceRange, selectedTrendScore, sortBy]);

  /* ---- AI Analysis handler ---- */
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  /* ---- Summary stats ---- */
  const totalOpportunities = filteredOpportunities.length;
  const avgTrendScore = totalOpportunities > 0
    ? Math.round(filteredOpportunities.reduce((a, b) => a + b.trendScore, 0) / totalOpportunities)
    : 0;
  const highMarginCount = filteredOpportunities.filter((p) => p.profitMargin >= 40).length;
  const lowCompCount = filteredOpportunities.filter((p) => p.competition === 'Düşük').length;

  /* ---- Render ---- */
  return (
    <div className={cn('min-h-screen bg-slate-50 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* ========== HEADER ========== */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25">
              <Crosshair className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Ürün Fırsat Bulucu
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Pazaryerlerinde yükselen ürünleri ve fırsatları keşfedin
              </p>
            </div>
            <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              AI Destekli
            </Badge>
          </div>
        </div>

        {/* ========== SEARCH BAR ========== */}
        <Card className="mb-6 shadow-sm border-emerald-100">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ürün adı, kategori veya platform ara... (örn. akıllı saat, kozmetik)"
                  className="pl-10 h-11 text-sm bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full sm:w-[180px] h-11 text-sm">
                  <SelectValue placeholder="Platform Seç" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 gap-2 px-6"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI ile Analiz Et
                  </>
                )}
              </Button>
            </div>

            {/* AI Loading animation */}
            {isAnalyzing && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800">AI modeli verileri analiz ediyor...</p>
                    <div className="flex gap-1 mt-1.5">
                      {['Trendyol', 'Hepsiburada', 'n11'].map((platform, i) => (
                        <span
                          key={platform}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse"
                          style={{ animationDelay: `${i * 300}ms` }}
                        >
                          {platform} ✓
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '65%' }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========== SUMMARY STATS (shown after analysis) ========== */}
        {showResults && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-emerald-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Toplam Fırsat</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{totalOpportunities}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/25">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Ort. Trend Skoru</p>
                      <p className={cn('text-2xl font-bold mt-1', trendScoreColor(avgTrendScore))}>{avgTrendScore}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-md shadow-blue-500/25">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <Progress value={avgTrendScore} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Yüksek Marjlı</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">{highMarginCount}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/25">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Düşük Rekabet</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">{lowCompCount}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 shadow-md shadow-violet-500/25">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ========== CATEGORY TRENDS ========== */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Yükselen Kategoriler
                </h2>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500 gap-1">
                  Tümünü Gör
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {MOCK_CATEGORY_TRENDS.map((cat) => (
                  <CategoryTrendCard key={cat.id} category={cat} />
                ))}
              </div>
            </div>

            {/* ========== TOOLBAR ========== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Yenile
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <Filter className="h-3.5 w-3.5" />
                  Filtrele
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <Download className="h-3.5 w-3.5" />
                  Dışa Aktar
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <Printer className="h-3.5 w-3.5" />
                  Yazdır
                </Button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sırala:</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trend">
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3 w-3" /> Trend Skoru
                      </span>
                    </SelectItem>
                    <SelectItem value="sales">
                      <span className="flex items-center gap-1.5">
                        <ShoppingCart className="h-3 w-3" /> Aylık Satış
                      </span>
                    </SelectItem>
                    <SelectItem value="margin">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3" /> Kâr Marjı
                      </span>
                    </SelectItem>
                    <SelectItem value="competition">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" /> Rekabet (Düşük)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ========== TABS ========== */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
              <TabsList>
                <TabsTrigger value="opportunities" className="gap-1.5 text-xs">
                  <Target className="h-3.5 w-3.5" />
                  Fırsatlar
                </TabsTrigger>
                <TabsTrigger value="trends" className="gap-1.5 text-xs">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Trend Analizi
                </TabsTrigger>
                <TabsTrigger value="competitors" className="gap-1.5 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  Rakip Karşılaştırma
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  Geçmiş
                </TabsTrigger>
              </TabsList>

              {/* ---- Tab: Fırsatlar ---- */}
              <TabsContent value="opportunities">
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Platform</label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Kategori</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Fiyat Aralığı</label>
                      <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_RANGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Trend Skoru</label>
                      <Select value={selectedTrendScore} onValueChange={setSelectedTrendScore}>
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TREND_SCORE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-500 h-8"
                        onClick={() => {
                          setSelectedPlatform('all');
                          setSelectedCategory('all');
                          setSelectedPriceRange('all');
                          setSelectedTrendScore('all');
                          setSearchQuery('');
                        }}
                      >
                        Temizle
                      </Button>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-800">{totalOpportunities}</span> fırsat bulundu
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <ArrowUpDown className="h-3 w-3" />
                      <span>{sortBy === 'trend' ? 'Trend skoruna göre' : sortBy === 'sales' ? 'Satış hacmine göre' : sortBy === 'margin' ? 'Kâr marjına göre' : 'Rekabet düzeyine göre'}</span>
                    </div>
                  </div>

                  {/* Opportunity cards grid */}
                  {filteredOpportunities.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Fırsat bulunamadı</p>
                        <p className="text-sm text-slate-400 mt-1">Filtrelerinizi değiştirmeyi veya farklı bir arama yapmayı deneyin.</p>
                        <Button
                          variant="outline"
                          className="mt-4 text-sm"
                          onClick={() => {
                            setSelectedPlatform('all');
                            setSelectedCategory('all');
                            setSelectedPriceRange('all');
                            setSelectedTrendScore('all');
                            setSearchQuery('');
                          }}
                        >
                          Filtreleri Temizle
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredOpportunities.map((product) => (
                        <OpportunityCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ---- Tab: Trend Analizi ---- */}
              <TabsContent value="trends">
                <TrendAnalysisPanel />
              </TabsContent>

              {/* ---- Tab: Rakip Karşılaştırma ---- */}
              <TabsContent value="competitors">
                <CompetitorComparisonPanel />
              </TabsContent>

              {/* ---- Tab: Geçmiş ---- */}
              <TabsContent value="history">
                <HistoryPanel />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* ========== EMPTY STATE (before analysis) ========== */}
        {!showResults && !isAnalyzing && (
          <Card className="mt-6">
            <CardContent className="p-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Fırsat Keşfini Başlatın</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                &ldquo;AI ile Analiz Et&rdquo; butonuna tıklayarak Trendyol, Hepsiburada, n11 ve diğer
                pazaryerlerindeki yükselen ürün fırsatlarını keşfedin. Yapay zeka binlerce ürünü analiz
                ederek size en kârlı fırsatları sunar.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Badge variant="secondary" className="text-xs gap-1 bg-orange-100 text-orange-700">
                  <span className="text-sm">🟠</span> Trendyol
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1 bg-blue-100 text-blue-700">
                  <span className="text-sm">🔵</span> Hepsiburada
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1 bg-purple-100 text-purple-700">
                  <span className="text-sm">🟣</span> n11
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1 bg-teal-100 text-teal-700">
                  <span className="text-sm">🟢</span> Pazarama
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
