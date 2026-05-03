'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  Eye,
  RefreshCw,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  BellPlus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Search,
  History,
  Edit3,
  ChevronDown,
  ChevronUp,
  Package,
  Target,
  ShieldCheck,
  AlertCircle,
  Activity,
} from 'lucide-react';

/* ================================================================
   Types
   ================================================================ */
interface CompetitorPriceEntry {
  id: string;
  productName: string;
  sku: string;
  ourPrice: number;
  minCompetitor: number;
  maxCompetitor: number;
  avgCompetitor: number;
  akakcePrice: number;
  cimriPrice: number;
  platform: string;
  lastUpdate: string;
}

interface PriceAlert {
  id: string;
  productName: string;
  sku: string;
  competitor: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  date: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface PriceHistory {
  month: string;
  ourPrice: number;
  competitorAvg: number;
}

type SortField = 'productName' | 'sku' | 'ourPrice' | 'minCompetitor' | 'avgCompetitor' | 'akakcePrice' | 'cimriPrice';
type SortDir = 'asc' | 'desc';

/* ================================================================
   Helpers
   ================================================================ */
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0 }).format(n);

function getStatus(ourPrice: number, minComp: number): { text: string; className: string; color: string } {
  const diff = ourPrice - minComp;
  const pct = (diff / minComp) * 100;
  if (pct <= 0) {
    return { text: 'En Ucuz', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', color: 'text-emerald-700' };
  }
  if (pct <= 5) {
    return { text: 'Uygun', className: 'bg-blue-100 text-blue-700 border-blue-200', color: 'text-blue-700' };
  }
  return { text: 'Pahalı', className: 'bg-red-100 text-red-700 border-red-200', color: 'text-red-700' };
}

function getPriceBgColor(ourPrice: number, competitorPrice: number): string {
  if (ourPrice <= competitorPrice) return 'text-emerald-600 font-semibold';
  if (ourPrice <= competitorPrice * 1.05) return 'text-amber-600';
  return 'text-red-500';
}

/* ================================================================
   Mock Data — Products
   ================================================================ */
const MOCK_PRODUCTS: CompetitorPriceEntry[] = [
  {
    id: 'pm-001',
    productName: 'iPhone 15 Pro Max 256GB',
    sku: 'APL-IP15PM-256',
    ourPrice: 72_999,
    minCompetitor: 74_500,
    maxCompetitor: 79_999,
    avgCompetitor: 76_850,
    akakcePrice: 75_200,
    cimriPrice: 74_800,
    platform: 'Akakçe',
    lastUpdate: '2025-04-30T14:30:00Z',
  },
  {
    id: 'pm-002',
    productName: 'Samsung Galaxy S24 Ultra 256GB',
    sku: 'SAM-S24U-256',
    ourPrice: 63_499,
    minCompetitor: 62_999,
    maxCompetitor: 69_999,
    avgCompetitor: 65_200,
    akakcePrice: 63_500,
    cimriPrice: 63_200,
    platform: 'Cimri',
    lastUpdate: '2025-04-30T13:45:00Z',
  },
  {
    id: 'pm-003',
    productName: 'MacBook Air M3 15" 256GB',
    sku: 'APL-MBA-M3-15',
    ourPrice: 54_499,
    minCompetitor: 51_499,
    maxCompetitor: 56_999,
    avgCompetitor: 53_800,
    akakcePrice: 52_300,
    cimriPrice: 51_999,
    platform: 'Akakçe',
    lastUpdate: '2025-04-30T12:15:00Z',
  },
  {
    id: 'pm-004',
    productName: 'Sony WH-1000XM5 Kulaklık',
    sku: 'SNY-WH1K-XM5',
    ourPrice: 8_999,
    minCompetitor: 9_199,
    maxCompetitor: 11_499,
    avgCompetitor: 10_200,
    akakcePrice: 9_499,
    cimriPrice: 9_299,
    platform: 'Cimri',
    lastUpdate: '2025-04-30T15:00:00Z',
  },
  {
    id: 'pm-005',
    productName: 'iPad Air M2 11" 128GB',
    sku: 'APL-IPA-M2-11',
    ourPrice: 26_999,
    minCompetitor: 26_499,
    maxCompetitor: 29_999,
    avgCompetitor: 27_800,
    akakcePrice: 27_200,
    cimriPrice: 26_999,
    platform: 'Akakçe',
    lastUpdate: '2025-04-30T11:30:00Z',
  },
  {
    id: 'pm-006',
    productName: 'Apple Watch Ultra 2 49mm',
    sku: 'APL-AWU2-49',
    ourPrice: 27_999,
    minCompetitor: 27_500,
    maxCompetitor: 32_999,
    avgCompetitor: 29_500,
    akakcePrice: 28_200,
    cimriPrice: 27_800,
    platform: 'Cimri',
    lastUpdate: '2025-04-30T10:00:00Z',
  },
  {
    id: 'pm-007',
    productName: 'Xiaomi 14 Ultra 512GB',
    sku: 'XIA-14U-512',
    ourPrice: 48_499,
    minCompetitor: 47_999,
    maxCompetitor: 54_999,
    avgCompetitor: 50_200,
    akakcePrice: 48_900,
    cimriPrice: 48_500,
    platform: 'Akakçe',
    lastUpdate: '2025-04-30T09:20:00Z',
  },
  {
    id: 'pm-008',
    productName: 'Logitech MX Master 3S',
    sku: 'LOG-MXM3S-BK',
    ourPrice: 3_149,
    minCompetitor: 3_099,
    maxCompetitor: 3_899,
    avgCompetitor: 3_400,
    akakcePrice: 3_250,
    cimriPrice: 3_199,
    platform: 'Cimri',
    lastUpdate: '2025-04-30T08:45:00Z',
  },
  {
    id: 'pm-009',
    productName: 'Samsung Galaxy Tab S9 FE',
    sku: 'SAM-TS9FE-128',
    ourPrice: 15_499,
    minCompetitor: 13_999,
    maxCompetitor: 17_999,
    avgCompetitor: 15_200,
    akakcePrice: 14_500,
    cimriPrice: 14_200,
    platform: 'Akakçe',
    lastUpdate: '2025-04-30T07:30:00Z',
  },
  {
    id: 'pm-010',
    productName: 'AirPods Pro 2. Nesil USB-C',
    sku: 'APL-APP2-USBC',
    ourPrice: 8_499,
    minCompetitor: 8_299,
    maxCompetitor: 10_999,
    avgCompetitor: 9_300,
    akakcePrice: 8_699,
    cimriPrice: 8_499,
    platform: 'Cimri',
    lastUpdate: '2025-04-30T16:00:00Z',
  },
];

/* ================================================================
   Mock Data — Alerts
   ================================================================ */
const MOCK_ALERTS: PriceAlert[] = [
  {
    id: 'al-001',
    productName: 'MacBook Air M3 15"',
    sku: 'APL-MBA-M3-15',
    competitor: 'Vatan Bilgisayar',
    oldPrice: 54_999,
    newPrice: 51_499,
    changePercent: -6.4,
    date: '2025-04-30T14:00:00Z',
    severity: 'critical',
    message: 'Rakip fiyatı %6.4 oranında düştü. Fiyatınız rakiplerden %5.7 daha yüksek.',
  },
  {
    id: 'al-002',
    productName: 'Samsung Galaxy Tab S9 FE',
    sku: 'SAM-TS9FE-128',
    competitor: 'Teknosa',
    oldPrice: 15_999,
    newPrice: 13_999,
    changePercent: -12.5,
    date: '2025-04-30T13:00:00Z',
    severity: 'critical',
    message: 'Rakip fiyatı %12.5 oranında düştü. Ciddi rekabet avantajı kaybı!',
  },
  {
    id: 'al-003',
    productName: 'Xiaomi 14 Ultra 512GB',
    sku: 'XIA-14U-512',
    competitor: 'MediaMarkt',
    oldPrice: 49_999,
    newPrice: 47_999,
    changePercent: -4.0,
    date: '2025-04-30T12:00:00Z',
    severity: 'warning',
    message: 'Rakip fiyatı %4 oranında düştü. Fiyat uyumu kontrol edilmeli.',
  },
  {
    id: 'al-004',
    productName: 'iPhone 15 Pro Max 256GB',
    sku: 'APL-IP15PM-256',
    competitor: 'Hepsiburada',
    oldPrice: 76_999,
    newPrice: 75_200,
    changePercent: -2.3,
    date: '2025-04-30T11:00:00Z',
    severity: 'info',
    message: 'Akakçe fiyatı güncellendi. En ucuz pozisyonunuz korunuyor.',
  },
  {
    id: 'al-005',
    productName: 'AirPods Pro 2. Nesil',
    sku: 'APL-APP2-USBC',
    competitor: 'Amazon TR',
    oldPrice: 9_499,
    newPrice: 8_299,
    changePercent: -12.6,
    date: '2025-04-30T10:00:00Z',
    severity: 'critical',
    message: 'Amazon TR fiyatı %12.6 düştü. Rekabet gücünüz tehlikede!',
  },
];

/* ================================================================
   Mock Data — Price History
   ================================================================ */
const MOCK_HISTORY: PriceHistory[] = [
  { month: 'Kasım', ourPrice: 75_500, competitorAvg: 78_200 },
  { month: 'Aralık', ourPrice: 74_000, competitorAvg: 77_500 },
  { month: 'Ocak', ourPrice: 73_500, competitorAvg: 76_800 },
  { month: 'Şubat', ourPrice: 72_000, competitorAvg: 75_200 },
  { month: 'Mart', ourPrice: 71_500, competitorAvg: 74_000 },
  { month: 'Nisan', ourPrice: 70_500, competitorAvg: 73_500 },
];

/* ================================================================
   Skeleton Loader
   ================================================================ */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-80 bg-slate-200 rounded-xl" />
      <div className="h-96 bg-slate-200 rounded-xl" />
    </div>
  );
}

