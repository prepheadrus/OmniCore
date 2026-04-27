'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator, TrendingUp, Search, Eye, Trash2, Copy, DollarSign,
  BarChart3, Save, Target, Zap, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/* ================================================================
   Types
   ================================================================ */
interface Simulation {
  id: string;
  name: string;
  productName: string;
  sku: string;
  marketplace: string;
  sellingPrice: number;
  costPrice: number;
  totalCostPerUnit: number;
  netProfitPerUnit: number;
  profitMargin: number;
  roi: number;
  monthlyUnits: number;
  monthlyProfit: number;
  yearlyProfit: number;
  createdAt: string;
}

interface CostBreakdown {
  sellingPrice: number;
  costPrice: number;
  shippingCost: number;
  marketplaceFeePct: number;
  paymentFeePct: number;
  taxRatePct: number;
  packagingCost: number;
  returnRatePct: number;
  advertisingCost: number;
  otherCosts: number;
}

/* ================================================================
   Constants
   ================================================================ */
const MARKETPLACES = [
  { name: 'Trendyol', fee: 13, color: '#f27a1a', paymentFee: 1.5 },
  { name: 'Hepsiburada', fee: 10, color: '#ff6000', paymentFee: 1.2 },
  { name: 'Amazon TR', fee: 15, color: '#ff9900', paymentFee: 2.0 },
  { name: 'n11', fee: 8, color: '#5c3ebf', paymentFee: 1.8 },
  { name: 'Çiçeksepeti', fee: 12, color: '#ec4899', paymentFee: 1.5 },
  { name: 'Pazarama', fee: 11, color: '#14b8a6', paymentFee: 1.5 },
];

const MP_PRESETS: Record<string, { fee: number; paymentFee: number; shipping: number }> = {
  Trendyol: { fee: 13, paymentFee: 1.5, shipping: 25 },
  Hepsiburada: { fee: 10, paymentFee: 1.2, shipping: 22 },
  'Amazon TR': { fee: 15, paymentFee: 2.0, shipping: 30 },
  n11: { fee: 8, paymentFee: 1.8, shipping: 20 },
  Çiçeksepeti: { fee: 12, paymentFee: 1.5, shipping: 18 },
  Pazarama: { fee: 11, paymentFee: 1.5, shipping: 20 },
};

/* ================================================================
   Demo Data
   ================================================================ */
const DEMO_SIMULATIONS: Simulation[] = [
  {
    id: 'sim-001', name: 'iPhone Kılıfı - Trendyol', productName: 'iPhone 15 Pro Max Kılıfı', sku: 'ACC-IP15-001',
    marketplace: 'Trendyol', sellingPrice: 299, costPrice: 45, totalCostPerUnit: 112.85,
    netProfitPerUnit: 186.15, profitMargin: 62.3, roi: 164.8, monthlyUnits: 450,
    monthlyProfit: 83767.5, yearlyProfit: 1005210, createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'sim-002', name: 'Kablosuz Kulaklık - Hepsiburada', productName: 'Bluetooth 5.3 Kulaklık', sku: 'AUD-BT53-001',
    marketplace: 'Hepsiburada', sellingPrice: 599, costPrice: 180, totalCostPerUnit: 310.60,
    netProfitPerUnit: 288.40, profitMargin: 48.1, roi: 92.9, monthlyUnits: 200,
    monthlyProfit: 57680, yearlyProfit: 692160, createdAt: '2025-01-08T14:00:00Z',
  },
  {
    id: 'sim-003', name: 'Akıllı Saat - Amazon TR', productName: 'Smart Watch Pro', sku: 'WCH-SWP-001',
    marketplace: 'Amazon TR', sellingPrice: 1299, costPrice: 550, totalCostPerUnit: 910.95,
    netProfitPerUnit: 388.05, profitMargin: 29.9, roi: 42.6, monthlyUnits: 120,
    monthlyProfit: 46566, yearlyProfit: 558792, createdAt: '2025-01-05T09:00:00Z',
  }
];

