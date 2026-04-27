'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Target, BarChart3, ArrowUpRight,
  ArrowDownRight, Minus, PieChart, Percent, ShoppingCart, Package, Calculator
} from 'lucide-react';
import Link from 'next/link';

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
  trendyol: '#f27a1a', hepsiburada: '#ff6000', 'amazon tr': '#ff9900', n11: '#5c3ebf',
};

function roiColor(roi: number) { return roi > 40 ? 'text-emerald-600' : roi > 20 ? 'text-blue-600' : roi > 0 ? 'text-amber-600' : 'text-red-600'; }
function roiBadge(roi: number) { return roi > 40 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : roi > 20 ? 'bg-blue-50 text-blue-700 border border-blue-200' : roi > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'; }

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_DATA = {
  summary: {
    totalRevenue: 1250000,
    totalCost: 750000,
    totalCommission: 187500,
    totalCargo: 62500,
    totalNetProfit: 250000,
    totalROI: 33.3,
    totalOrders: 4150,
    avgOrderValue: 301.20,
    bestChannel: null,
    worstChannel: null
  },
  channelROI: [
    { channel: 'trendyol', channelName: 'Trendyol', revenue: 750000, cost: 450000, commission: 112500, cargo: 37500, netProfit: 150000, roi: 33.3, margin: 20, avgOrderValue: 300, costPerOrder: 108.43, commissionRate: 0.15, orders: 2500, tax: 0, discount: 0 },
    { channel: 'hepsiburada', channelName: 'Hepsiburada', revenue: 350000, cost: 210000, commission: 42000, cargo: 17500, netProfit: 80500, roi: 38.3, margin: 23, avgOrderValue: 318, costPerOrder: 110, commissionRate: 0.12, orders: 1100, tax: 0, discount: 0 },
    { channel: 'n11', channelName: 'N11', revenue: 150000, cost: 90000, commission: 15000, cargo: 7500, netProfit: 37500, roi: 41.6, margin: 25, avgOrderValue: 272, costPerOrder: 100, commissionRate: 0.10, orders: 550, tax: 0, discount: 0 }
  ],
  productROI: [
    { productId: 'p1', productName: 'Akıllı Saat X Pro', sku: 'AS-XP-01', channel: 'trendyol', channelName: 'Trendyol', category: 'Elektronik', revenue: 45000, cost: 25000, commission: 6750, cargoCost: 2000, netProfit: 11250, roi: 45.0, margin: 25.0 },
    { productId: 'p2', productName: 'Kablosuz Kulaklık Y', sku: 'KK-Y-02', channel: 'hepsiburada', channelName: 'Hepsiburada', category: 'Elektronik', revenue: 28000, cost: 15000, commission: 3360, cargoCost: 1500, netProfit: 8140, roi: 54.2, margin: 29.0 },
    { productId: 'p3', productName: 'Spor Ayakkabı Z', sku: 'SA-Z-03', channel: 'trendyol', channelName: 'Trendyol', category: 'Giyim', revenue: 12000, cost: 8000, commission: 1800, cargoCost: 1000, netProfit: 1200, roi: 15.0, margin: 10.0 },
    { productId: 'p4', productName: 'Kamp Çadırı W', sku: 'KC-W-04', channel: 'n11', channelName: 'N11', category: 'Outdoor', revenue: 5000, cost: 4000, commission: 500, cargoCost: 800, netProfit: -300, roi: -7.5, margin: -6.0 }
  ],
  monthlyData: [
    { month: 'Ocak', revenue: 200000, cost: 120000, commission: 30000, cargo: 10000, netProfit: 40000, orders: 700 },
    { month: 'Şubat', revenue: 220000, cost: 130000, commission: 33000, cargo: 11000, netProfit: 46000, orders: 750 },
    { month: 'Mart', revenue: 250000, cost: 150000, commission: 37500, cargo: 12500, netProfit: 50000, orders: 820 },
    { month: 'Nisan', revenue: 280000, cost: 165000, commission: 42000, cargo: 14000, netProfit: 59000, orders: 900 },
    { month: 'Mayıs', revenue: 300000, cost: 185000, commission: 45000, cargo: 15000, netProfit: 55000, orders: 980 }
  ]
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ROIProfit() {
  const [data, setData] = useState<{ summary: Summary; channelROI: ChannelROI[]; productROI: ProductROI[]; monthlyData: MonthlyData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels'|'products'|'monthly'>('channels');

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="h-80 rounded-md bg-slate-200" />
        </div>
      </div>
    );
  }

  const { summary, channelROI, productROI, monthlyData } = data;

  const bestProducts = [...productROI].sort((a, b) => b.roi - a.roi).slice(0, 10);
  const worstProducts = [...productROI].sort((a, b) => a.roi - b.roi).slice(0, 10);
  const maxRevenue = Math.max(...channelROI.map(c => c.revenue), 1);
  const maxProfit = Math.max(...monthlyData.map(m => Math.abs(m.netProfit)), 1);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            ROI &amp; Kar Analizi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kanal ve ürün bazlı karlılık analizi</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/profit-simulator"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4 text-violet-600" />
            Kar Marjı Simülatörü
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Toplam Gelir</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 border border-blue-100"><DollarSign className="h-4 w-4 text-blue-600" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{fmt(summary.totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">{fmtNum(summary.totalOrders)} sipariş</p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Net Kar</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 border border-emerald-100"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
          </div>
          <p className={`text-2xl font-bold ${summary.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(summary.totalNetProfit)}</p>
          <p className="text-xs text-slate-400 mt-1">Komisyon: {fmt(summary.totalCommission)}</p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Genel ROI</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-50 border border-violet-100"><Percent className="h-4 w-4 text-violet-600" /></div>
          </div>
          <p className={`text-2xl font-bold ${roiColor(summary.totalROI)}`}>{summary.totalROI.toFixed(1)}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(summary.totalROI, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ort. Sipariş Değeri</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 border border-amber-100"><ShoppingCart className="h-4 w-4 text-amber-600" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{fmt(summary.avgOrderValue)}</p>
          <p className="text-xs text-slate-400 mt-1">Kargo: {fmt(summary.totalCargo)}</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'channels', label: 'Kanal Analizi', icon: PieChart },
          { id: 'products', label: 'Ürün Karlılığı', icon: Package },
          { id: 'monthly', label: 'Aylık Trend', icon: BarChart3 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Channel Analysis */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Channel Comparison */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-5">Kanal Bazlı Gelir Karşılaştırması</h3>
            <div className="space-y-6">
              {channelROI.map(ch => {
                const color = CHANNEL_COLORS[ch.channel] || '#64748b';
                return (
                  <div key={ch.channel} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-slate-700">{ch.channelName}</span>
                        <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">{ch.orders} sipariş</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-500">Gelir: {fmt(ch.revenue)}</span>
                        <span className="text-xs font-medium text-slate-500">Komisyon: {fmt(ch.commission)} ({(ch.commissionRate * 100).toFixed(0)}%)</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${roiBadge(ch.roi)}`}>ROI %{ch.roi}</span>
                      </div>
                    </div>
                    {/* Revenue bar */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(ch.netProfit / ch.revenue) * 100}%` }} title={`Net Kar: ${fmt(ch.netProfit)}`} />
                      <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(ch.cost / ch.revenue) * 100}%` }} title={`Maliyet: ${fmt(ch.cost)}`} />
                      <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${(ch.commission / ch.revenue) * 100}%` }} title={`Komisyon: ${fmt(ch.commission)}`} />
                    </div>
                    <div className="flex gap-4 text-[10px] font-medium text-slate-400">
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Net Kar</span>
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Maliyet</span>
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" /> Komisyon</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Detail Table */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-800">Detaylı Kanal Raporu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 font-medium text-slate-500">Kanal</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">Gelir</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">Maliyet</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">Komisyon</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">Kargo</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">Net Kar</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">ROI %</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-right">Marj %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {channelROI.map(ch => (
                    <tr key={ch.channel} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{ch.channelName}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">{fmt(ch.revenue)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{fmt(ch.cost)}</td>
                      <td className="py-3 px-4 text-right text-red-500">-{fmt(ch.commission)}</td>
                      <td className="py-3 px-4 text-right text-red-500">-{fmt(ch.cargo)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${ch.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(ch.netProfit)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${roiColor(ch.roi)}`}>{ch.roi.toFixed(1)}%</td>
                      <td className={`py-3 px-4 text-right font-medium ${ch.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{ch.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Product Profitability */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Most Profitable */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-semibold text-slate-800">En Karlı Ürünler</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs">Ürün</th>
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs">Kanal</th>
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs text-right">Net Kar</th>
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bestProducts.map(p => (
                    <tr key={p.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-800 max-w-[160px] truncate" title={p.productName}>{p.productName}</td>
                      <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-500">{p.channelName}</span></td>
                      <td className={`py-2.5 px-4 text-right font-semibold ${p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(p.netProfit)}</td>
                      <td className="py-2.5 px-4 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${roiBadge(p.roi)}`}>{p.roi.toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Least Profitable */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-500" />
              <h3 className="text-base font-semibold text-slate-800">En Az Karlı / Zarar Eden Ürünler</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs">Ürün</th>
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs">Kanal</th>
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs text-right">Net Kar</th>
                    <th className="py-2.5 px-4 font-medium text-slate-500 text-xs text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {worstProducts.map(p => (
                    <tr key={p.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-800 max-w-[160px] truncate" title={p.productName}>{p.productName}</td>
                      <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-500">{p.channelName}</span></td>
                      <td className={`py-2.5 px-4 text-right font-semibold ${p.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(p.netProfit)}</td>
                      <td className="py-2.5 px-4 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${roiBadge(p.roi)}`}>{p.roi.toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Monthly Trend */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Aylık Kar Trendi</h3>
          <div className="space-y-6">
            {monthlyData.map((m, i) => {
              const netPct = Math.max((Math.abs(m.netProfit) / maxProfit) * 100, 5);
              const revPct = (m.revenue / Math.max(...monthlyData.map(x => x.revenue))) * 100;
              return (
                <div key={i} className="space-y-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 w-32">{m.month}</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span>Gelir: <strong className="text-slate-700">{fmt(m.revenue)}</strong></span>
                      <span>Maliyet: <strong className="text-slate-700">{fmt(m.cost)}</strong></span>
                      <span>Komisyon: <strong className="text-red-500">-{fmt(m.commission)}</strong></span>
                      <span className={`font-semibold ${m.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net: {fmt(m.netProfit)}</span>
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded">{m.orders} sipariş</span>
                    </div>
                  </div>
                  {/* Revenue bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 w-12 text-right">Gelir</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${revPct}%` }} />
                    </div>
                  </div>
                  {/* Profit bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 w-12 text-right">Net</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${m.netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${netPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
