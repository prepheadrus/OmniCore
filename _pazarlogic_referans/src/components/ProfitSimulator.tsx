'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Calculator,
  TrendingUp,
  RefreshCw,
  Search,
  Download,
  Eye,
  Trash2,
  Copy,
  DollarSign,
  BarChart3,
  Save,
  Target,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';

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
  { name: 'Trendyol', fee: 13, color: '#ff6f00', paymentFee: 1.5 },
  { name: 'Hepsiburada', fee: 10, color: '#ef4444', paymentFee: 1.2 },
  { name: 'Amazon TR', fee: 15, color: '#f59e0b', paymentFee: 2.0 },
  { name: 'n11', fee: 8, color: '#7c3aed', paymentFee: 1.8 },
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

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

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
  },
  {
    id: 'sim-004', name: 'USB-C Şarj Kablosu - n11', productName: '100W USB-C Kablo 2m', sku: 'ACC-USC-002',
    marketplace: 'n11', sellingPrice: 149, costPrice: 18, totalCostPerUnit: 42.32,
    netProfitPerUnit: 106.68, profitMargin: 71.6, roi: 492.7, monthlyUnits: 800,
    monthlyProfit: 85344, yearlyProfit: 1024128, createdAt: '2025-01-03T11:00:00Z',
  },
  {
    id: 'sim-005', name: 'Tablet Kılıfı - Çiçeksepeti', productName: 'iPad Air M2 Kılıfı', sku: 'ACC-IPA-003',
    marketplace: 'Çiçeksepeti', sellingPrice: 399, costPrice: 65, totalCostPerUnit: 158.62,
    netProfitPerUnit: 240.38, profitMargin: 60.2, roi: 147.5, monthlyUnits: 180,
    monthlyProfit: 43268.4, yearlyProfit: 519220.8, createdAt: '2024-12-28T16:00:00Z',
  },
];

/* ================================================================
   Helper Functions
   ================================================================ */
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

function calculateProfit(costs: CostBreakdown): {
  totalCost: number;
  netProfit: number;
  margin: number;
  roi: number;
  breakEven: number;
  monthlyProfit: number;
  yearlyProfit: number;
} {
  const mpFeeAmount = (costs.sellingPrice * costs.marketplaceFeePct) / 100;
  const paymentFeeAmount = (costs.sellingPrice * costs.paymentFeePct) / 100;
  const taxAmount = (costs.sellingPrice * costs.taxRatePct) / 100;
  const returnLoss = (costs.sellingPrice * costs.returnRatePct) / 100;

  const totalCost =
    costs.costPrice +
    costs.shippingCost +
    mpFeeAmount +
    paymentFeeAmount +
    taxAmount +
    costs.packagingCost +
    returnLoss +
    costs.advertisingCost +
    costs.otherCosts;

  const netProfit = costs.sellingPrice - totalCost;
  const margin = costs.sellingPrice > 0 ? (netProfit / costs.sellingPrice) * 100 : 0;
  const roi = totalCost > 0 ? ((netProfit) / totalCost) * 100 : 0;
  const breakEven = totalCost > 0 && netProfit > 0 ? Math.ceil(totalCost / netProfit) : Infinity;
  const monthlyProfit = netProfit * 0; // calculated separately
  const yearlyProfit = netProfit * 0;

  return { totalCost, netProfit, margin, roi, breakEven, monthlyProfit, yearlyProfit };
}

function getMarginColor(margin: number): string {
  if (margin > 20) return 'text-emerald-600';
  if (margin > 10) return 'text-amber-600';
  return 'text-red-600';
}

function getMarginBg(margin: number): string {
  if (margin > 20) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (margin > 10) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function getMarginGaugeColor(margin: number): string {
  if (margin > 20) return '#10b981';
  if (margin > 10) return '#f59e0b';
  return '#ef4444';
}

/* ================================================================
   Skeleton
   ================================================================ */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-52 bg-slate-200 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-slate-200 rounded-xl" />
    </div>
  );
}

/* ================================================================
   Custom Tooltip
   ================================================================ */