/* ================================================================
   Helper Functions
   ================================================================ */
const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

function getMarginColor(margin: number): string {
  if (margin > 20) return 'text-emerald-600';
  if (margin > 10) return 'text-amber-600';
  return 'text-red-600';
}

function getMarginBg(margin: number): string {
  if (margin > 20) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (margin > 10) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-700 border border-red-200';
}

function getMarginGaugeColor(margin: number): string {
  if (margin > 20) return '#10b981';
  if (margin > 10) return '#f59e0b';
  return '#ef4444';
}

/* ================================================================
   Custom Tooltip
   ================================================================ */
function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-md shadow-md border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.name}</span>
          </span>
          <span className="font-medium text-slate-800">
            {entry.name.includes('%') || entry.name.includes('Marj') ? `%${entry.value.toFixed(1)}` : fmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Profit Margin Gauge Component
   ================================================================ */
function ProfitGauge({ margin }: { margin: number }) {
  const clampedMargin = Math.min(Math.max(margin, -20), 80);
  const percentage = ((clampedMargin + 20) / 100) * 100;
  const color = getMarginGaugeColor(margin);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" strokeDasharray="88 300" strokeDashoffset="0" opacity={0.2} />
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" strokeDasharray="88 300" strokeDashoffset="-88" opacity={0.2} />
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeDasharray="132 300" strokeDashoffset="-176" opacity={0.2} />
        {margin > 0 && (
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(percentage / 100) * 220} 300`} strokeDashoffset="0" />
        )}
        {(() => {
          const angle = (percentage / 100) * 180;
          const rad = ((angle - 180) * Math.PI) / 180;
          const cx = 90;
          const cy = 90;
          const nx = cx + 55 * Math.cos(rad);
          const ny = cy + 55 * Math.sin(rad);
          return (
            <g>
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r="5" fill={color} />
            </g>
          );
        })()}
        <text x="15" y="98" fontSize="9" fill="#94a3b8" textAnchor="middle">-20%</text>
        <text x="90" y="20" fontSize="9" fill="#94a3b8" textAnchor="middle">30%</text>
        <text x="165" y="98" fontSize="9" fill="#94a3b8" textAnchor="middle">80%</text>
      </svg>
      <div className="text-center mt-1">
        <p className={`text-3xl font-bold ${getMarginColor(margin)}`}>{margin.toFixed(1)}%</p>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Kar Marjı</p>
      </div>
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function ProfitSimulator() {
  const [data, setData] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'quick'|'comparison'|'scenario'|'saved'>('quick');

  // Quick Simulation form
  const [simName, setSimName] = useState('');
  const [simSku, setSimSku] = useState('');
  const [simMarketplace, setSimMarketplace] = useState('Trendyol');
  const [simSellingPrice, setSimSellingPrice] = useState('299');
  const [simCostPrice, setSimCostPrice] = useState('45');
  const [simShippingCost, setSimShippingCost] = useState('25');
  const [simMpFeePct, setSimMpFeePct] = useState('13');
  const [simPaymentFeePct, setSimPaymentFeePct] = useState('1.5');
  const [simTaxRatePct, setSimTaxRatePct] = useState('20');
  const [simPackagingCost, setSimPackagingCost] = useState('5');
  const [simReturnRatePct, setSimReturnRatePct] = useState('3');
  const [simAdvertisingCost, setSimAdvertisingCost] = useState('15');
  const [simOtherCosts, setSimOtherCosts] = useState('0');
  const [simMonthlyUnits, setSimMonthlyUnits] = useState('100');

  // Scenario form
  const [scenarioSellingPrice, setScenarioSellingPrice] = useState('299');
  const [scenarioCostPrice, setScenarioCostPrice] = useState('45');

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(DEMO_SIMULATIONS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const applyPreset = (mpName: string) => {
    const preset = MP_PRESETS[mpName];
    if (preset) {
      setSimMpFeePct(String(preset.fee));
      setSimPaymentFeePct(String(preset.paymentFee));
      setSimShippingCost(String(preset.shipping));
    }
  };

  const handleMarketplaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSimMarketplace(val);
    applyPreset(val);
  };

  const quickResult = useMemo(() => {
    const sp = parseFloat(simSellingPrice) || 0;
    const cp = parseFloat(simCostPrice) || 0;
    const ship = parseFloat(simShippingCost) || 0;
    const mpFee = parseFloat(simMpFeePct) || 0;
    const payFee = parseFloat(simPaymentFeePct) || 0;
    const tax = parseFloat(simTaxRatePct) || 0;
    const pkg = parseFloat(simPackagingCost) || 0;
    const ret = parseFloat(simReturnRatePct) || 0;
    const adv = parseFloat(simAdvertisingCost) || 0;
    const other = parseFloat(simOtherCosts) || 0;
    const mu = parseInt(simMonthlyUnits) || 0;

    if (sp <= 0) return null;

    const mpFeeAmt = (sp * mpFee) / 100;
    const payFeeAmt = (sp * payFee) / 100;
    const taxAmt = (sp * tax) / 100;
    const returnLoss = (sp * ret) / 100;

    const totalCost = cp + ship + mpFeeAmt + payFeeAmt + taxAmt + pkg + returnLoss + adv + other;
    const netProfit = sp - totalCost;
    const margin = (netProfit / sp) * 100;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const breakEven = netProfit > 0 ? Math.ceil(totalCost / netProfit) : Infinity;
    const monthlyProfit = netProfit * mu;
    const yearlyProfit = monthlyProfit * 12;

    const breakdown = [
      { name: 'Maliyet', value: cp, color: '#ef4444' },
      { name: 'Kargo', value: ship, color: '#f97316' },
      { name: 'Pazaryeri', value: mpFeeAmt, color: '#eab308' },
      { name: 'Ödeme', value: payFeeAmt, color: '#22c55e' },
      { name: 'Vergi', value: taxAmt, color: '#3b82f6' },
      { name: 'Paketleme', value: pkg, color: '#8b5cf6' },
      { name: 'İade Kaybı', value: returnLoss, color: '#ec4899' },
      { name: 'Reklam', value: adv, color: '#14b8a6' },
      { name: 'Diğer', value: other, color: '#64748b' },
    ];

    return { sp, cp, totalCost, netProfit, margin, roi, breakEven, monthlyProfit, yearlyProfit, mu, breakdown };
  }, [simSellingPrice, simCostPrice, simShippingCost, simMpFeePct, simPaymentFeePct, simTaxRatePct, simPackagingCost, simReturnRatePct, simAdvertisingCost, simOtherCosts, simMonthlyUnits]);

  const channelComparison = useMemo(() => {
    const sp = parseFloat(simSellingPrice) || 299;
    const cp = parseFloat(simCostPrice) || 45;
    const tax = parseFloat(simTaxRatePct) || 20;
    const pkg = parseFloat(simPackagingCost) || 5;
    const ret = parseFloat(simReturnRatePct) || 3;
    const adv = parseFloat(simAdvertisingCost) || 15;
    const other = parseFloat(simOtherCosts) || 0;

    return MARKETPLACES.map((mp) => {
      const preset = MP_PRESETS[mp.name];
      const mpFeeAmt = (sp * preset.fee) / 100;
      const payFeeAmt = (sp * preset.paymentFee) / 100;
      const taxAmt = (sp * tax) / 100;
      const returnLoss = (sp * ret) / 100;
      const totalCost = cp + preset.shipping + mpFeeAmt + payFeeAmt + taxAmt + pkg + returnLoss + adv + other;
      const netProfit = sp - totalCost;
      const margin = (netProfit / sp) * 100;

      return {
        name: mp.name, color: mp.color, commission: preset.fee, shipping: preset.shipping,
        paymentFee: preset.paymentFee, totalCost: Math.round(totalCost * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100, margin: Math.round(margin * 10) / 10,
      };
    });
  }, [simSellingPrice, simCostPrice, simTaxRatePct, simPackagingCost, simReturnRatePct, simAdvertisingCost, simOtherCosts]);

  const scenarioResults = useMemo(() => {
    const baseSP = parseFloat(scenarioSellingPrice) || 299;
    const baseCP = parseFloat(scenarioCostPrice) || 45;

    const scenarios = [
      { name: 'İyimser', spMod: 1.1, cpMod: 0.9, color: '#10b981', desc: 'Satış +%10, Maliyet -%10' },
      { name: 'Temel', spMod: 1.0, cpMod: 1.0, color: '#3b82f6', desc: 'Mevcut fiyat' },
      { name: 'Kötümser', spMod: 0.9, cpMod: 1.15, color: '#ef4444', desc: 'Satış -%10, Maliyet +%15' },
    ];

    return scenarios.map((sc) => {
      const sp = baseSP * sc.spMod;
      const cp = baseCP * sc.cpMod;
      const mp = MP_PRESETS[simMarketplace];
      const totalCost = cp + mp.shipping + (sp * mp.fee) / 100 + (sp * mp.paymentFee) / 100 + (sp * 20) / 100 + 5 + (sp * 3) / 100 + 15;
      const netProfit = sp - totalCost;
      const margin = (netProfit / sp) * 100;
      return {
        name: sc.name, color: sc.color, desc: sc.desc, sellingPrice: Math.round(sp * 100) / 100,
        costPrice: Math.round(cp * 100) / 100, totalCost: Math.round(totalCost * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100, margin: Math.round(margin * 10) / 10,
      };
    });
  }, [scenarioSellingPrice, scenarioCostPrice, simMarketplace]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter((s) => s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q) || s.marketplace.toLowerCase().includes(q));
  }, [data, searchTerm]);

  const handleSaveSimulation = () => {
    if (!quickResult || !simName.trim()) return;
    const newSim: Simulation = {
      id: `sim-${Date.now()}`, name: simName, productName: simName, sku: simSku, marketplace: simMarketplace,
      sellingPrice: quickResult.sp, costPrice: quickResult.cp, totalCostPerUnit: quickResult.totalCost,
      netProfitPerUnit: quickResult.netProfit, profitMargin: quickResult.margin, roi: quickResult.roi,
      monthlyUnits: quickResult.mu, monthlyProfit: quickResult.monthlyProfit, yearlyProfit: quickResult.yearlyProfit,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => [...prev, newSim]);
    setSimName('');
  };

  const deleteSimulation = (id: string) => setData((prev) => prev.filter((s) => s.id !== id));

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-md bg-slate-200" />)}
          </div>
          <div className="h-96 rounded-md bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-md p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calculator className="h-6 w-6" />
              Kar Marjı Simülatörü
            </h1>
            <p className="text-sm text-violet-100 mt-1">
              Satış maliyetlerinizi analiz edin, kar marjı optimizasyonu yapın
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded bg-white/20 border border-white/30 text-white text-xs font-medium">
              {data.length} kayıtlı simülasyon
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'quick', label: 'Hızlı Simülasyon', icon: Zap },
          { id: 'comparison', label: 'Kanal Karşılaştırma', icon: BarChart3 },
          { id: 'scenario', label: 'Senaryo Analizi', icon: Target },
          { id: 'saved', label: 'Kaydedilenler', icon: Save },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Quick Simulation */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-semibold text-slate-800">Simülasyon Parametreleri</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Ürün Adı</label>
                <input placeholder="Örn: iPhone Kılıfı" value={simName} onChange={e => setSimName(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">SKU</label>
                  <input placeholder="ACC-001" value={simSku} onChange={e => setSimSku(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Pazaryeri</label>
                  <div className="relative">
                    <select value={simMarketplace} onChange={handleMarketplaceChange} className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500">
                      {MARKETPLACES.map(mp => <option key={mp.name} value={mp.name}>{mp.name} (%{mp.fee})</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Fiyat Bilgileri</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Satış Fiyatı (₺)</label>
                    <input type="number" value={simSellingPrice} onChange={e => setSimSellingPrice(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Maliyet (₺)</label>
                    <input type="number" value={simCostPrice} onChange={e => setSimCostPrice(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Maliyet Kalemleri</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Kargo (₺)</label>
                    <input type="number" value={simShippingCost} onChange={e => setSimShippingCost(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Komisyon (%)</label>
                    <input type="number" step="0.1" value={simMpFeePct} onChange={e => setSimMpFeePct(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Ödeme Fee (%)</label>
                    <input type="number" step="0.1" value={simPaymentFeePct} onChange={e => setSimPaymentFeePct(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Vergi Oranı (%)</label>
                    <input type="number" step="0.1" value={simTaxRatePct} onChange={e => setSimTaxRatePct(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Paketleme (₺)</label>
                    <input type="number" value={simPackagingCost} onChange={e => setSimPackagingCost(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">İade Oranı (%)</label>
                    <input type="number" step="0.1" value={simReturnRatePct} onChange={e => setSimReturnRatePct(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Reklam (₺/birim)</label>
                    <input type="number" value={simAdvertisingCost} onChange={e => setSimAdvertisingCost(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Diğer (₺)</label>
                    <input type="number" value={simOtherCosts} onChange={e => setSimOtherCosts(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Aylık Beklenen Satış Adedi</label>
                  <input type="number" value={simMonthlyUnits} onChange={e => setSimMonthlyUnits(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleSaveSimulation}
                disabled={!quickResult || !simName.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 shadow-sm"
              >
                <Save className="h-4 w-4" /> Simülasyonu Kaydet
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {quickResult ? (
              <>
                <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <ProfitGauge margin={quickResult.margin} />
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                      <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Toplam Maliyet</p>
                        <p className="text-xl font-bold text-slate-800">{fmt(quickResult.totalCost)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">birim başına</p>
                      </div>
                      <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Net Kâr</p>
                        <p className={`text-xl font-bold ${getMarginColor(quickResult.margin)}`}>{fmt(quickResult.netProfit)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">birim başına</p>
                      </div>
                      <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Yatırım Getirisi</p>
                        <p className={`text-xl font-bold ${getMarginColor(quickResult.roi)}`}>{quickResult.roi.toFixed(1)}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">ROI</p>
                      </div>
                      <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Başa Baş</p>
                        <p className="text-xl font-bold text-slate-800">{quickResult.breakEven === Infinity ? '∞' : quickResult.breakEven}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">adet / ay</p>
                      </div>
                      <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Aylık Kâr</p>
                        <p className={`text-xl font-bold ${quickResult.monthlyProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(quickResult.monthlyProfit)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{quickResult.mu} adet / ay</p>
                      </div>
                      <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Yıllık Kâr</p>
                        <p className={`text-xl font-bold ${quickResult.yearlyProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(quickResult.yearlyProfit)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">tahmini</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-6">
                    <DollarSign className="h-4 w-4 text-violet-600" /> Maliyet Dağılımı
                  </h3>
                  <div className="h-72">
                    <div style={{ width: "100%", height: "100%", minHeight: 300 }}><ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={quickResult.breakdown.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value">
                          {quickResult.breakdown.filter(d => d.value > 0).map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [fmt(value), '']} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} formatter={(value: string) => <span className="text-slate-700">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-md border border-slate-200 shadow-sm p-16 text-center">
                <Calculator className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800">Sonuçları Görmek İçin Parametre Girin</h3>
                <p className="text-sm text-slate-500 mt-1">Sol taraftaki form üzerinden ürün maliyetlerinizi doldurun</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Channel Comparison */}
      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-6">
              <BarChart3 className="h-4 w-4 text-violet-600" /> Kanal Karşılaştırma Grafiği
            </h3>
            <div className="h-80">
              <div style={{ width: "100%", height: "100%", minHeight: 300 }}><ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelComparison} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `%${v}`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `₺${v}`} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar yAxisId="left" dataKey="margin" name="Kar Marjı (%)" radius={[4, 4, 0, 0]} barSize={24}>
                    {channelComparison.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar yAxisId="right" dataKey="netProfit" name="Net Kâr (₺)" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={24} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer></div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-600" /> Detaylı Maliyet Tablosu
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Pazaryeri</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Komisyon</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Kargo</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Toplam Maliyet</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Net Kâr</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Marj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {channelComparison.sort((a, b) => b.margin - a.margin).map(ch => (
                    <tr key={ch.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ch.color }} />
                          <span className="font-medium text-slate-800">{ch.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">%{ch.commission}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{fmt(ch.shipping)}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">{fmt(ch.totalCost)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${ch.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(ch.netProfit)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getMarginBg(ch.margin)}`}>%{ch.margin}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Scenario Analysis */}
      {activeTab === 'scenario' && (
        <div className="space-y-6">
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-violet-600" /> Senaryo Parametreleri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Temel Satış Fiyatı (₺)</label>
                <input type="number" value={scenarioSellingPrice} onChange={e => setScenarioSellingPrice(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Temel Maliyet (₺)</label>
                <input type="number" value={scenarioCostPrice} onChange={e => setScenarioCostPrice(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Pazaryeri Temeli</label>
                <div className="relative">
                  <select value={simMarketplace} onChange={e => { setSimMarketplace(e.target.value); applyPreset(e.target.value); }} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500">
                    {MARKETPLACES.map(mp => <option key={mp.name} value={mp.name}>{mp.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <Target className="h-4 w-4 text-violet-600" /> Senaryo Karşılaştırma Grafiği
              </h3>
              <div className="h-64">
                <div style={{ width: "100%", height: "100%", minHeight: 300 }}><ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioResults} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="margin" name="Kar Marjı (%)" radius={[4, 4, 0, 0]} barSize={40}>
                      {scenarioResults.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-600" /> Senaryo Sonuçları
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {scenarioResults.map(sc => (
                  <div key={sc.name} className={`rounded-md border p-4 ${sc.name === 'İyimser' ? 'bg-emerald-50 border-emerald-200' : sc.name === 'Kötümser' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sc.color }} />
                        <h4 className="font-semibold text-slate-800 text-sm">{sc.name}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${getMarginBg(sc.margin)}`}>%{sc.margin}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{sc.desc}</p>
                    <div className="grid grid-cols-4 gap-2 text-center bg-white/60 p-2.5 rounded border border-white/40">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Satış</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{fmt(sc.sellingPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Maliyet</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{fmt(sc.costPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Top. Maliyet</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{fmt(sc.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Net Kâr</p>
                        <p className={`text-sm font-bold mt-0.5 ${sc.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(sc.netProfit)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Saved Simulations */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Save className="h-4 w-4 text-violet-600" /> Kaydedilen Simülasyonlar
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">{data.length}</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Simülasyon ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 w-full sm:w-64 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 bg-white"
              />
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="p-16 text-center">
              <Save className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Simülasyon bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">Hızlı simülasyon ekranından yeni analizler kaydedebilirsiniz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Simülasyon Adı</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Ürün</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Pazaryeri</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Satış Fiyatı</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Net Kâr</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Marj</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Tarih</th>
                    <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((sim) => {
                    const mp = MARKETPLACES.find(m => m.name === sim.marketplace);
                    return (
                      <tr key={sim.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{sim.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sim.sku}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 hidden sm:table-cell max-w-[180px] truncate" title={sim.productName}>{sim.productName}</td>
                        <td className="py-3 px-4">
                          {mp ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mp.color }} />
                              <span className="font-medium text-slate-700">{sim.marketplace}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">{sim.marketplace}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">{fmt(sim.sellingPrice)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${sim.netProfitPerUnit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {fmt(sim.netProfitPerUnit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getMarginBg(sim.profitMargin)}`}>%{sim.profitMargin.toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">{fmtDate(sim.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Görüntüle"><Eye className="w-4 h-4" /></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Kopyala"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => deleteSimulation(sim.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Sil"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
