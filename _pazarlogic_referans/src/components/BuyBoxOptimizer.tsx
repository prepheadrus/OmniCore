'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  Trophy, TrendingUp, TrendingDown, Target, Zap, BarChart3, RefreshCw,
  Check, X, AlertTriangle, ArrowRight, ChevronUp, ChevronDown, Minus,
  ShoppingCart, Store, Star, Truck, Shield, Eye, Settings, SlidersHorizontal,
  Filter, Search, ArrowUpDown, Package,
} from 'lucide-react';

/* ───────────── Types ───────────── */
interface Competitor {
  name: string;
  price: number;
  rating: number;
  fba: boolean;
  deliveryDays: number;
}

interface PricePoint {
  date: string;
  ourPrice: number;
  buyBoxPrice: number;
}

interface BuyBoxProduct {
  id: string;
  name: string;
  asin: string;
  ourPrice: number;
  buyBoxPrice: number;
  buyBoxOwner: string;
  won: boolean;
  winRate: number;
  suggestedPrice: number;
  marketplace: 'Amazon' | 'Trendyol' | 'Hepsiburada';
  competitors: Competitor[];
  priceHistory: PricePoint[];
  reasoning: string;
  lastUpdated: string;
}

interface StrategySettings {
  targetMarketplace: string;
  pricingStrategy: 'aggressive' | 'balanced' | 'conservative';
  minPrice: number;
  maxPrice: number;
  autoRepricer: boolean;
  repricerInterval: string;
  minMarginPercent: number;
  maxDailyChanges: number;
}

/* ───────────── Helpers ───────────── */
const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(n);
const fmtShort = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

