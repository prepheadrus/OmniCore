'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Target, Zap, BarChart3, RefreshCw,
  Check, X, AlertTriangle, ArrowRight, ChevronUp, ChevronDown, Minus,
  ShoppingCart, Store, Star, Truck, Shield, Eye, Settings, SlidersHorizontal,
  Filter, Search, ArrowUpDown, Package, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

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
  }
];

/* ───────────── Custom UI Components ───────────── */
function WinRateBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className={`flex-1 h-2 rounded-full overflow-hidden ${winRateTrack(rate)}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${winRateBg(rate)}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${winRateColor(rate)}`}>
        %{rate}
      </span>
    </div>
  );
}

function MarketplaceBadge({ marketplace }: { marketplace: string }) {
  const styles: Record<string, string> = {
    Amazon: 'bg-amber-100 text-amber-700 border-amber-200',
    Trendyol: 'bg-rose-100 text-rose-700 border-rose-200',
    Hepsiburada: 'bg-violet-100 text-violet-700 border-violet-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[marketplace] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {marketplace}
    </span>
  );
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
  return sortDir === 'desc' ? <ChevronDown className="h-3 w-3 text-emerald-600" /> : <ChevronUp className="h-3 w-3 text-emerald-600" />;
}

/* ───────────── Analysis Dialog ───────────── */
function AnalysisDialog({
  product,
  open,
  onOpenChange,
}: {
  product: BuyBoxProduct | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!open || !product) return null;

  const allPrices = [
    { name: 'Biz', price: product.ourPrice, isUs: true },
    ...product.competitors.map(c => ({ name: c.name, price: c.price, isUs: false })),
  ].sort((a, b) => a.price - b.price);

  const minPrice = allPrices[0]?.price || 1;
  const maxPrice = allPrices[allPrices.length - 1]?.price || 1;
  const priceRange = maxPrice - minPrice || 1;

  const priceDiff = product.ourPrice - product.buyBoxPrice;
  const suggestedChanged = product.suggestedPrice !== product.ourPrice;

  // Line chart data formatting
  const chartData = product.priceHistory.map(p => ({
    name: p.date,
    ourPrice: p.ourPrice,
    buyBoxPrice: p.buyBoxPrice
  }));

  const historyMin = Math.min(...chartData.map(d => Math.min(d.ourPrice, d.buyBoxPrice)));
  const historyMax = Math.max(...chartData.map(d => Math.max(d.ourPrice, d.buyBoxPrice)));
  const yDomain = [Math.floor(historyMin * 0.98), Math.ceil(historyMax * 1.02)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <MarketplaceBadge marketplace={product.marketplace} />
              <span className="text-xs text-slate-500 font-mono">ASIN: {product.asin}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Son: {product.lastUpdated}</span>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded transition-colors"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* Price Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bizim Fiyat</p>
              <p className="text-2xl font-bold text-slate-800">{fmt(product.ourPrice)}</p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Buy Box Fiyatı</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(product.buyBoxPrice)}</p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Önerilen Fiyat</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(product.suggestedPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitor Bars */}
            <div className="rounded-md border border-slate-200 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-500" /> Rakip Fiyat Karşılaştırması
              </h4>
              <div className="space-y-4">
                {allPrices.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-28 text-xs font-medium truncate ${item.isUs ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                      {item.name}
                      {item.isUs && <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded-full uppercase tracking-wider">SİZ</span>}
                    </div>
                    <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden relative">
                      <div
                        className={`h-full rounded transition-all duration-700 flex items-center px-2 ${
                          item.isUs
                            ? item.price === product.buyBoxPrice ? 'bg-emerald-500' : 'bg-amber-500'
                            : item.price === product.buyBoxPrice ? 'bg-blue-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(15, ((item.price - minPrice + priceRange * 0.1) / (priceRange * 1.2)) * 100)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{fmt(item.price)}</span>
                      </div>
                    </div>
                    {item.price === product.buyBoxPrice ? (
                      <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : (
                      <div className="w-4 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price History Chart */}
            <div className="rounded-md border border-slate-200 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" /> Fiyat Geçmişi (Son 7 Gün)
              </h4>
              <div className="h-48">
                <div style={{ width: "100%", height: "100%", minHeight: 300 }}><ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                    <YAxis domain={yDomain} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" tickFormatter={(v) => `₺${v}`} />
                    <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    <Bar dataKey="ourPrice" name="Bizim Fiyat" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} />
                    <Bar dataKey="buyBoxPrice" name="Buy Box Fiyatı" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer></div>
              </div>
            </div>
          </div>

          {/* Competitor Detail Table */}
          <div className="rounded-md border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Store className="h-4 w-4 text-slate-500" /> Satıcı Analizi
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="py-2 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Satıcı</th>
                    <th className="py-2 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Fiyat</th>
                    <th className="py-2 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Puan</th>
                    <th className="py-2 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">FBA / Hızlı Teslimat</th>
                    <th className="py-2 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Teslimat</th>
                    <th className="py-2 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/50">
                    <td className="py-2 px-4 font-bold text-emerald-700 text-xs">Biz (Siz)</td>
                    <td className="py-2 px-4 text-right font-bold text-emerald-700 text-xs">{fmt(product.ourPrice)}</td>
                    <td className="py-2 px-4 text-center text-xs text-slate-400">—</td>
                    <td className="py-2 px-4 text-center"><Shield className="h-3.5 w-3.5 text-emerald-600 mx-auto" /></td>
                    <td className="py-2 px-4 text-center text-xs text-slate-500">—</td>
                    <td className="py-2 px-4 text-center">
                      {product.won
                        ? <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Kazandık</span>
                        : <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Kaybettik</span>
                      }
                    </td>
                  </tr>
                  {product.competitors.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-4 text-xs font-medium text-slate-700">{comp.name}</td>
                      <td className={`py-2 px-4 text-right text-xs font-bold ${comp.price === product.buyBoxPrice ? 'text-blue-600' : 'text-slate-700'}`}>
                        {fmt(comp.price)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-600">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {comp.rating}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {comp.fba ? <Truck className="h-3.5 w-3.5 text-blue-500 mx-auto" /> : <Minus className="h-3.5 w-3.5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-2 px-4 text-center text-xs font-medium text-slate-600">{comp.deliveryDays} gün</td>
                      <td className="py-2 px-4 text-center">
                        {comp.price === product.buyBoxPrice && <Trophy className="h-3.5 w-3.5 text-amber-500 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategy Reasoning */}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-md shrink-0"><Zap className="h-5 w-5 text-amber-600" /></div>
              <div>
                <h4 className="text-sm font-bold text-amber-800 mb-1">Önerilen Fiyat Stratejisi: {fmt(product.suggestedPrice)}</h4>
                <p className="text-sm text-amber-700 leading-relaxed mb-3">{product.reasoning}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-amber-200 text-slate-700">
                    {priceDiff > 0 ? <TrendingDown className="h-3.5 w-3.5 text-red-500" /> : priceDiff < 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <Minus className="h-3.5 w-3.5 text-slate-400" />}
                    Fiyat Farkı: {priceDiff > 0 ? '+' : ''}{fmt(priceDiff)}
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-amber-200 text-slate-700">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    Mevcut Kazanma: %{product.winRate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={() => onOpenChange(false)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors shadow-sm">
            Kapat
          </button>
          <button 
            onClick={() => onOpenChange(false)} 
            className={`px-5 py-2.5 text-white text-sm font-medium rounded-md transition-colors shadow-sm flex items-center gap-2 ${suggestedChanged ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <Check className="h-4 w-4" /> {suggestedChanged ? 'Önerilen Fiyatı Uygula' : 'Fiyatı Koru'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Main Component ───────────── */
export default function BuyBoxOptimizer() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'table'|'settings'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BuyBoxProduct | null>(null);

  /* ── Filters ── */
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'winRate' | 'priceDiff' | 'name'>('winRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleSort = (field: 'winRate' | 'priceDiff' | 'name') => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleOpenAnalysis = (product: BuyBoxProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    if (marketplaceFilter !== 'all') result = result.filter(p => p.marketplace === marketplaceFilter);
    if (statusFilter === 'won') result = result.filter(p => p.won);
    else if (statusFilter === 'lost') result = result.filter(p => !p.won);
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
  }, [marketplaceFilter, statusFilter, searchQuery, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = MOCK_PRODUCTS.length;
    const wonCount = MOCK_PRODUCTS.filter(p => p.won).length;
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
    const avgPriceDiff = total > 0 ? MOCK_PRODUCTS.reduce((sum, p) => sum + (p.ourPrice - p.buyBoxPrice), 0) / total : 0;
    const suggestedCount = MOCK_PRODUCTS.filter(p => p.suggestedPrice !== p.ourPrice).length;
    return { total, winRate, avgPriceDiff, suggestedCount, wonCount };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-md" />)}
          </div>
          <div className="h-96 rounded-md bg-slate-200 mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            Buy Box Optimizasyonu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Çok kanallı Buy Box takibi, rakip analizi ve otomatik fiyatlandırma</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Yenileniyor...' : 'Verileri Yenile'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">İzlenen Ürün</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.wonCount} kazanan, {stats.total - stats.wonCount} kaybeden</p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <ShoppingCart className="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kazanma Oranı</p>
              <div className="p-1.5 rounded-md bg-amber-50 border border-amber-100"><Trophy className="h-3.5 w-3.5 text-amber-600" /></div>
            </div>
            <p className={`text-2xl font-bold ${winRateColor(stats.winRate)}`}>%{stats.winRate}</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div className={`h-1.5 rounded-full ${winRateBg(stats.winRate)}`} style={{ width: `${stats.winRate}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ort. Fiyat Farkı</p>
            <p className={`text-2xl font-bold mt-2 ${stats.avgPriceDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {stats.avgPriceDiff > 0 ? '+' : ''}{fmtShort(stats.avgPriceDiff)}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {stats.avgPriceDiff > 0 ? <><TrendingUp className="h-3 w-3 text-red-500" /> BB üzerindeyiz</> : stats.avgPriceDiff < 0 ? <><TrendingDown className="h-3 w-3 text-emerald-500" /> BB altındayız</> : <><Minus className="h-3 w-3 text-slate-400" /> Eşit</>}
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-800 border border-slate-700">
            <BarChart3 className="h-5 w-5 text-slate-200" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fiyat Önerisi</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.suggestedCount}</p>
            <p className="text-xs text-slate-400 mt-1">ürün için öneri mevcut</p>
          </div>
          <div className="p-2.5 rounded-md bg-violet-50 border border-violet-100">
            <Zap className="h-5 w-5 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'table', label: 'Buy Box Takip Tablosu', icon: Eye },
          { id: 'settings', label: 'Strateji Ayarları', icon: Settings },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Table */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Ürün adı veya ASIN ara..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative w-full sm:w-40">
                <select value={marketplaceFilter} onChange={e => setMarketplaceFilter(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
                  <option value="all">Tüm Pazar Yerleri</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Trendyol">Trendyol</option>
                  <option value="Hepsiburada">Hepsiburada</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative w-full sm:w-36">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 bg-white">
                  <option value="all">Tüm Durumlar</option>
                  <option value="won">Kazandık</option>
                  <option value="lost">Kaybettik</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Ürün</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">ASIN</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Pazaryeri</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right cursor-pointer hover:text-slate-800" onClick={() => handleSort('priceDiff')}>
                    <span className="flex items-center justify-end gap-1">Fiyat Farkı <SortIcon field="priceDiff" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">BB Sahibi</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Durum</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:text-slate-800" onClick={() => handleSort('winRate')}>
                    <span className="flex items-center gap-1">Kazanma Oranı <SortIcon field="winRate" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Önerilen</th>
                  <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <AlertTriangle className="h-10 w-10 text-slate-300 mx-auto mb-3 opacity-50" />
                      Kriterlere uygun ürün bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const priceDiff = product.ourPrice - product.buyBoxPrice;
                    const suggestedChanged = product.suggestedPrice !== product.ourPrice;
                    return (
                      <tr key={product.id} onClick={() => handleOpenAnalysis(product)} className="hover:bg-emerald-50/40 transition-colors cursor-pointer">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={product.name}>{product.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-wide">
                            BİZ: <span className="text-slate-600">{fmt(product.ourPrice)}</span> <span className="mx-1">|</span> BB: <span className="text-emerald-600">{fmt(product.buyBoxPrice)}</span>
                          </p>
                        </td>
                        <td className="py-3 px-4"><code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">{product.asin}</code></td>
                        <td className="py-3 px-4"><MarketplaceBadge marketplace={product.marketplace} /></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-bold ${priceDiffColor(product.ourPrice, product.buyBoxPrice)}`}>{priceDiff > 0 ? '+' : ''}{fmt(priceDiff)}</span>
                            <span className="text-[10px] font-medium text-slate-400 mt-0.5">%{(priceDiff / product.buyBoxPrice * 100).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          <span className={product.buyBoxOwner === 'Biz' ? 'text-emerald-600 font-bold' : 'text-slate-600'}>{product.buyBoxOwner === 'Biz' ? 'SİZ' : product.buyBoxOwner}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {product.won ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"><Check className="w-3 h-3"/>Kazandık</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200"><X className="w-3 h-3"/>Kaybettik</span>
                          )}
                        </td>
                        <td className="py-3 px-4"><WinRateBar rate={product.winRate} /></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`font-bold ${suggestedChanged ? 'text-amber-600' : 'text-slate-600'}`}>{fmt(product.suggestedPrice)}</span>
                            {suggestedChanged && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-500 uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded"><Zap className="w-2.5 h-2.5"/> Güncelle</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenAnalysis(product); }} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded transition-colors" title="Analiz">
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Analiz
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredProducts.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 flex justify-between items-center">
              <span>Toplam <strong className="text-slate-700">{filteredProducts.length}</strong> ürün listeleniyor</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-emerald-600" /> Strateji Yapılandırması</h3>
            <p className="text-sm text-slate-500 mb-6">Buy Box kazanma stratejinizi özelleştirin</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Hedef Pazaryeri</label>
                <div className="relative">
                  <select value={strategy.targetMarketplace} onChange={e => setStrategy(s => ({ ...s, targetMarketplace: e.target.value }))} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white">
                    <option value="all">Tüm Pazaryerleri</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Trendyol">Trendyol</option>
                    <option value="Hepsiburada">Hepsiburada</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Fiyatlandırma Stratejisi</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'aggressive', label: 'Agresif', desc: 'En düşük fiyat', color: 'border-red-200 bg-red-50 text-red-700' },
                    { value: 'balanced', label: 'Dengeli', desc: 'Optimum denge', color: 'border-amber-200 bg-amber-50 text-amber-700' },
                    { value: 'conservative', label: 'Muhafazakar', desc: 'Kar marjı öncelikli', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setStrategy(s => ({ ...s, pricingStrategy: opt.value as any }))} className={`rounded-md border p-3 text-center transition-all ${strategy.pricingStrategy === opt.value ? `${opt.color} ring-2 ring-offset-1 ${opt.value === 'aggressive' ? 'ring-red-300' : opt.value === 'balanced' ? 'ring-amber-300' : 'ring-emerald-300'}` : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}>
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-[10px] font-medium mt-1 opacity-80">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Min Fiyat (₺)</label>
                  <input type="number" value={strategy.minPrice} onChange={e => setStrategy(s => ({ ...s, minPrice: +e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Max Fiyat (₺)</label>
                  <input type="number" value={strategy.maxPrice} onChange={e => setStrategy(s => ({ ...s, maxPrice: +e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Min Kar Marjı (%)</label>
                  <input type="number" value={strategy.minMarginPercent} onChange={e => setStrategy(s => ({ ...s, minMarginPercent: +e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Günlük Max Değişiklik</label>
                  <input type="number" value={strategy.maxDailyChanges} onChange={e => setStrategy(s => ({ ...s, maxDailyChanges: +e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-amber-500" /> Otomatik Fiyatlandırma</h3>
            <p className="text-sm text-slate-500 mb-6">Bot tabanlı otomatik fiyat güncelleme</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-md bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-800">Otomatik Repricer</p>
                  <p className="text-xs text-slate-500 mt-1">Buy Box kazanmak için fiyatları otomatik güncelle</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={strategy.autoRepricer} onChange={e => setStrategy(s => ({ ...s, autoRepricer: e.target.checked }))} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className={`transition-opacity ${strategy.autoRepricer ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Güncelleme Aralığı</label>
                <div className="relative">
                  <select value={strategy.repricerInterval} onChange={e => setStrategy(s => ({ ...s, repricerInterval: e.target.value }))} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white">
                    <option value="5min">Her 5 dakika</option>
                    <option value="15min">Her 15 dakika</option>
                    <option value="30min">Her 30 dakika</option>
                    <option value="1hour">Her 1 saat</option>
                    <option value="6hour">Her 6 saat</option>
                    <option value="12hour">Her 12 saat</option>
                    <option value="24hour">Her 24 saat</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 mt-6">
                <h4 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2"><Check className="h-4 w-4" /> Aktif Strateji Özeti</h4>
                <div className="space-y-3 text-sm text-emerald-700">
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="font-medium">Strateji:</span>
                    <span className="font-bold">{strategy.pricingStrategy === 'aggressive' ? 'Agresif' : strategy.pricingStrategy === 'balanced' ? 'Dengeli' : 'Muhafazakar'}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="font-medium">Repricer:</span>
                    <span className={`font-bold ${strategy.autoRepricer ? 'text-emerald-700' : 'text-red-600'}`}>{strategy.autoRepricer ? 'Aktif' : 'Pasif'}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="font-medium">Güncelleme:</span>
                    <span className="font-bold">{strategy.repricerInterval.replace('min', ' dk').replace('hour', ' saat')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Min Kar Marjı:</span>
                    <span className="font-bold">%{strategy.minMarginPercent}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" /> Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Dialog */}
      <AnalysisDialog product={selectedProduct} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