/* ================================================================
   SortIcon
   ================================================================ */
function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400 ml-1 inline" />;
  return sortDir === 'asc' ? (
    <ChevronUp className="h-3 w-3 text-emerald-600 ml-1 inline" />
  ) : (
    <ChevronDown className="h-3 w-3 text-emerald-600 ml-1 inline" />
  );
}

/* ================================================================
   Alert Icon Helper
   ================================================================ */
function AlertSeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
    default:
      return <InfoIcon className="h-5 w-5 text-blue-500 shrink-0" />;
  }
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/* ================================================================
   Main Component
   ================================================================ */
export default function PriceMonitor() {
  const { sidebarOpen } = useAppStore();

  /* ---------- State ---------- */
  const [data] = useState<CompetitorPriceEntry[]>(MOCK_PRODUCTS);
  const [alerts] = useState<PriceAlert[]>(MOCK_ALERTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyExpensive, setOnlyExpensive] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [sortField, setSortField] = useState<SortField>('productName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CompetitorPriceEntry | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(true);
  const [notifyPriceRise, setNotifyPriceRise] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  /* ---------- Derived Stats ---------- */
  const stats = useMemo(() => {
    const totalProducts = data.length;
    const cheapestCount = data.filter((d) => d.ourPrice <= d.minCompetitor).length;
    const compatibleCount = data.filter((d) => {
      const pct = ((d.ourPrice - d.minCompetitor) / d.minCompetitor) * 100;
      return pct > 0 && pct <= 5;
    }).length;
    const avgDiff =
      data.length > 0
        ? data.reduce((a, b) => a + b.ourPrice - b.avgCompetitor, 0) / data.length
        : 0;
    return {
      totalProducts,
      cheapestCount,
      compatibleCount,
      avgDiff,
      expensiveCount: totalProducts - cheapestCount - compatibleCount,
    };
  }, [data]);

  /* ---------- Filtered & Sorted Data ---------- */
  const filteredData = useMemo(() => {
    let items = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(
        (d) =>
          d.productName.toLowerCase().includes(q) ||
          d.sku.toLowerCase().includes(q)
      );
    }

    if (filterPlatform !== 'all') {
      items = items.filter((d) => d.platform === filterPlatform);
    }

    if (priceMin) {
      items = items.filter((d) => d.ourPrice >= parseFloat(priceMin));
    }
    if (priceMax) {
      items = items.filter((d) => d.ourPrice <= parseFloat(priceMax));
    }

    if (onlyExpensive) {
      items = items.filter((d) => {
        const pct = ((d.ourPrice - d.minCompetitor) / d.minCompetitor) * 100;
        return pct > 5;
      });
    }

    items.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortField) {
        default: {
          const key = sortField as keyof CompetitorPriceEntry;
          aVal = a[key];
          bVal = b[key];
        }
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return items;
  }, [data, searchTerm, filterPlatform, priceMin, priceMax, onlyExpensive, sortField, sortDir]);

  /* ---------- Chart Data ---------- */
  const chartData = useMemo(() => {
    return MOCK_HISTORY.map((h) => ({
      month: h.month,
      'Sizin Fiyat': h.ourPrice,
      'Rakip Ortalaması': h.competitorAvg,
      Fark: h.ourPrice - h.competitorAvg,
    }));
  }, []);

  /* ---------- Handlers ---------- */
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
    },
    [sortField]
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  const handleExport = () => {
    const csv = [
      ['Ürün', 'SKU', 'Sizin Fiyat', 'Min Rakip', 'Max Rakip', 'Ort. Rakip', 'Akakçe', 'Cimri', 'Durum'],
      ...filteredData.map((d) => {
        const status = getStatus(d.ourPrice, d.minCompetitor).text;
        return [d.productName, d.sku, d.ourPrice, d.minCompetitor, d.maxCompetitor, d.avgCompetitor, d.akakcePrice, d.cimriPrice, status];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fiyat-izleme-raporu.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDetail = (product: CompetitorPriceEntry) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const handleHistory = (product: CompetitorPriceEntry) => {
    setSelectedProduct(product);
    setHistoryDialogOpen(true);
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className={cn('min-h-screen bg-slate-50 p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
        <Skeleton />
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className={cn('min-h-screen bg-slate-50 p-4 md:p-6 transition-all', sidebarOpen ? 'lg:ml-64' : 'ml-16')}>
      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
            Akakçe &amp; Rakip Fiyat İzleme
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Akakçe, Cimri ve diğer platformlardaki rakip fiyatlarını takip edin
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="text-slate-600" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Yenile
          </Button>
          <Button variant="outline" size="sm" className="text-slate-600" onClick={() => setShowFilter(!showFilter)}>
            <Filter className="h-4 w-4 mr-1" />
            Filtrele
          </Button>
          <Button variant="outline" size="sm" className="text-slate-600" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Dışa Aktar
          </Button>
          <Button variant="outline" size="sm" className="text-slate-600" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button variant="outline" size="sm" className="text-slate-600" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Yazdır
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm"
            onClick={() => setAlertDialogOpen(true)}
          >
            <BellPlus className="h-4 w-4 mr-1" />
            Uyarı Ekle
          </Button>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* İzlenen Ürün */}
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">İzlenen Ürün</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalProducts}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Aktif takip
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </Card>

        {/* En Ucuz Siz */}
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">En Ucuz Siz</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.cheapestCount}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  %{data.length > 0 ? Math.round((stats.cheapestCount / data.length) * 100) : 0} avantaj
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </Card>

        {/* Fiyat Uyumu */}
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fiyat Uyumu</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.compatibleCount}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-blue-500" />
                  %5 fark içinde
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
        </Card>

        {/* Ort. Fark */}
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ort. Fark</p>
                <p className={cn('text-2xl font-bold mt-1', stats.avgDiff >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {stats.avgDiff >= 0 ? '+' : ''}{fmt(stats.avgDiff)}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  {stats.avgDiff >= 0 ? (
                    <><TrendingUp className="h-3 w-3 text-emerald-500" /> Rakiplere karşı üstün</>
                  ) : (
                    <><TrendingDown className="h-3 w-3 text-red-500" /> Rakiplerden pahalı</>
                  )}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
          <div className={cn('h-1 bg-gradient-to-r', stats.avgDiff >= 0 ? 'from-emerald-400 to-emerald-500' : 'from-red-400 to-red-500')} />
        </Card>
      </div>

      {/* ============ FILTER PANEL ============ */}
      {showFilter && (
        <Card className="border-slate-200 bg-white rounded-xl shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Platform Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Platform</label>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Platformlar</SelectItem>
                    <SelectItem value="Akakçe">Akakçe</SelectItem>
                    <SelectItem value="Cimri">Cimri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Min Fiyat (₺)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Max Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Max Fiyat (₺)</label>
                <Input
                  type="number"
                  placeholder="999.999"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Only Expensive Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Sadece pahalı olanlar</label>
                <div className="flex items-center gap-3 h-9 bg-slate-50 rounded-lg px-3">
                  <Switch
                    checked={onlyExpensive}
                    onCheckedChange={setOnlyExpensive}
                  />
                  <span className="text-sm text-slate-600">
                    {onlyExpensive ? 'Sadece pahalı' : 'Tümü'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ TABS ============ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:text-emerald-600">
            <Eye className="h-4 w-4 mr-1" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:text-emerald-600">
            <BarChart3 className="h-4 w-4 mr-1" />
            Fiyat Karşılaştırma
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:text-emerald-600">
            <History className="h-4 w-4 mr-1" />
            Geçmiş
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:text-emerald-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            Uyarılar
            {alerts.filter((a) => a.severity === 'critical').length > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {alerts.filter((a) => a.severity === 'critical').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB: GENEL BAKIŞ ============ */}
        <TabsContent value="overview" className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Ürün adı veya SKU ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <p className="text-xs text-slate-500">
              {filteredData.length} / {data.length} ürün
            </p>
          </div>

          {/* Product Price Comparison Table */}
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                    <tr>
                      {[
                        { key: 'productName' as SortField, label: 'Ürün' },
                        { key: 'sku' as SortField, label: 'SKU' },
                        { key: 'ourPrice' as SortField, label: 'Sizin Fiyat' },
                        { key: 'minCompetitor' as SortField, label: 'Min Rakip' },
                        { key: 'maxCompetitor' as SortField, label: 'Max Rakip' },
                        { key: 'avgCompetitor' as SortField, label: 'Ort. Rakip' },
                        { key: 'akakcePrice' as SortField, label: 'Akakçe' },
                        { key: 'cimriPrice' as SortField, label: 'Cimri' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-emerald-600 transition-colors whitespace-nowrap"
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                          <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        Aksiyon
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((product) => {
                      const status = getStatus(product.ourPrice, product.minCompetitor);
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">
                            {product.productName}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                            {product.sku}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {fmt(product.ourPrice)}
                          </td>
                          <td className={cn('px-4 py-3', getPriceBgColor(product.ourPrice, product.minCompetitor))}>
                            {fmt(product.minCompetitor)}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {fmt(product.maxCompetitor)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {fmt(product.avgCompetitor)}
                          </td>
                          <td className={cn('px-4 py-3', getPriceBgColor(product.ourPrice, product.akakcePrice))}>
                            {fmt(product.akakcePrice)}
                          </td>
                          <td className={cn('px-4 py-3', getPriceBgColor(product.ourPrice, product.cimriPrice))}>
                            {fmt(product.cimriPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[11px] border', status.className)}>
                              {status.text}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Fiyat Güncelle"
                                onClick={() => handleDetail(product)}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                title="Detay"
                                onClick={() => handleDetail(product)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                title="Geçmiş"
                                onClick={() => handleHistory(product)}
                              >
                                <History className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Sonuç bulunamadı</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Price History Bar Chart */}
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Fiyat Trendi — Son 6 Ay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {/* Simple CSS-based bar chart (no recharts dependency needed) */}
                <div className="flex items-end justify-around gap-3 h-full px-4 pb-8 relative">
                  {/* Y-axis grid lines */}
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                      style={{ bottom: `${pct}%` }}
                    >
                      <span className="absolute -left-2 -top-3 text-[10px] text-slate-400">
                        {fmtShort((80000 * pct) / 100)}
                      </span>
                    </div>
                  ))}
                  {chartData.map((item) => {
                    const ourHeight = (item['Sizin Fiyat'] / 80000) * 100;
                    const compHeight = (item['Rakip Ortalaması'] / 80000) * 100;
                    return (
                      <div key={item.month} className="flex-1 flex items-end justify-center gap-1 relative z-10">
                        {/* Our price bar */}
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all hover:opacity-80 cursor-pointer relative group"
                            style={{ height: `${ourHeight}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                              {fmt(item['Sizin Fiyat'])}
                            </div>
                          </div>
                        </div>
                        {/* Competitor avg bar */}
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md transition-all hover:opacity-80 cursor-pointer relative group"
                            style={{ height: `${compHeight}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                              {fmt(item['Rakip Ortalaması'])}
                            </div>
                          </div>
                        </div>
                        {/* Month label */}
                        <div className="absolute -bottom-7 left-0 right-0 text-center text-xs text-slate-500 font-medium">
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    <span className="text-xs text-slate-600">Sizin Fiyat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-amber-500 to-amber-400" />
                    <span className="text-xs text-slate-600">Rakip Ortalaması</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TAB: FİYAT KARŞILAŞTIRMA ============ */}
        <TabsContent value="comparison" className="space-y-4">
          {/* Visual Price Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.map((product) => {
              const status = getStatus(product.ourPrice, product.minCompetitor);
              const diffFromMin = product.ourPrice - product.minCompetitor;
              const diffPct = ((diffFromMin / product.minCompetitor) * 100).toFixed(1);
              return (
                <Card key={product.id} className="border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">{product.productName}</h3>
                        <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                      </div>
                      <Badge className={cn('text-[10px] border shrink-0 ml-2', status.className)}>
                        {status.text}
                      </Badge>
                    </div>

                    {/* Price bars */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 w-16">Siz</span>
                        <div className="flex-1 mx-2 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${Math.min((product.ourPrice / product.maxCompetitor) * 100, 100)}%` }}
                          >
                            <span className="text-[10px] text-white font-bold">{fmtShort(product.ourPrice)}</span>
                          </div>
                        </div>
                        <span className="text-emerald-600 font-semibold w-20 text-right">{fmt(product.ourPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 w-16">Akakçe</span>
                        <div className="flex-1 mx-2 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                          <div
                            className={cn('h-full rounded-full flex items-center justify-end pr-2 transition-all', diffFromMin <= 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-amber-500 to-amber-400')}
                            style={{ width: `${Math.min((product.akakcePrice / product.maxCompetitor) * 100, 100)}%` }}
                          >
                            <span className="text-[10px] text-white font-bold">{fmtShort(product.akakcePrice)}</span>
                          </div>
                        </div>
                        <span className={cn('font-semibold w-20 text-right', getPriceBgColor(product.ourPrice, product.akakcePrice))}>
                          {fmt(product.akakcePrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 w-16">Cimri</span>
                        <div className="flex-1 mx-2 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                          <div
                            className={cn('h-full rounded-full flex items-center justify-end pr-2 transition-all', diffFromMin <= 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-amber-500 to-amber-400')}
                            style={{ width: `${Math.min((product.cimriPrice / product.maxCompetitor) * 100, 100)}%` }}
                          >
                            <span className="text-[10px] text-white font-bold">{fmtShort(product.cimriPrice)}</span>
                          </div>
                        </div>
                        <span className={cn('font-semibold w-20 text-right', getPriceBgColor(product.ourPrice, product.cimriPrice))}>
                          {fmt(product.cimriPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Difference info */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">En ucuz rakibe fark</span>
                      <span className={cn('text-xs font-semibold', diffFromMin <= 0 ? 'text-emerald-600' : diffFromMin <= product.minCompetitor * 0.05 ? 'text-amber-600' : 'text-red-500')}>
                        {diffFromMin <= 0 ? '' : '+'}{fmt(diffFromMin)} (%{diffPct})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============ TAB: GEÇMİŞ ============ */}
        <TabsContent value="history" className="space-y-4">
          {/* Price History Full Chart */}
          <Card className="border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-600" />
                Fiyat Geçmişi — Genel Bakış
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <div className="flex items-end justify-around gap-4 h-full px-4 pb-8 relative">
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                      style={{ bottom: `${pct}%` }}
                    >
                      <span className="absolute -left-2 -top-3 text-[10px] text-slate-400">
                        {fmtShort((80000 * pct) / 100)}
                      </span>
                    </div>
                  ))}
                  {chartData.map((item) => {
                    const ourHeight = (item['Sizin Fiyat'] / 80000) * 100;
                    const compHeight = (item['Rakip Ortalaması'] / 80000) * 100;
                    const diff = item['Sizin Fiyat'] - item['Rakip Ortalaması'];
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                        <div className="text-[10px] font-semibold text-emerald-600">
                          {diff <= 0 ? '' : '+'}{fmt(diff)}
                        </div>
                        <div className="flex items-end justify-center gap-2 w-full" style={{ height: 'calc(100% - 20px)' }}>
                          <div className="flex-1 flex items-end justify-center">
                            <div
                              className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all hover:opacity-80 cursor-pointer relative group max-w-[60px]"
                              style={{ height: `${ourHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                Siz: {fmt(item['Sizin Fiyat'])}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 flex items-end justify-center">
                            <div
                              className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all hover:opacity-80 cursor-pointer relative group max-w-[60px]"
                              style={{ height: `${compHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                Rakip: {fmt(item['Rakip Ortalaması'])}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-7 left-0 right-0 text-center text-xs text-slate-600 font-medium">
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-emerald-600 to-emerald-400" />
                    <span className="text-xs text-slate-600">Sizin Fiyat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-amber-600 to-amber-400" />
                    <span className="text-xs text-slate-600">Rakip Ortalaması</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Product Histories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.slice(0, 6).map((product) => {
              const status = getStatus(product.ourPrice, product.minCompetitor);
              const diffFromMin = product.ourPrice - product.minCompetitor;
              return (
                <Card key={product.id} className="border-slate-200 bg-white rounded-xl shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{product.productName}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</p>
                      </div>
                      <Badge className={cn('text-[10px] border', status.className)}>{status.text}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Akakçe</p>
                        <p className={cn('text-xs font-bold', getPriceBgColor(product.ourPrice, product.akakcePrice))}>
                          {fmt(product.akakcePrice)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Cimri</p>
                        <p className={cn('text-xs font-bold', getPriceBgColor(product.ourPrice, product.cimriPrice))}>
                          {fmt(product.cimriPrice)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Fark</p>
                        <p className={cn('text-xs font-bold', diffFromMin <= 0 ? 'text-emerald-600' : 'text-red-500')}>
                          {diffFromMin <= 0 ? '' : '+'}{fmt(diffFromMin)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Son güncelleme
                      </span>
                      <span>{new Date(product.lastUpdate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============ TAB: UYARILAR ============ */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50/50 rounded-xl shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-red-700">{alerts.filter((a) => a.severity === 'critical').length}</p>
                  <p className="text-xs text-red-600">Kritik Uyarı</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50 rounded-xl shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-700">{alerts.filter((a) => a.severity === 'warning').length}</p>
                  <p className="text-xs text-amber-600">Dikkat Gerektiren</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50 rounded-xl shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-700">{alerts.filter((a) => a.severity === 'info').length}</p>
                  <p className="text-xs text-blue-600">Bilgi Notu</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Cards */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  'rounded-xl shadow-sm border-l-4',
                  alert.severity === 'critical' && 'border-l-red-500 border-red-200 bg-white',
                  alert.severity === 'warning' && 'border-l-amber-500 border-amber-200 bg-white',
                  alert.severity === 'info' && 'border-l-blue-500 border-blue-200 bg-white'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertSeverityIcon severity={alert.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{alert.productName}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{alert.sku}</p>
                        </div>
                        <Badge
                          className={cn(
                            'text-[10px] border shrink-0',
                            alert.severity === 'critical' && 'bg-red-100 text-red-700 border-red-200',
                            alert.severity === 'warning' && 'bg-amber-100 text-amber-700 border-amber-200',
                            alert.severity === 'info' && 'bg-blue-100 text-blue-700 border-blue-200'
                          )}
                        >
                          {alert.severity === 'critical' ? 'Kritik' : alert.severity === 'warning' ? 'Uyarı' : 'Bilgi'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-500">{alert.competitor}</span>
                        </span>
                        <span>
                          <span className="line-through text-slate-400">{fmt(alert.oldPrice)}</span>
                          <span className="mx-1">→</span>
                          <span className="font-semibold text-red-600">{fmt(alert.newPrice)}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-red-500">
                          <TrendingDown className="h-3 w-3" />
                          %{Math.abs(alert.changePercent).toFixed(1)} düşüş
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ============ DETAIL DIALOG ============ */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Fiyat Detayı
            </DialogTitle>
            <DialogDescription>Ürün fiyat karşılaştırma detayları</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{selectedProduct.productName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedProduct.sku}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Sizin Fiyat', value: fmt(selectedProduct.ourPrice), color: 'text-emerald-600' },
                  { label: 'Min Rakip', value: fmt(selectedProduct.minCompetitor), color: 'text-slate-700' },
                  { label: 'Max Rakip', value: fmt(selectedProduct.maxCompetitor), color: 'text-slate-700' },
                  { label: 'Ort. Rakip', value: fmt(selectedProduct.avgCompetitor), color: 'text-slate-700' },
                  { label: 'Akakçe', value: fmt(selectedProduct.akakcePrice), color: getPriceBgColor(selectedProduct.ourPrice, selectedProduct.akakcePrice) },
                  { label: 'Cimri', value: fmt(selectedProduct.cimriPrice), color: getPriceBgColor(selectedProduct.ourPrice, selectedProduct.cimriPrice) },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                    <p className={cn('text-sm font-bold mt-1', item.color)}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-slate-500">Durum:</span>
                <Badge className={cn('text-[11px] border', getStatus(selectedProduct.ourPrice, selectedProduct.minCompetitor).className)}>
                  {getStatus(selectedProduct.ourPrice, selectedProduct.minCompetitor).text}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ HISTORY DIALOG ============ */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              Fiyat Geçmişi
            </DialogTitle>
            <DialogDescription>Ürün fiyat değişim geçmişi</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{selectedProduct.productName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedProduct.sku}</p>
              </div>
              <div className="h-48">
                <div className="flex items-end justify-around gap-3 h-full px-4 pb-8 relative">
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                      style={{ bottom: `${pct}%` }}
                    >
                      <span className="absolute -left-2 -top-3 text-[10px] text-slate-400">
                        {fmtShort((selectedProduct.maxCompetitor * pct) / 100)}
                      </span>
                    </div>
                  ))}
                  {MOCK_HISTORY.map((h, idx) => {
                    const ourH = (h.ourPrice / selectedProduct.maxCompetitor) * 100;
                    const compH = (h.competitorAvg / selectedProduct.maxCompetitor) * 100;
                    return (
                      <div key={idx} className="flex-1 flex items-end justify-center gap-1 relative z-10">
                        <div
                          className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md hover:opacity-80 transition-opacity cursor-pointer"
                          style={{ height: `${ourH}%` }}
                          title={`Siz: ${fmt(h.ourPrice)}`}
                        />
                        <div
                          className="flex-1 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md hover:opacity-80 transition-opacity cursor-pointer"
                          style={{ height: `${compH}%` }}
                          title={`Rakip: ${fmt(h.competitorAvg)}`}
                        />
                        <div className="absolute -bottom-7 left-0 right-0 text-center text-[10px] text-slate-500">
                          {h.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-slate-600">Siz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                    <span className="text-xs text-slate-600">Rakip</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ ADD ALERT DIALOG ============ */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BellPlus className="h-5 w-5 text-emerald-600" />
              Yeni Fiyat Uyarısı
            </DialogTitle>
            <DialogDescription>Rakip fiyat değişimlerinde bildirim alın</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Ürün Seçin</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ürün seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {data.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.productName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Platform</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Platform seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="akakce">Akakçe</SelectItem>
                  <SelectItem value="cimri">Cimri</SelectItem>
                  <SelectItem value="all">Tüm Platformlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Fiyat Eşiği (₺)</label>
              <Input placeholder="Örn: 5.000" className="h-9" />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
              <Switch checked={notifyPriceDrop} onCheckedChange={setNotifyPriceDrop} />
              <span className="text-sm text-slate-600">Fiyat düştüğünde bildir</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
              <Switch checked={notifyPriceRise} onCheckedChange={setNotifyPriceRise} />
              <span className="text-sm text-slate-600">Fiyat yükseldiğinde bildir</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>İptal</Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm">
              <BellPlus className="h-4 w-4 mr-1" />
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