function winRateColor(rate: number): string {
  if (rate >= 70) return 'text-emerald-600';
  if (rate >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function winRateBg(rate: number): string {
  if (rate >= 70) return 'bg-emerald-500';
  if (rate >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function winRateTrack(rate: number): string {
  if (rate >= 70) return 'bg-emerald-100';
  if (rate >= 40) return 'bg-amber-100';
  return 'bg-red-100';
}

function winRateLabel(rate: number): string {
  if (rate >= 70) return 'Mükemmel';
  if (rate >= 40) return 'Orta';
  return 'Düşük';
}

function priceDiffColor(ourPrice: number, buyBoxPrice: number): string {
  const diff = ourPrice - buyBoxPrice;
  if (diff <= 0) return 'text-emerald-600';
  if (diff <= buyBoxPrice * 0.03) return 'text-amber-600';
  return 'text-red-600';
}

/* ───────────── Mock Data ───────────── */
const MOCK_PRODUCTS: BuyBoxProduct[] = [
  {
    id: 'bb-001', name: 'Xiaomi Redmi Note 13 Pro 256GB', asin: 'B0CJMRXQK7',
    ourPrice: 12999, buyBoxPrice: 12999, buyBoxOwner: 'Biz', won: true, winRate: 92,
    suggestedPrice: 12999, marketplace: 'Amazon',
    competitors: [
      { name: 'ElektronikWorld', price: 13149, rating: 4.6, fba: true, deliveryDays: 1 },
      { name: 'TeknoPlus', price: 13299, rating: 4.3, fba: true, deliveryDays: 1 },
      { name: 'GadgetStore', price: 13499, rating: 4.1, fba: false, deliveryDays: 3 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 13499, buyBoxPrice: 13499 },
      { date: '05.07', ourPrice: 13349, buyBoxPrice: 13299 },
      { date: '09.07', ourPrice: 13249, buyBoxPrice: 13199 },
      { date: '13.07', ourPrice: 13149, buyBoxPrice: 13149 },
      { date: '17.07', ourPrice: 13099, buyBoxPrice: 13099 },
      { date: '21.07', ourPrice: 13049, buyBoxPrice: 13049 },
      { date: '25.07', ourPrice: 12999, buyBoxPrice: 12999 },
    ],
    reasoning: 'Mevcut fiyatınız Buy Box\'ı %92 oranında kazanmanızı sağlıyor. Rakiplerinizden en az 150₺ ucuzsunuz.',
    lastUpdated: '25.07.2025 14:32',
  },
  {
    id: 'bb-002', name: 'Apple AirPods Pro 2. USB-C', asin: 'B0CHWRXH8B',
    ourPrice: 8499, buyBoxPrice: 8299, buyBoxOwner: 'TechMall', won: false, winRate: 34,
    suggestedPrice: 8279, marketplace: 'Amazon',
    competitors: [
      { name: 'TechMall', price: 8299, rating: 4.8, fba: true, deliveryDays: 1 },
      { name: 'AppleShop', price: 8399, rating: 4.9, fba: true, deliveryDays: 1 },
      { name: 'BizeTrade', price: 8499, rating: 4.4, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 8799, buyBoxPrice: 8599 },
      { date: '05.07', ourPrice: 8699, buyBoxPrice: 8499 },
      { date: '09.07', ourPrice: 8599, buyBoxPrice: 8399 },
      { date: '13.07', ourPrice: 8499, buyBoxPrice: 8399 },
      { date: '17.07', ourPrice: 8499, buyBoxPrice: 8299 },
      { date: '21.07', ourPrice: 8499, buyBoxPrice: 8299 },
      { date: '25.07', ourPrice: 8499, buyBoxPrice: 8299 },
    ],
    reasoning: 'TechMall 200₺ daha ucuz ve FBA kullanıyor. Fiyatı 8.279₺\'ya düşürerek Buy Box\'ı geri kazanabilirsiniz. Marjınız hâlâ %18 olacak.',
    lastUpdated: '25.07.2025 14:28',
  },
  {
    id: 'bb-003', name: 'Samsung Galaxy Watch 6 Classic 47mm', asin: 'B0C7TJHMSK',
    ourPrice: 7499, buyBoxPrice: 7499, buyBoxOwner: 'Biz', won: true, winRate: 78,
    suggestedPrice: 7499, marketplace: 'Amazon',
    competitors: [
      { name: 'SaatMerkezi', price: 7649, rating: 4.5, fba: true, deliveryDays: 1 },
      { name: 'WatchPro', price: 7799, rating: 4.2, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 7799, buyBoxPrice: 7799 },
      { date: '05.07', ourPrice: 7699, buyBoxPrice: 7699 },
      { date: '09.07', ourPrice: 7599, buyBoxPrice: 7599 },
      { date: '13.07', ourPrice: 7599, buyBoxPrice: 7549 },
      { date: '17.07', ourPrice: 7499, buyBoxPrice: 7499 },
      { date: '21.07', ourPrice: 7499, buyBoxPrice: 7499 },
      { date: '25.07', ourPrice: 7499, buyBoxPrice: 7499 },
    ],
    reasoning: 'Buy Box\'ı aktif olarak kazanmaktasınız. En yakın rakip 150₺ üzerinizde. Mevcut fiyatı koruyun.',
    lastUpdated: '25.07.2025 14:15',
  },
  {
    id: 'bb-004', name: 'Philips Airfryer XXL HD9867', asin: 'B0BRKS5NLQ',
    ourPrice: 5999, buyBoxPrice: 5849, buyBoxOwner: 'EvMarket', won: false, winRate: 45,
    suggestedPrice: 5829, marketplace: 'Trendyol',
    competitors: [
      { name: 'EvMarket', price: 5849, rating: 4.7, fba: true, deliveryDays: 1 },
      { name: 'BeyazEsyaPro', price: 5999, rating: 4.4, fba: true, deliveryDays: 1 },
      { name: 'MutfakKutusu', price: 6099, rating: 4.0, fba: false, deliveryDays: 3 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 6299, buyBoxPrice: 6149 },
      { date: '05.07', ourPrice: 6199, buyBoxPrice: 5999 },
      { date: '09.07', ourPrice: 6099, buyBoxPrice: 5999 },
      { date: '13.07', ourPrice: 5999, buyBoxPrice: 5899 },
      { date: '17.07', ourPrice: 5999, buyBoxPrice: 5849 },
      { date: '21.07', ourPrice: 5999, buyBoxPrice: 5849 },
      { date: '25.07', ourPrice: 5999, buyBoxPrice: 5849 },
    ],
    reasoning: 'EvMarket 150₺ ucuz ve TrendyolExpress kulllanıyor. 5829₺\'ya düşürerek kazanma şansınızı %85\'e çıkarabilirsiniz.',
    lastUpdated: '25.07.2025 13:58',
  },
  {
    id: 'bb-005', name: 'Dyson V15 Detect Absolute', asin: 'B0B3K5G7X9',
    ourPrice: 24999, buyBoxPrice: 24999, buyBoxOwner: 'Biz', won: true, winRate: 88,
    suggestedPrice: 24999, marketplace: 'Hepsiburada',
    competitors: [
      { name: 'TemizlikEv', price: 25499, rating: 4.5, fba: true, deliveryDays: 1 },
      { name: 'PremiumTech', price: 25999, rating: 4.3, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 25999, buyBoxPrice: 25999 },
      { date: '05.07', ourPrice: 25499, buyBoxPrice: 25499 },
      { date: '09.07', ourPrice: 25249, buyBoxPrice: 25249 },
      { date: '13.07', ourPrice: 25199, buyBoxPrice: 25199 },
      { date: '17.07', ourPrice: 24999, buyBoxPrice: 24999 },
      { date: '21.07', ourPrice: 24999, buyBoxPrice: 24999 },
      { date: '25.07', ourPrice: 24999, buyBoxPrice: 24999 },
    ],
    reasoning: 'Güçlü Buy Box konumundasınız. En yakın rakip 500₺ üzerinizde. Stratejinizi koruyun.',
    lastUpdated: '25.07.2025 13:45',
  },
  {
    id: 'bb-006', name: 'Lego Technic Ferrari Daytona SP3', asin: 'B09V3KQWNF',
    ourPrice: 14999, buyBoxPrice: 14499, buyBoxOwner: 'OyuncakDünyası', won: false, winRate: 22,
    suggestedPrice: 14449, marketplace: 'Amazon',
    competitors: [
      { name: 'OyuncakDünyası', price: 14499, rating: 4.9, fba: true, deliveryDays: 1 },
      { name: 'BrickMaster', price: 14699, rating: 4.7, fba: true, deliveryDays: 1 },
      { name: 'LegoShopTR', price: 14799, rating: 4.8, fba: true, deliveryDays: 1 },
      { name: 'HediyeKutusu', price: 15299, rating: 4.2, fba: false, deliveryDays: 3 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 15499, buyBoxPrice: 14999 },
      { date: '05.07', ourPrice: 15299, buyBoxPrice: 14899 },
      { date: '09.07', ourPrice: 15199, buyBoxPrice: 14799 },
      { date: '13.07', ourPrice: 15099, buyBoxPrice: 14699 },
      { date: '17.07', ourPrice: 14999, buyBoxPrice: 14599 },
      { date: '21.07', ourPrice: 14999, buyBoxPrice: 14499 },
      { date: '25.07', ourPrice: 14999, buyBoxPrice: 14499 },
    ],
    reasoning: 'OyuncakDünyası sürekli fiyat düşürüyor. Marjınızı koruyarak 14.449₺\'ya inmek kazanma oranını %60\'a çıkarır.',
    lastUpdated: '25.07.2025 13:30',
  },
  {
    id: 'bb-007', name: 'Bosch SMS6ECW00S Bulaşık Makinesi', asin: 'HB-627481',
    ourPrice: 18999, buyBoxPrice: 18999, buyBoxOwner: 'Biz', won: true, winRate: 71,
    suggestedPrice: 18999, marketplace: 'Trendyol',
    competitors: [
      { name: 'BeyazEsyaMerkez', price: 19199, rating: 4.6, fba: true, deliveryDays: 1 },
      { name: 'AnadoluTeknik', price: 19499, rating: 4.3, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 19499, buyBoxPrice: 19499 },
      { date: '05.07', ourPrice: 19299, buyBoxPrice: 19299 },
      { date: '09.07', ourPrice: 19199, buyBoxPrice: 19149 },
      { date: '13.07', ourPrice: 19099, buyBoxPrice: 19099 },
      { date: '17.07', ourPrice: 18999, buyBoxPrice: 18999 },
      { date: '21.07', ourPrice: 18999, buyBoxPrice: 18999 },
      { date: '25.07', ourPrice: 18999, buyBoxPrice: 18999 },
    ],
    reasoning: 'Buy Box\'ı tutarlı şekilde kazanmaktasınız. En yakın rakip 200₺ üzerinizde.',
    lastUpdated: '25.07.2025 13:12',
  },
  {
    id: 'bb-008', name: 'Nike Air Max 270 React Erkek', asin: 'B08D4K2L7N',
    ourPrice: 3499, buyBoxPrice: 3399, buyBoxOwner: 'SporGiyim', won: false, winRate: 28,
    suggestedPrice: 3379, marketplace: 'Hepsiburada',
    competitors: [
      { name: 'SporGiyim', price: 3399, rating: 4.8, fba: true, deliveryDays: 1 },
      { name: 'AyakkabiDunyasi', price: 3449, rating: 4.6, fba: true, deliveryDays: 1 },
      { name: 'KicksStore', price: 3599, rating: 4.4, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 3699, buyBoxPrice: 3549 },
      { date: '05.07', ourPrice: 3649, buyBoxPrice: 3499 },
      { date: '09.07', ourPrice: 3599, buyBoxPrice: 3449 },
      { date: '13.07', ourPrice: 3549, buyBoxPrice: 3429 },
      { date: '17.07', ourPrice: 3499, buyBoxPrice: 3399 },
      { date: '21.07', ourPrice: 3499, buyBoxPrice: 3399 },
      { date: '25.07', ourPrice: 3499, buyBoxPrice: 3399 },
    ],
    reasoning: 'SporGiyim agresif fiyatlama yapıyor. 3.379₺\'ya düşürmek kazanma şansını %55\'e çıkarır.',
    lastUpdated: '25.07.2025 12:55',
  },
  {
    id: 'bb-009', name: 'MacBook Air M3 15" 256GB', asin: 'B0C7T5QJ7F',
    ourPrice: 54999, buyBoxPrice: 54999, buyBoxOwner: 'Biz', won: true, winRate: 95,
    suggestedPrice: 54999, marketplace: 'Amazon',
    competitors: [
      { name: 'AppleCenter', price: 55499, rating: 4.9, fba: true, deliveryDays: 1 },
      { name: 'NotebookPro', price: 55999, rating: 4.5, fba: false, deliveryDays: 3 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 55999, buyBoxPrice: 55999 },
      { date: '05.07', ourPrice: 55499, buyBoxPrice: 55499 },
      { date: '09.07', ourPrice: 55249, buyBoxPrice: 55249 },
      { date: '13.07', ourPrice: 55199, buyBoxPrice: 55199 },
      { date: '17.07', ourPrice: 54999, buyBoxPrice: 54999 },
      { date: '21.07', ourPrice: 54999, buyBoxPrice: 54999 },
      { date: '25.07', ourPrice: 54999, buyBoxPrice: 54999 },
    ],
    reasoning: 'Mükemmel Buy Box performansı. Güçlü konumunuzu koruyun.',
    lastUpdated: '25.07.2025 12:40',
  },
  {
    id: 'bb-010', name: 'Robot Süpürge Roborock S8 Pro Ultra', asin: 'B0CJNPMG8K',
    ourPrice: 22999, buyBoxPrice: 22499, buyBoxOwner: 'SmartHomeTR', won: false, winRate: 15,
    suggestedPrice: 22449, marketplace: 'Trendyol',
    competitors: [
      { name: 'SmartHomeTR', price: 22499, rating: 4.8, fba: true, deliveryDays: 1 },
      { name: 'EvOtomasyon', price: 22699, rating: 4.6, fba: true, deliveryDays: 1 },
      { name: 'RobotikMarket', price: 23199, rating: 4.4, fba: false, deliveryDays: 3 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 24499, buyBoxPrice: 23499 },
      { date: '05.07', ourPrice: 23999, buyBoxPrice: 22999 },
      { date: '09.07', ourPrice: 23699, buyBoxPrice: 22799 },
      { date: '13.07', ourPrice: 23499, buyBoxPrice: 22699 },
      { date: '17.07', ourPrice: 23299, buyBoxPrice: 22599 },
      { date: '21.07', ourPrice: 22999, buyBoxPrice: 22499 },
      { date: '25.07', ourPrice: 22999, buyBoxPrice: 22499 },
    ],
    reasoning: 'SmartHomeTR agresif fiyatlama yapıyor. 22.449₺\'ya düşürmek kazanma şansını %50\'ye çıkarabilir ama marjınız %12\'ye düşer.',
    lastUpdated: '25.07.2025 12:20',
  },
  {
    id: 'bb-011', name: 'JBL Charge 5 Bluetooth Hoparlör', asin: 'B097SRWHWZ',
    ourPrice: 3199, buyBoxPrice: 3199, buyBoxOwner: 'Biz', won: true, winRate: 82,
    suggestedPrice: 3199, marketplace: 'Hepsiburada',
    competitors: [
      { name: 'SesDünyası', price: 3299, rating: 4.5, fba: true, deliveryDays: 1 },
      { name: 'AudioPro', price: 3399, rating: 4.3, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 3399, buyBoxPrice: 3399 },
      { date: '05.07', ourPrice: 3349, buyBoxPrice: 3349 },
      { date: '09.07', ourPrice: 3299, buyBoxPrice: 3299 },
      { date: '13.07', ourPrice: 3249, buyBoxPrice: 3249 },
      { date: '17.07', ourPrice: 3199, buyBoxPrice: 3199 },
      { date: '21.07', ourPrice: 3199, buyBoxPrice: 3199 },
      { date: '25.07', ourPrice: 3199, buyBoxPrice: 3199 },
    ],
    reasoning: 'Stabil Buy Box performansı. Mevcut stratejiyi devam ettirin.',
    lastUpdated: '25.07.2025 12:05',
  },
  {
    id: 'bb-012', name: 'Sony WH-1000XM5 Kulaklık', asin: 'B09XS7JWHH',
    ourPrice: 9499, buyBoxPrice: 9299, buyBoxOwner: 'AudioWorld', won: false, winRate: 38,
    suggestedPrice: 9279, marketplace: 'Amazon',
    competitors: [
      { name: 'AudioWorld', price: 9299, rating: 4.9, fba: true, deliveryDays: 1 },
      { name: 'SesManya', price: 9399, rating: 4.6, fba: true, deliveryDays: 1 },
      { name: 'KulaklikMerkezi', price: 9599, rating: 4.4, fba: false, deliveryDays: 2 },
    ],
    priceHistory: [
      { date: '01.07', ourPrice: 9899, buyBoxPrice: 9699 },
      { date: '05.07', ourPrice: 9799, buyBoxPrice: 9599 },
      { date: '09.07', ourPrice: 9699, buyBoxPrice: 9499 },
      { date: '13.07', ourPrice: 9599, buyBoxPrice: 9399 },
      { date: '17.07', ourPrice: 9499, buyBoxPrice: 9349 },
      { date: '21.07', ourPrice: 9499, buyBoxPrice: 9299 },
      { date: '25.07', ourPrice: 9499, buyBoxPrice: 9299 },
    ],
    reasoning: 'AudioWorld sürekli altınızda. 9.279₺\'ya düşürmek Buy Box\'ı %70 kazanma şansı verir.',
    lastUpdated: '25.07.2025 11:50',
  },
];

/* ───────────── Custom Win Rate Bar ───────────── */
function WinRateBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className={cn('flex-1 h-2 rounded-full overflow-hidden', winRateTrack(rate))}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', winRateBg(rate))}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className={cn('text-xs font-bold w-9 text-right', winRateColor(rate))}>
        %{rate}
      </span>
    </div>
  );
}

/* ───────────── Marketplace Badge ───────────── */
function MarketplaceBadge({ marketplace }: { marketplace: string }) {
  const styles: Record<string, string> = {
    Amazon: 'bg-amber-100 text-amber-700 border-amber-200',
    Trendyol: 'bg-rose-100 text-rose-700 border-rose-200',
    Hepsiburada: 'bg-violet-100 text-violet-700 border-violet-200',
  };
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', styles[marketplace] || '')}>
      {marketplace}
    </Badge>
  );
}

/* ───────────── Buy Box Analysis Dialog ───────────── */
function AnalysisDialog({
  product,
  open,
  onOpenChange,
}: {
  product: BuyBoxProduct | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!product) return null;

  const allPrices = [
    { name: 'Biz', price: product.ourPrice, isUs: true },
    ...product.competitors.map(c => ({ name: c.name, price: c.price, isUs: false })),
  ].sort((a, b) => a.price - b.price);

  const minPrice = allPrices[0]?.price || 1;
  const maxPrice = allPrices[allPrices.length - 1]?.price || 1;
  const priceRange = maxPrice - minPrice || 1;

  const historyMin = Math.min(
    ...product.priceHistory.map(p => Math.min(p.ourPrice, p.buyBoxPrice))
  );
  const historyMax = Math.max(
    ...product.priceHistory.map(p => Math.max(p.ourPrice, p.buyBoxPrice))
  );
  const historyRange = historyMax - historyMin || 1;

  const priceDiff = product.ourPrice - product.buyBoxPrice;
  const suggestedDiff = product.suggestedPrice - product.buyBoxPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-emerald-600" />
            {product.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <MarketplaceBadge marketplace={product.marketplace} />
            <span className="text-slate-500">ASIN: {product.asin}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{product.lastUpdated}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-2">
          {/* Price Comparison Summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Bizim Fiyat</p>
              <p className="text-lg font-bold text-slate-800">{fmt(product.ourPrice)}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-600 mb-1">Buy Box Fiyatı</p>
              <p className="text-lg font-bold text-emerald-700">{fmt(product.buyBoxPrice)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-xs text-amber-600 mb-1">Önerilen Fiyat</p>
              <p className="text-lg font-bold text-amber-700">{fmt(product.suggestedPrice)}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Price Comparison Bars */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Rakip Fiyat Karşılaştırması
            </h4>
            <div className="space-y-3">
              {allPrices.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={cn('w-24 text-xs font-medium truncate', item.isUs ? 'text-emerald-700 font-bold' : 'text-slate-600')}>
                    {item.name}
                    {item.isUs && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">SIZ</span>}
                  </div>
                  <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
                    <div
                      className={cn(
                        'h-full rounded-md transition-all duration-700 flex items-center px-2',
                        item.isUs
                          ? item.price === product.buyBoxPrice ? 'bg-emerald-500' : 'bg-amber-500'
                          : item.price === product.buyBoxPrice ? 'bg-blue-500' : 'bg-slate-400'
                      )}
                      style={{ width: `${Math.max(20, ((item.price - minPrice + priceRange * 0.1) / (priceRange * 1.2)) * 100)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{fmt(item.price)}</span>
                    </div>
                  </div>
                  {item.price === product.buyBoxPrice && (
                    <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Price History Trend */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              Fiyat Geçmişi (Son 7 Gün)
            </h4>
            <div className="bg-slate-50 rounded-lg p-4">
              {/* Legend */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Bizim Fiyat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Buy Box Fiyatı</span>
                </div>
              </div>
              {/* Bars */}
              <div className="flex items-end gap-2 h-32">
                {product.priceHistory.map((point, idx) => {
                  const ourHeight = ((point.ourPrice - historyMin) / historyRange) * 100;
                  const bbHeight = ((point.buyBoxPrice - historyMin) / historyRange) * 100;
                  return (
                    <TooltipProvider key={idx}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1 flex items-end gap-[2px] cursor-default">
                            <div className="flex-1 flex flex-col items-center gap-[2px]">
                              <div
                                className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300 min-h-[4px]"
                                style={{ height: `${Math.max(4, ourHeight)}%` }}
                              />
                              <div
                                className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 min-h-[4px]"
                                style={{ height: `${Math.max(4, bbHeight)}%` }}
                              />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div>{point.date}</div>
                          <div className="text-emerald-600">Biz: {fmt(point.ourPrice)}</div>
                          <div className="text-blue-600">BB: {fmt(point.buyBoxPrice)}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
              {/* Date Labels */}
              <div className="flex gap-2 mt-1">
                {product.priceHistory.map((point, idx) => (
                  <div key={idx} className="flex-1 text-center text-[10px] text-slate-400">
                    {point.date}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Competitor Table */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Store className="h-4 w-4 text-slate-500" />
              Rakip Detayları
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-2.5 px-3 font-medium text-slate-600 text-xs">Satıcı</th>
                    <th className="text-right py-2.5 px-3 font-medium text-slate-600 text-xs">Fiyat</th>
                    <th className="text-center py-2.5 px-3 font-medium text-slate-600 text-xs">Puan</th>
                    <th className="text-center py-2.5 px-3 font-medium text-slate-600 text-xs">FBA</th>
                    <th className="text-center py-2.5 px-3 font-medium text-slate-600 text-xs">Teslimat</th>
                    <th className="text-center py-2.5 px-3 font-medium text-slate-600 text-xs">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-emerald-50/50 border-b">
                    <td className="py-2.5 px-3 font-semibold text-emerald-700 text-xs">Biz (Siz)</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 text-xs">{fmt(product.ourPrice)}</td>
                    <td className="py-2.5 px-3 text-center text-xs">—</td>
                    <td className="py-2.5 px-3 text-center"><Shield className="h-3.5 w-3.5 text-emerald-600 mx-auto" /></td>
                    <td className="py-2.5 px-3 text-center text-xs text-slate-600">—</td>
                    <td className="py-2.5 px-3 text-center">
                      {product.won
                        ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px] h-5">Kazandık</Badge>
                        : <Badge className="bg-red-100 text-red-700 text-[10px] h-5">Kaybettik</Badge>
                      }
                    </td>
                  </tr>
                  {product.competitors.map((comp, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-xs text-slate-700">{comp.name}</td>
                      <td className={cn('py-2.5 px-3 text-right text-xs font-medium', comp.price === product.buyBoxPrice ? 'text-blue-600' : 'text-slate-700')}>
                        {fmt(comp.price)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-0.5 text-xs">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          {comp.rating}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {comp.fba ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Truck className="h-3.5 w-3.5 text-blue-500 mx-auto" />
                              </TooltipTrigger>
                              <TooltipContent>Hızlı teslimat aktif</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-600">{comp.deliveryDays} gün</td>
                      <td className="py-2.5 px-3 text-center">
                        {comp.price === product.buyBoxPrice && (
                          <Trophy className="h-3.5 w-3.5 text-amber-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Suggested Price Reasoning */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Önerilen Strateji
            </h4>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Önerilen Fiyat: {fmt(product.suggestedPrice)}
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed">{product.reasoning}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1">
                      {priceDiff > 0 ? (
                        <>
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-600">Fiyat farkı: +{fmt(priceDiff)}</span>
                        </>
                      ) : priceDiff < 0 ? (
                        <>
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600">Fiyat farkı: {fmt(priceDiff)}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-slate-600">Fiyat farkı: yok</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      <span>Kazanma Oranı: %{product.winRate}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="h-4 w-4 mr-1.5" />
            {product.suggestedPrice !== product.ourPrice ? 'Önerilen Fiyatı Uygula' : 'Fiyatı Koru'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────── Sort Icon ───────────── */
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
  return sortDir === 'desc' ? <ChevronDown className="h-3 w-3 text-emerald-600" /> : <ChevronUp className="h-3 w-3 text-emerald-600" />;
}

/* ───────────── Main Component ───────────── */
export default function BuyBoxOptimizer() {
  const { sidebarOpen } = useAppStore();

  /* ── Filters ── */
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceRangeMin, setPriceRangeMin] = useState<string>('');
  const [priceRangeMax, setPriceRangeMax] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'winRate' | 'priceDiff' | 'name'>('winRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  /* ── Dialog ── */
  const [selectedProduct, setSelectedProduct] = useState<BuyBoxProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ── Strategy ── */
  const [strategy, setStrategy] = useState<StrategySettings>({
    targetMarketplace: 'all',
    pricingStrategy: 'balanced',
    minPrice: 0,
    maxPrice: 100000,
    autoRepricer: true,
    repricerInterval: '15min',
    minMarginPercent: 10,
    maxDailyChanges: 3,
  });

  /* ── Refreshing state ── */
  const [refreshing, setRefreshing] = useState(false);

  /* ── Filtered & Sorted Products ── */
  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    if (marketplaceFilter !== 'all') {
      result = result.filter(p => p.marketplace === marketplaceFilter);
    }
    if (statusFilter === 'won') {
      result = result.filter(p => p.won);
    } else if (statusFilter === 'lost') {
      result = result.filter(p => !p.won);
    }
    if (priceRangeMin) {
      result = result.filter(p => p.ourPrice >= parseFloat(priceRangeMin));
    }
    if (priceRangeMax) {
      result = result.filter(p => p.ourPrice <= parseFloat(priceRangeMax));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'winRate') cmp = a.winRate - b.winRate;
      else if (sortField === 'priceDiff') cmp = (a.ourPrice - a.buyBoxPrice) - (b.ourPrice - b.buyBoxPrice);
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'tr');
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [marketplaceFilter, statusFilter, priceRangeMin, priceRangeMax, searchQuery, sortField, sortDir]);

  /* ── Summary Stats ── */
  const stats = useMemo(() => {
    const total = MOCK_PRODUCTS.length;
    const wonCount = MOCK_PRODUCTS.filter(p => p.won).length;
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
    const avgPriceDiff = MOCK_PRODUCTS.reduce((sum, p) => sum + (p.ourPrice - p.buyBoxPrice), 0) / total;
    const suggestedCount = MOCK_PRODUCTS.filter(p => p.suggestedPrice !== p.ourPrice).length;
    return { total, winRate, avgPriceDiff, suggestedCount, wonCount };
  }, []);

  /* ── Handlers ── */
  const handleSort = (field: 'winRate' | 'priceDiff' | 'name') => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleOpenAnalysis = (product: BuyBoxProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };



  /* ── Marketplace Labels ── */
  const marketplaces = ['all', 'Amazon', 'Trendyol', 'Hepsiburada'] as const;
  const marketplaceLabels: Record<string, string> = { all: 'Tüm Pazaryerler', Amazon: 'Amazon', Trendyol: 'Trendyol', Hepsiburada: 'Hepsiburada' };

  /* ───────────── Render ───────────── */
  return (
    <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-emerald-600" />
            Buy Box Optimizasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Çok kanallı Buy Box takibi, rakip analizi ve otomatik fiyatlandırma
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0"
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
          {refreshing ? 'Yenileniyor...' : 'Verileri Yenile'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Ürün İzleniyor</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                <p className="text-xs text-slate-400 mt-1">{stats.wonCount} kazanan, {stats.total - stats.wonCount} kaybeden</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Buy Box Kazanma Oranı</p>
                <p className={cn('text-2xl font-bold mt-1', winRateColor(stats.winRate))}>
                  %{stats.winRate}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('flex-1 h-1.5 rounded-full', winRateTrack(stats.winRate))}>
                      <div
                        className={cn('h-full rounded-full transition-all', winRateBg(stats.winRate))}
                        style={{ width: `${stats.winRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{winRateLabel(stats.winRate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500">
                <Trophy className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Ort. Fiyat Farkı</p>
                <p className={cn('text-2xl font-bold mt-1', stats.avgPriceDiff > 0 ? 'text-red-600' : 'text-emerald-600')}>
                  {stats.avgPriceDiff > 0 ? '+' : ''}{fmtShort(stats.avgPriceDiff)}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  {stats.avgPriceDiff > 0 ? (
                    <><TrendingUp className="h-3 w-3 text-red-500" /> Buy Box üzerindeyiz</>
                  ) : stats.avgPriceDiff < 0 ? (
                    <><TrendingDown className="h-3 w-3 text-emerald-500" /> Buy Box altındayız</>
                  ) : (
                    <><Minus className="h-3 w-3 text-slate-400" /> Eşit fiyat</>
                  )}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Önerilen Fiyat Güncellemesi</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.suggestedCount}</p>
                <p className="text-xs text-slate-400 mt-1">ürün için fiyat önerisi mevcut</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Main Table / Strategy Settings */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table" className="gap-2">
            <Eye className="h-4 w-4" />
            Buy Box Takip Tablosu
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Strateji Ayarları
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Buy Box Table ─── */}
        <TabsContent value="table" className="space-y-4">
          {/* Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-0 lg:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Ürün adı veya ASIN ara..."
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Filter className="h-4 w-4 text-slate-400 hidden lg:block" />

                  {/* Marketplace Filter */}
                  <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Store className="h-4 w-4 mr-1.5 text-slate-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {marketplaces.map(m => (
                        <SelectItem key={m} value={m}>
                          {marketplaceLabels[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="won">Kazandık</SelectItem>
                      <SelectItem value="lost">Kaybettik</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min ₺"
                      value={priceRangeMin}
                      onChange={e => setPriceRangeMin(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-slate-400 text-sm">—</span>
                    <Input
                      type="number"
                      placeholder="Max ₺"
                      value={priceRangeMax}
                      onChange={e => setPriceRangeMax(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Active filters indicator */}
              {(marketplaceFilter !== 'all' || statusFilter !== 'all' || priceRangeMin || priceRangeMax || searchQuery) && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Aktif filtreler:</span>
                  {marketplaceFilter !== 'all' && (
                    <Badge variant="outline" className="text-xs h-5">{marketplaceLabels[marketplaceFilter]}</Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="outline" className="text-xs h-5">
                      {statusFilter === 'won' ? 'Kazandık' : 'Kaybettik'}
                    </Badge>
                  )}
                  {priceRangeMin && (
                    <Badge variant="outline" className="text-xs h-5">Min: {fmtShort(parseFloat(priceRangeMin))}</Badge>
                  )}
                  {priceRangeMax && (
                    <Badge variant="outline" className="text-xs h-5">Max: {fmtShort(parseFloat(priceRangeMax))}</Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="outline" className="text-xs h-5">Arama: &quot;{searchQuery}&quot;</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-xs text-slate-400 hover:text-slate-600 ml-auto"
                    onClick={() => {
                      setMarketplaceFilter('all');
                      setStatusFilter('all');
                      setPriceRangeMin('');
                      setPriceRangeMax('');
                      setSearchQuery('');
                    }}
                  >
                    Temizle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buy Box Status Table */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4">Ürün</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4">ASIN</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4">Pazaryer</TableHead>
                      <TableHead
                        className="text-xs font-semibold text-slate-600 py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort('priceDiff')}
                      >
                        <span className="inline-flex items-center gap-1">
                          Fiyat Farkı <SortIcon field="priceDiff" sortField={sortField} sortDir={sortDir} />
                        </span>
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4 text-right">Buy Box Sahibi</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4 text-center">Durum</TableHead>
                      <TableHead
                        className="text-xs font-semibold text-slate-600 py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort('winRate')}
                      >
                        <span className="inline-flex items-center gap-1">
                          Kazanma Oranı <SortIcon field="winRate" sortField={sortField} sortDir={sortDir} />
                        </span>
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4 text-right">Önerilen Fiyat</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 py-3 px-4 text-center">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <AlertTriangle className="h-8 w-8" />
                            <p className="text-sm font-medium">Sonuç bulunamadı</p>
                            <p className="text-xs">Filtrelerinizi değiştirmeyi deneyin</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map(product => {
                        const priceDiff = product.ourPrice - product.buyBoxPrice;
                        const suggestedChanged = product.suggestedPrice !== product.ourPrice;
                        return (
                          <TableRow
                            key={product.id}
                            className="cursor-pointer hover:bg-emerald-50/40 transition-colors"
                            onClick={() => handleOpenAnalysis(product)}
                          >
                            {/* Product Name */}
                            <TableCell className="py-3 px-4">
                              <div className="max-w-[220px]">
                                <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Biz: <span className="font-medium text-slate-600">{fmt(product.ourPrice)}</span>
                                  {' '}| BB: <span className="font-medium text-emerald-600">{fmt(product.buyBoxPrice)}</span>
                                </p>
                              </div>
                            </TableCell>

                            {/* ASIN */}
                            <TableCell className="py-3 px-4">
                              <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                {product.asin}
                              </code>
                            </TableCell>

                            {/* Marketplace */}
                            <TableCell className="py-3 px-4">
                              <MarketplaceBadge marketplace={product.marketplace} />
                            </TableCell>

                            {/* Price Diff */}
                            <TableCell className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className={cn('text-sm font-semibold', priceDiffColor(product.ourPrice, product.buyBoxPrice))}>
                                  {priceDiff > 0 ? '+' : ''}{fmt(priceDiff)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  %{((priceDiff / product.buyBoxPrice) * 100).toFixed(1)}
                                </span>
                              </div>
                            </TableCell>

                            {/* Buy Box Owner */}
                            <TableCell className="py-3 px-4 text-right">
                              <span className={cn('text-sm font-medium', product.buyBoxOwner === 'Biz' ? 'text-emerald-600' : 'text-slate-600')}>
                                {product.buyBoxOwner === 'Biz' ? 'Siz' : product.buyBoxOwner}
                              </span>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="py-3 px-4 text-center">
                              {product.won ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs h-6 px-2.5">
                                  <Check className="h-3 w-3 mr-1" />
                                  Kazandık
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs h-6 px-2.5">
                                  <X className="h-3 w-3 mr-1" />
                                  Kaybettik
                                </Badge>
                              )}
                            </TableCell>

                            {/* Win Rate */}
                            <TableCell className="py-3 px-4">
                              <WinRateBar rate={product.winRate} />
                            </TableCell>

                            {/* Suggested Price */}
                            <TableCell className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className={cn('text-sm font-semibold', suggestedChanged ? 'text-amber-600' : 'text-slate-500')}>
                                  {fmt(product.suggestedPrice)}
                                </span>
                                {suggestedChanged && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span className="text-[10px] text-amber-500 cursor-help flex items-center gap-0.5">
                                          <Zap className="h-2.5 w-2.5" />
                                          Güncelle
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Fiyatı {fmt(product.ourPrice)} → {fmt(product.suggestedPrice)} olarak güncelleyin</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>

                            {/* Action */}
                            <TableCell className="py-3 px-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAnalysis(product);
                                }}
                              >
                                <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                                Analiz
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Table Footer */}
              {filteredProducts.length > 0 && (
                <div className="px-4 py-3 border-t bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Toplam <strong className="text-slate-700">{filteredProducts.length}</strong> ürün gösteriliyor
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Buy Box Sahibi
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Buy Box Dışı
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Strategy Settings ─── */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Strategy Configuration */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  Strateji Yapılandırması
                </CardTitle>
                <CardDescription>Buy Box kazanma stratejinizi özelleştirin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Target Marketplace */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Hedef Pazaryer</label>
                  <Select
                    value={strategy.targetMarketplace}
                    onValueChange={v => setStrategy(s => ({ ...s, targetMarketplace: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Pazaryerler</SelectItem>
                      <SelectItem value="Amazon">Amazon</SelectItem>
                      <SelectItem value="Trendyol">Trendyol</SelectItem>
                      <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400">Hangi pazaryerlerde Buy Box takibi yapılacağını belirleyin</p>
                </div>

                {/* Pricing Strategy */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Fiyatlandırma Stratejisi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'aggressive', label: 'Agresif', desc: 'En düşük fiyat', color: 'border-red-200 bg-red-50 text-red-700' },
                      { value: 'balanced', label: 'Dengeli', desc: 'Optimum denge', color: 'border-amber-200 bg-amber-50 text-amber-700' },
                      { value: 'conservative', label: 'Muhafazakar', desc: 'Kar marjı öncelikli', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setStrategy(s => ({ ...s, pricingStrategy: opt.value }))}
                        className={cn(
                          'rounded-lg border-2 p-3 text-center transition-all',
                          strategy.pricingStrategy === opt.value
                            ? cn(opt.color, 'ring-2 ring-offset-1', opt.value === 'aggressive' ? 'ring-red-300' : opt.value === 'balanced' ? 'ring-amber-300' : 'ring-emerald-300')
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        )}
                      >
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-80">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Boundaries */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Fiyat Sınırları</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Minimum Fiyat (₺)</label>
                      <Input
                        type="number"
                        value={strategy.minPrice}
                        onChange={e => setStrategy(s => ({ ...s, minPrice: +e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Maksimum Fiyat (₺)</label>
                      <Input
                        type="number"
                        value={strategy.maxPrice}
                        onChange={e => setStrategy(s => ({ ...s, maxPrice: +e.target.value }))}
                        placeholder="100.000"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Otomatik fiyat güncellemeleri bu sınırlar içinde kalacaktır</p>
                </div>

                {/* Min Margin */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Minimum Kar Marjı (%)</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={strategy.minMarginPercent}
                      onChange={e => setStrategy(s => ({ ...s, minMarginPercent: +e.target.value }))}
                      className="w-24"
                      min={0}
                      max={100}
                    />
                    <Progress value={strategy.minMarginPercent} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-slate-700 w-8 text-right">%{strategy.minMarginPercent}</span>
                  </div>
                  <p className="text-xs text-slate-400">Bu marjın altına düşen fiyat önerileri uygulanmayacaktır</p>
                </div>

                {/* Max Daily Changes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Günlük Maks. Fiyat Değişikliği</label>
                  <Input
                    type="number"
                    value={strategy.maxDailyChanges}
                    onChange={e => setStrategy(s => ({ ...s, maxDailyChanges: +e.target.value }))}
                    className="w-32"
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-slate-400">Bir üründe günlük yapılacak maksimum fiyat güncelleme sayısı</p>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Repricer Settings */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Otomatik Fiyatlandırma
                  </CardTitle>
                  <CardDescription>Bot tabanlı otomatik fiyat güncelleme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Auto Repricer Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Otomatik Repricer</p>
                      <p className="text-xs text-slate-400 mt-0.5">Buy Box kazanmak için fiyatlari otomatik güncelle</p>
                    </div>
                    <Switch
                      checked={strategy.autoRepricer}
                      onCheckedChange={checked => setStrategy(s => ({ ...s, autoRepricer: checked }))}
                    />
                  </div>

                  {/* Repricer Interval */}
                  <div className={cn('space-y-2 transition-opacity', !strategy.autoRepricer && 'opacity-50 pointer-events-none')}>
                    <label className="text-sm font-medium text-slate-700">Güncelleme Aralığı</label>
                    <Select
                      value={strategy.repricerInterval}
                      onValueChange={v => setStrategy(s => ({ ...s, repricerInterval: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <RefreshCw className="h-4 w-4 mr-1.5 text-slate-400" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5min">Her 5 dakika</SelectItem>
                        <SelectItem value="15min">Her 15 dakika</SelectItem>
                        <SelectItem value="30min">Her 30 dakika</SelectItem>
                        <SelectItem value="1hour">Her 1 saat</SelectItem>
                        <SelectItem value="6hour">Her 6 saat</SelectItem>
                        <SelectItem value="12hour">Her 12 saat</SelectItem>
                        <SelectItem value="24hour">Her 24 saat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Strategy Summary */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Aktif Strateji Özeti
                    </h4>
                    <div className="space-y-2 text-sm text-emerald-700">
                      <div className="flex justify-between">
                        <span>Pazaryer:</span>
                        <span className="font-medium">{marketplaceLabels[strategy.targetMarketplace]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Strateji:</span>
                        <span className="font-medium">
                          {strategy.pricingStrategy === 'aggressive' ? 'Agresif' : strategy.pricingStrategy === 'balanced' ? 'Dengeli' : 'Muhafazakar'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Repricer:</span>
                        <span className={cn('font-medium', strategy.autoRepricer ? 'text-emerald-600' : 'text-red-600')}>
                          {strategy.autoRepricer ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aralık:</span>
                        <span className="font-medium">
                          {strategy.repricerInterval === '5min' ? '5 dk' :
                           strategy.repricerInterval === '15min' ? '15 dk' :
                           strategy.repricerInterval === '30min' ? '30 dk' :
                           strategy.repricerInterval === '1hour' ? '1 saat' :
                           strategy.repricerInterval === '6hour' ? '6 saat' :
                           strategy.repricerInterval === '12hour' ? '12 saat' : '24 saat'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Marj:</span>
                        <span className="font-medium">%{strategy.minMarginPercent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Ayarları Kaydet
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Sıfırla
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    Performans Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['Amazon', 'Trendyol', 'Hepsiburada'] as const).map(mp => {
                      const mpProducts = MOCK_PRODUCTS.filter(p => p.marketplace === mp);
                      const mpWon = mpProducts.filter(p => p.won).length;
                      const mpRate = mpProducts.length > 0 ? Math.round((mpWon / mpProducts.length) * 100) : 0;
                      return (
                        <div key={mp} className="flex items-center gap-3">
                          <div className="w-24 text-xs font-medium text-slate-600">{mp}</div>
                          <div className="flex-1">
                            <div className={cn('h-2 rounded-full overflow-hidden', winRateTrack(mpRate))}>
                              <div
                                className={cn('h-full rounded-full transition-all', winRateBg(mpRate))}
                                style={{ width: `${mpRate}%` }}
                              />
                            </div>
                          </div>
                          <div className={cn('text-xs font-bold w-16 text-right', winRateColor(mpRate))}>
                            %{mpRate}
                          </div>
                          <div className="text-[10px] text-slate-400 w-14 text-right">
                            {mpWon}/{mpProducts.length}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Analysis Dialog */}
      <AnalysisDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