function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
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
  const percentage = ((clampedMargin + 20) / 100) * 100; // -20 to 80 mapped to 0-100
  const color = getMarginGaugeColor(margin);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Background arc */}
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Color segments */}
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#ef4444"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="88 300"
          strokeDashoffset="0"
          opacity={0.2}
        />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="88 300"
          strokeDashoffset="-88"
          opacity={0.2}
        />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="132 300"
          strokeDashoffset="-176"
          opacity={0.2}
        />
        {/* Value arc */}
        {margin > 0 && (
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 220} 300`}
            strokeDashoffset="0"
          />
        )}
        {/* Needle */}
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
        {/* Labels */}
        <text x="15" y="98" fontSize="9" fill="#94a3b8" textAnchor="middle">-20%</text>
        <text x="90" y="20" fontSize="9" fill="#94a3b8" textAnchor="middle">30%</text>
        <text x="165" y="98" fontSize="9" fill="#94a3b8" textAnchor="middle">80%</text>
      </svg>
      <div className="text-center mt-1">
        <p className={cn('text-3xl font-bold', getMarginColor(margin))}>{margin.toFixed(1)}%</p>
        <p className="text-xs text-slate-500">Kar Marjı</p>
      </div>
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function ProfitSimulator() {
  const { sidebarOpen } = useAppStore();
  const [data, setData] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  /* ---------- load data ---------- */
  useEffect(() => {
    fetch('/api/profit-simulator')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setData(res);
        } else {
          setData(DEMO_SIMULATIONS);
        }
      })
      .catch(() => setData(DEMO_SIMULATIONS))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- apply marketplace preset ---------- */
  const applyPreset = (mpName: string) => {
    const preset = MP_PRESETS[mpName];
    if (preset) {
      setSimMpFeePct(String(preset.fee));
      setSimPaymentFeePct(String(preset.paymentFee));
      setSimShippingCost(String(preset.shipping));
    }
  };

  const handleMarketplaceChange = (val: string) => {
    setSimMarketplace(val);
    applyPreset(val);
  };

  /* ---------- live calculation ---------- */
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
      { name: 'Maliyet Fiyatı', value: cp, color: '#ef4444' },
      { name: 'Kargo', value: ship, color: '#f97316' },
      { name: 'Pazaryeri Komisyonu', value: mpFeeAmt, color: '#eab308' },
      { name: 'Ödeme Fee', value: payFeeAmt, color: '#22c55e' },
      { name: 'Vergi', value: taxAmt, color: '#3b82f6' },
      { name: 'Paketleme', value: pkg, color: '#8b5cf6' },
      { name: 'İade Kaybı', value: returnLoss, color: '#ec4899' },
      { name: 'Reklam', value: adv, color: '#14b8a6' },
      { name: 'Diğer', value: other, color: '#64748b' },
    ];

    return {
      sp, cp, totalCost, netProfit, margin, roi, breakEven, monthlyProfit, yearlyProfit, mu, breakdown,
    };
  }, [simSellingPrice, simCostPrice, simShippingCost, simMpFeePct, simPaymentFeePct, simTaxRatePct, simPackagingCost, simReturnRatePct, simAdvertisingCost, simOtherCosts, simMonthlyUnits]);

  /* ---------- channel comparison ---------- */
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
        name: mp.name,
        color: mp.color,
        commission: preset.fee,
        shipping: preset.shipping,
        paymentFee: preset.paymentFee,
        totalCost: Math.round(totalCost * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        margin: Math.round(margin * 10) / 10,
      };
    });
  }, [simSellingPrice, simCostPrice, simTaxRatePct, simPackagingCost, simReturnRatePct, simAdvertisingCost, simOtherCosts]);

  /* ---------- scenario analysis ---------- */
  const scenarioResults = useMemo(() => {
    const baseSP = parseFloat(scenarioSellingPrice) || 299;
    const baseCP = parseFloat(scenarioCostPrice) || 45;

    const scenarios = [
      { name: 'İyimser', spMod: 1.1, cpMod: 0.9, color: '#10b981', desc: 'Satış fiyatı +%10, Maliyet -%10' },
      { name: 'Temel', spMod: 1.0, cpMod: 1.0, color: '#3b82f6', desc: 'Mevcut fiyat ve maliyet' },
      { name: 'Kötümser', spMod: 0.9, cpMod: 1.15, color: '#ef4444', desc: 'Satış fiyatı -%10, Maliyet +%15' },
    ];

    return scenarios.map((sc) => {
      const sp = baseSP * sc.spMod;
      const cp = baseCP * sc.cpMod;
      const mp = MP_PRESETS[simMarketplace];
      const totalCost = cp + mp.shipping + (sp * mp.fee) / 100 + (sp * mp.paymentFee) / 100 + (sp * 20) / 100 + 5 + (sp * 3) / 100 + 15;
      const netProfit = sp - totalCost;
      const margin = (netProfit / sp) * 100;
      return {
        name: sc.name,
        color: sc.color,
        desc: sc.desc,
        sellingPrice: Math.round(sp * 100) / 100,
        costPrice: Math.round(cp * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        margin: Math.round(margin * 10) / 10,
      };
    });
  }, [scenarioSellingPrice, scenarioCostPrice, simMarketplace]);

  /* ---------- filtered saved simulations ---------- */
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q) ||
        s.marketplace.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  /* ---------- handlers ---------- */
  const handleSaveSimulation = () => {
    if (!quickResult || !simName.trim()) return;
    const newSim: Simulation = {
      id: `sim-${Date.now()}`,
      name: simName,
      productName: simName,
      sku: simSku,
      marketplace: simMarketplace,
      sellingPrice: quickResult.sp,
      costPrice: quickResult.cp,
      totalCostPerUnit: quickResult.totalCost,
      netProfitPerUnit: quickResult.netProfit,
      profitMargin: quickResult.margin,
      roi: quickResult.roi,
      monthlyUnits: quickResult.mu,
      monthlyProfit: quickResult.monthlyProfit,
      yearlyProfit: quickResult.yearlyProfit,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => [...prev, newSim]);
    setSimName('');
  };

  const deleteSimulation = (id: string) => {
    setData((prev) => prev.filter((s) => s.id !== id));
  };

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton />
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Professional Gradient Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calculator className="h-7 w-7" />
              Kar Marjı Simülatörü
            </h1>
            <p className="text-sm text-violet-100 mt-1">
              Satış maliyetlerinizi analiz edin, kar marjı optimizasyonu yapın
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
              {data.length} kayıtlı simülasyon
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quick" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 shadow-sm">
          <TabsTrigger value="quick" className="text-slate-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
            <Zap className="h-4 w-4 mr-1.5" />
            Hızlı Simülasyon
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-slate-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Kanal Karşılaştırma
          </TabsTrigger>
          <TabsTrigger value="scenario" className="text-slate-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
            <Target className="h-4 w-4 mr-1.5" />
            Senaryo Analizi
          </TabsTrigger>
          <TabsTrigger value="saved" className="text-slate-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
            <Save className="h-4 w-4 mr-1.5" />
            Kaydedilen Simülasyonlar
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Quick Simulation ===== */}
        <TabsContent value="quick">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-600" />
                  Simülasyon Parametreleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Ürün Adı</Label>
                  <Input placeholder="Örn: iPhone Kılıfı" value={simName} onChange={(e) => setSimName(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">SKU</Label>
                  <Input placeholder="ACC-001" value={simSku} onChange={(e) => setSimSku(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Pazaryeri</Label>
                  <Select value={simMarketplace} onValueChange={handleMarketplaceChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACES.map((mp) => (
                        <SelectItem key={mp.name} value={mp.name}>
                          {mp.name} (%{mp.fee} komisyon)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-slate-100 pt-2 mt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fiyat Bilgileri</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Satış Fiyatı (₺)</Label>
                    <Input type="number" value={simSellingPrice} onChange={(e) => setSimSellingPrice(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Maliyet (₺)</Label>
                    <Input type="number" value={simCostPrice} onChange={(e) => setSimCostPrice(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 mt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maliyet Kalemleri (otomatik doldurulur)</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Kargo (₺)</Label>
                    <Input type="number" value={simShippingCost} onChange={(e) => setSimShippingCost(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Pazaryeri Komisyonu (%)</Label>
                    <Input type="number" step="0.1" value={simMpFeePct} onChange={(e) => setSimMpFeePct(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Ödeme Fee (%)</Label>
                    <Input type="number" step="0.1" value={simPaymentFeePct} onChange={(e) => setSimPaymentFeePct(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Vergi Oranı (%)</Label>
                    <Input type="number" step="0.1" value={simTaxRatePct} onChange={(e) => setSimTaxRatePct(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Paketleme (₺)</Label>
                    <Input type="number" value={simPackagingCost} onChange={(e) => setSimPackagingCost(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">İade Oranı (%)</Label>
                    <Input type="number" step="0.1" value={simReturnRatePct} onChange={(e) => setSimReturnRatePct(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Reklam (₺/birim)</Label>
                    <Input type="number" value={simAdvertisingCost} onChange={(e) => setSimAdvertisingCost(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Diğer (₺)</Label>
                    <Input type="number" value={simOtherCosts} onChange={(e) => setSimOtherCosts(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Aylık Satış Adedi</Label>
                  <Input type="number" value={simMonthlyUnits} onChange={(e) => setSimMonthlyUnits(e.target.value)} className="h-8 text-sm" />
                </div>

                <Button
                  onClick={handleSaveSimulation}
                  disabled={!quickResult || !simName.trim()}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-9 text-sm"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Simülasyonu Kaydet
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {quickResult ? (
                <>
                  {/* Gauge + Key metrics */}
                  <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Gauge */}
                        <ProfitGauge margin={quickResult.margin} />

                        {/* Key metrics */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Toplam Maliyet</p>
                            <p className="text-lg font-bold text-slate-800 mt-1">{fmt(quickResult.totalCost)}</p>
                            <p className="text-[10px] text-slate-400">birim başına</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Net Kâr</p>
                            <p className={cn('text-lg font-bold mt-1', getMarginColor(quickResult.margin))}>{fmt(quickResult.netProfit)}</p>
                            <p className="text-[10px] text-slate-400">birim başına</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Yatırım Getirisi</p>
                            <p className={cn('text-lg font-bold mt-1', getMarginColor(quickResult.roi))}>{quickResult.roi.toFixed(1)}%</p>
                            <p className="text-[10px] text-slate-400">ROI</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider"> Başa Baş</p>
                            <p className="text-lg font-bold text-slate-800 mt-1">
                              {quickResult.breakEven === Infinity ? '∞' : quickResult.breakEven}
                            </p>
                            <p className="text-[10px] text-slate-400">adet</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aylık Kâr</p>
                            <p className={cn('text-lg font-bold mt-1', quickResult.monthlyProfit > 0 ? 'text-emerald-600' : 'text-red-600')}>
                              {fmt(quickResult.monthlyProfit)}
                            </p>
                            <p className="text-[10px] text-slate-400">{quickResult.mu} adet bazında</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Yıllık Kâr</p>
                            <p className={cn('text-lg font-bold mt-1', quickResult.yearlyProfit > 0 ? 'text-emerald-600' : 'text-red-600')}>
                              {fmt(quickResult.yearlyProfit)}
                            </p>
                            <p className="text-[10px] text-slate-400">tahmini</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Breakdown Pie Chart */}
                  <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-violet-600" />
                        Maliyet Dağılımı
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={quickResult.breakdown.filter((d) => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {quickResult.breakdown.filter((d) => d.value > 0).map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [fmt(value), '']}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '11px' }}
                              formatter={(value: string) => <span className="text-slate-600">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardContent className="py-16 text-center">
                    <Calculator className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Satış fiyatı girerek simülasyon başlatın</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ===== TAB 2: Channel Comparison ===== */}
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                  Kanal Karşılaştırma - Kar Marjı & Net Kâr
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelComparison} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => `%${v}`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => `₺${v}`}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left" dataKey="margin" name="Kar Marjı (%)" radius={[4, 4, 0, 0]} barSize={24}>
                        {channelComparison.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                      <Bar yAxisId="right" dataKey="netProfit" name="Net Kâr (₺)" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={24} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  Detaylı Maliyet Karşılaştırma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-500 text-xs">Pazaryeri</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs">Komisyon</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs">Kargo</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs">Toplam Maliyet</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs">Net Kâr</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 text-xs">Marj</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelComparison
                        .sort((a, b) => b.margin - a.margin)
                        .map((ch) => (
                          <tr key={ch.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                                <span className="font-medium text-slate-800">{ch.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right text-slate-600">%{ch.commission}</td>
                            <td className="py-2.5 px-2 text-right text-slate-600">{fmt(ch.shipping)}</td>
                            <td className="py-2.5 px-2 text-right font-medium text-slate-800">{fmt(ch.totalCost)}</td>
                            <td className={cn('py-2.5 px-2 text-right font-semibold', ch.netProfit > 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(ch.netProfit)}</td>
                            <td className="py-2.5 px-2 text-right">
                              <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 font-semibold', getMarginBg(ch.margin))}>
                                %{ch.margin}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 3: Scenario Analysis ===== */}
        <TabsContent value="scenario">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-600" />
                Senaryo Parametreleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Temel Satış Fiyatı (₺)</Label>
                  <Input type="number" value={scenarioSellingPrice} onChange={(e) => setScenarioSellingPrice(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Temel Maliyet (₺)</Label>
                  <Input type="number" value={scenarioCostPrice} onChange={(e) => setScenarioCostPrice(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Pazaryeri</Label>
                  <Select value={simMarketplace} onValueChange={(v) => { setSimMarketplace(v); applyPreset(v); }}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MARKETPLACES.map((mp) => (
                        <SelectItem key={mp.name} value={mp.name}>{mp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario comparison chart */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Target className="h-4 w-4 text-violet-600" />
                  Senaryo Karşılaştırma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scenarioResults} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Scenario results table */}
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  Senaryo Sonuçları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenarioResults.map((sc) => (
                    <div key={sc.name} className={cn('rounded-lg border p-4', sc.name === 'İyimser' ? 'bg-emerald-50 border-emerald-200' : sc.name === 'Kötümser' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sc.color }} />
                          <h4 className="font-semibold text-slate-800">{sc.name}</h4>
                        </div>
                        <Badge variant="outline" className={cn('text-xs font-semibold px-2 h-6', getMarginBg(sc.margin))}>
                          %{sc.margin}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{sc.desc}</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-slate-500">Satış</p>
                          <p className="text-xs font-semibold text-slate-700">{fmt(sc.sellingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Maliyet</p>
                          <p className="text-xs font-semibold text-slate-700">{fmt(sc.costPrice)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Toplam Maliyet</p>
                          <p className="text-xs font-semibold text-slate-700">{fmt(sc.totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Net Kâr</p>
                          <p className={cn('text-xs font-bold', sc.netProfit > 0 ? 'text-emerald-600' : 'text-red-600')}>{fmt(sc.netProfit)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 4: Saved Simulations ===== */}
        <TabsContent value="saved">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Save className="h-4 w-4 text-violet-600" />
                  Kaydedilen Simülasyonlar
                  <Badge variant="secondary" className="text-xs font-medium">{data.length} simülasyon</Badge>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Simülasyon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 w-56 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <div className="py-16 text-center">
                  <Save className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Kayıtlı simülasyon bulunamadı</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Simülasyon Adı</th>
                        <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Ürün</th>
                        <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Pazaryeri</th>
                        <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Satış Fiyatı</th>
                        <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Net Kâr</th>
                        <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Marj</th>
                        <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Tarih</th>
                        <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((sim) => {
                        const mp = MARKETPLACES.find((m) => m.name === sim.marketplace);
                        return (
                          <tr key={sim.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <p className="font-medium text-slate-800">{sim.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{sim.sku}</p>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 hidden sm:table-cell max-w-[180px] truncate">{sim.productName}</td>
                            <td className="py-2.5 px-3">
                              {mp ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mp.color }} />
                                  <span className="text-slate-700">{sim.marketplace}</span>
                                </div>
                              ) : (
                                <span className="text-slate-600">{sim.marketplace}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-800">{fmt(sim.sellingPrice)}</td>
                            <td className={cn('py-2.5 px-3 text-right font-semibold', sim.netProfitPerUnit > 0 ? 'text-emerald-600' : 'text-red-600')}>
                              {fmt(sim.netProfitPerUnit)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 font-semibold', getMarginBg(sim.profitMargin))}>
                                %{sim.profitMargin.toFixed(1)}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-xs text-slate-500 hidden md:table-cell">{fmtDate(sim.createdAt)}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => deleteSimulation(sim.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
