'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  Eye,
  ArrowUpDown,
  ShoppingCart,
  Star,
  Package,
  Percent,
  Zap,
  Activity,
  Calculator,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

/* ================================================================
   Types
   ================================================================ */
interface CompetitorPrice {
  id: string;
  productName: string;
  sku: string;
  competitor: string;
  marketplace: string;
  price: number;
  ourPrice: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating: number;
  reviewCount: number;
  lastUpdated: string;
}

type SortField =
  | 'productName'
  | 'sku'
  | 'competitor'
  | 'marketplace'
  | 'price'
  | 'ourPrice'
  | 'difference'
  | 'differencePercent'
  | 'rating'
  | 'reviewCount';
type SortDir = 'asc' | 'desc';

interface SimulationResult {
  newPrice: number;
  oldPrice: number;
  newDifference: number;
  newDifferencePercent: number;
  estimatedSalesImpact: string;
  profitAnalysis: string;
  marketPosition: string;
  rankChange: number;
}

/* ================================================================
   Constants
   ================================================================ */
const MARKETPLACES = [
  'Trendyol',
  'Hepsiburada',
  'n11',
  'Amazon TR',
  'Çiçeksepeti',
  'Morhipo',
];

const MARKETPLACE_COLORS: Record<string, string> = {
  Trendyol: '#ff6f00',
  Hepsiburada: '#ef4444',
  n11: '#7c3aed',
  'Amazon TR': '#f59e0b',
  Çiçeksepeti: '#ec4899',
  Morhipo: '#3b82f6',
};

const STOCK_LABELS: Record<string, string> = {
  in_stock: 'Stokta',
  low_stock: 'Az Stok',
  out_of_stock: 'Tükendi',
};

const STOCK_BADGE: Record<string, string> = {
  in_stock: 'bg-emerald-100 text-emerald-700',
  low_stock: 'bg-amber-100 text-amber-700',
  out_of_stock: 'bg-red-100 text-red-700',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

/* ================================================================
   Sample Data
   ================================================================ */
const SAMPLE_DATA: CompetitorPrice[] = [
  {
    id: 'cp-001',
    productName: 'iPhone 15 Pro Max 256GB',
    sku: 'APL-IP15PM-256',
    competitor: 'Teknosa',
    marketplace: 'Trendyol',
    price: 74_999,
    ourPrice: 72_999,
    stockStatus: 'in_stock',
    rating: 4.8,
    reviewCount: 234,
    lastUpdated: '2024-12-15T10:30:00Z',
  },
  {
    id: 'cp-002',
    productName: 'iPhone 15 Pro Max 256GB',
    sku: 'APL-IP15PM-256',
    competitor: 'Vatan Bilgisayar',
    marketplace: 'Hepsiburada',
    price: 75_499,
    ourPrice: 72_999,
    stockStatus: 'in_stock',
    rating: 4.7,
    reviewCount: 189,
    lastUpdated: '2024-12-15T09:15:00Z',
  },
  {
    id: 'cp-003',
    productName: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-256',
    competitor: 'MediaMarkt',
    marketplace: 'Trendyol',
    price: 64_999,
    ourPrice: 63_499,
    stockStatus: 'in_stock',
    rating: 4.6,
    reviewCount: 312,
    lastUpdated: '2024-12-15T11:00:00Z',
  },
  {
    id: 'cp-004',
    productName: 'MacBook Air M3 15"',
    sku: 'APL-MBA-M3-15',
    competitor: 'Teknosa',
    marketplace: 'Hepsiburada',
    price: 52_999,
    ourPrice: 54_499,
    stockStatus: 'in_stock',
    rating: 4.9,
    reviewCount: 156,
    lastUpdated: '2024-12-14T16:45:00Z',
  },
  {
    id: 'cp-005',
    productName: 'MacBook Air M3 15"',
    sku: 'APL-MBA-M3-15',
    competitor: 'Vatan Bilgisayar',
    marketplace: 'n11',
    price: 51_999,
    ourPrice: 54_499,
    stockStatus: 'low_stock',
    rating: 4.5,
    reviewCount: 98,
    lastUpdated: '2024-12-14T14:20:00Z',
  },
  {
    id: 'cp-006',
    productName: 'Sony WH-1000XM5 Kulaklık',
    sku: 'SNY-WH1K-XM5',
    competitor: 'Hepsiburada',
    marketplace: 'Hepsiburada',
    price: 9_499,
    ourPrice: 8_999,
    stockStatus: 'in_stock',
    rating: 4.7,
    reviewCount: 1245,
    lastUpdated: '2024-12-15T08:00:00Z',
  },
  {
    id: 'cp-007',
    productName: 'Sony WH-1000XM5 Kulaklık',
    sku: 'SNY-WH1K-XM5',
    competitor: 'Amazon TR',
    marketplace: 'Amazon TR',
    price: 9_299,
    ourPrice: 8_999,
    stockStatus: 'in_stock',
    rating: 4.8,
    reviewCount: 2103,
    lastUpdated: '2024-12-15T07:30:00Z',
  },
  {
    id: 'cp-008',
    productName: 'iPad Air M2 11"',
    sku: 'APL-IPA-M2-11',
    competitor: 'Teknosa',
    marketplace: 'Trendyol',
    price: 27_999,
    ourPrice: 26_999,
    stockStatus: 'in_stock',
    rating: 4.6,
    reviewCount: 567,
    lastUpdated: '2024-12-14T18:00:00Z',
  },
  {
    id: 'cp-009',
    productName: 'iPad Air M2 11"',
    sku: 'APL-IPA-M2-11',
    competitor: 'Morhipo',
    marketplace: 'Morhipo',
    price: 28_499,
    ourPrice: 26_999,
    stockStatus: 'out_of_stock',
    rating: 4.3,
    reviewCount: 89,
    lastUpdated: '2024-12-13T12:00:00Z',
  },
  {
    id: 'cp-010',
    productName: 'Xiaomi 14 Ultra',
    sku: 'XIA-14U-512',
    competitor: 'Vatan Bilgisayar',
    marketplace: 'n11',
    price: 49_999,
    ourPrice: 48_499,
    stockStatus: 'in_stock',
    rating: 4.5,
    reviewCount: 234,
    lastUpdated: '2024-12-15T10:00:00Z',
  },
  {
    id: 'cp-011',
    productName: 'Xiaomi 14 Ultra',
    sku: 'XIA-14U-512',
    competitor: 'Hepsiburada',
    marketplace: 'Hepsiburada',
    price: 50_499,
    ourPrice: 48_499,
    stockStatus: 'in_stock',
    rating: 4.4,
    reviewCount: 178,
    lastUpdated: '2024-12-15T09:45:00Z',
  },
  {
    id: 'cp-012',
    productName: 'Samsung Galaxy Tab S9 FE',
    sku: 'SAM-TS9FE-128',
    competitor: 'Çiçeksepeti',
    marketplace: 'Çiçeksepeti',
    price: 14_999,
    ourPrice: 15_499,
    stockStatus: 'in_stock',
    rating: 4.2,
    reviewCount: 456,
    lastUpdated: '2024-12-14T20:00:00Z',
  },
  {
    id: 'cp-013',
    productName: 'Apple Watch Ultra 2',
    sku: 'APL-AWU2-49',
    competitor: 'Teknosa',
    marketplace: 'Trendyol',
    price: 29_999,
    ourPrice: 27_999,
    stockStatus: 'in_stock',
    rating: 4.8,
    reviewCount: 345,
    lastUpdated: '2024-12-15T11:30:00Z',
  },
  {
    id: 'cp-014',
    productName: 'Apple Watch Ultra 2',
    sku: 'APL-AWU2-49',
    competitor: 'MediaMarkt',
    marketplace: 'Amazon TR',
    price: 28_499,
    ourPrice: 27_999,
    stockStatus: 'low_stock',
    rating: 4.7,
    reviewCount: 267,
    lastUpdated: '2024-12-15T08:15:00Z',
  },
  {
    id: 'cp-015',
    productName: 'Logitech MX Master 3S',
    sku: 'LOG-MXM3S-BK',
    competitor: 'Vatan Bilgisayar',
    marketplace: 'Hepsiburada',
    price: 3_299,
    ourPrice: 3_149,
    stockStatus: 'in_stock',
    rating: 4.9,
    reviewCount: 1890,
    lastUpdated: '2024-12-15T06:00:00Z',
  },
  {
    id: 'cp-016',
    productName: 'Logitech MX Master 3S',
    sku: 'LOG-MXM3S-BK',
    competitor: 'Amazon TR',
    marketplace: 'Amazon TR',
    price: 3_399,
    ourPrice: 3_149,
    stockStatus: 'in_stock',
    rating: 4.8,
    reviewCount: 3201,
    lastUpdated: '2024-12-15T05:45:00Z',
  },
];

/* ================================================================
   Helper Functions
   ================================================================ */
function priceDiffColor(diff: number): string {
  if (diff > 0) return 'text-emerald-600';
  if (diff < 0) return 'text-red-500';
  return 'text-slate-500';
}

function priceDiffBg(diff: number): string {
  if (diff > 0) return 'bg-emerald-50 text-emerald-700';
  if (diff < 0) return 'bg-red-50 text-red-600';
  return 'bg-slate-50 text-slate-600';
}

function positionLabel(position: number): { text: string; color: string } {
  if (position <= 1) return { text: 'En Ucuz', color: 'bg-emerald-100 text-emerald-700' };
  if (position <= 2) return { text: 'Çok İyi', color: 'bg-emerald-50 text-emerald-600' };
  if (position <= 3) return { text: 'İyi', color: 'bg-blue-50 text-blue-600' };
  if (position <= 4) return { text: 'Orta', color: 'bg-amber-50 text-amber-600' };
  return { text: 'Zayıf', color: 'bg-red-50 text-red-600' };
}

/* ================================================================
   Skeleton
   ================================================================ */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl" />
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-96 bg-slate-200 rounded-xl" />
    </div>
  );
}

/* ================================================================
   Custom Tooltip for Charts
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
          <span className="font-medium text-slate-800">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   SortIcon (must be outside render to avoid re-mounting)
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
   Main Component
   ================================================================ */
export default function CompetitorPrices() {
  const { sidebarOpen } = useAppStore();

  /* ---------- state ---------- */
  const [data, setData] = useState<CompetitorPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarketplace, setFilterMarketplace] = useState<string>('all');
  const [filterCompetitor, setFilterCompetitor] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('productName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  /* dialogs */
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CompetitorPrice | null>(null);

  /* simulation */
  const [simPrice, setSimPrice] = useState('');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  /* add form */
  const [form, setForm] = useState({
    productName: '',
    sku: '',
    competitor: '',
    marketplace: 'Trendyol',
    price: '',
    ourPrice: '',
    stockStatus: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock',
    rating: '4.5',
    reviewCount: '',
  });

  /* ---------- load data ---------- */
  useEffect(() => {
    fetch('/api/competitor-prices')
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setData(res);
        } else {
          setData(SAMPLE_DATA);
        }
      })
      .catch(() => setData(SAMPLE_DATA))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- derived data ---------- */
  const uniqueCompetitors = useMemo(
    () => Array.from(new Set(data.map((d) => d.competitor))).sort(),
    [data]
  );

  const filteredData = useMemo(() => {
    let items = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(
        (d) =>
          d.productName.toLowerCase().includes(q) ||
          d.sku.toLowerCase().includes(q) ||
          d.competitor.toLowerCase().includes(q)
      );
    }

    if (filterMarketplace !== 'all') {
      items = items.filter((d) => d.marketplace === filterMarketplace);
    }

    if (filterCompetitor !== 'all') {
      items = items.filter((d) => d.competitor === filterCompetitor);
    }

    items.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'difference':
          aVal = a.ourPrice - a.price;
          bVal = b.ourPrice - b.price;
          break;
        case 'differencePercent':
          aVal = ((a.ourPrice - a.price) / a.price) * 100;
          bVal = ((b.ourPrice - b.price) / b.price) * 100;
          break;
        default: {
          const key = sortField as keyof CompetitorPrice;
          aVal = a[key];
          bVal = b[key];
        }
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return items;
  }, [data, searchTerm, filterMarketplace, filterCompetitor, sortField, sortDir]);

  /* ---------- stats ---------- */
  const stats = useMemo(() => {
    const uniqueProducts = new Set(data.map((d) => d.sku)).size;
    const avgCompPrice =
      data.length > 0
        ? data.reduce((a, b) => a + b.price, 0) / data.length
        : 0;
    const cheapest = data.length > 0
      ? data.reduce((min, d) => (d.price < min.price ? d : min), data[0])
      : null;
    const expensive = data.length > 0
      ? data.reduce((max, d) => (d.price > max.price ? d : max), data[0])
      : null;
    const avgDiff =
      data.length > 0
        ? data.reduce((a, b) => a + (b.ourPrice - b.price), 0) / data.length
        : 0;
    const cheaperCount = data.filter((d) => d.ourPrice < d.price).length;
    const marketPosition =
      data.length > 0 ? ((cheaperCount / data.length) * 100).toFixed(0) : 0;

    return {
      uniqueProducts,
      avgCompPrice,
      cheapest,
      expensive,
      avgDiff,
      marketPosition,
      cheaperCount,
    };
  }, [data]);

  /* ---------- chart data: bar chart by product ---------- */
  const barChartData = useMemo(() => {
    const productMap = new Map<string, { name: string; prices: Record<string, number> }>();

    data.forEach((d) => {
      if (!productMap.has(d.sku)) {
        productMap.set(d.sku, { name: d.productName, prices: {} });
      }
      const entry = productMap.get(d.sku)!;
      entry.prices[d.competitor] = d.price;
      entry.prices['Bizim Fiyat'] = d.ourPrice;
    });

    return Array.from(productMap.values())
      .slice(0, 8)
      .map((item) => {
        const entries: Record<string, string | number> = {
          name: item.name.length > 22 ? item.name.slice(0, 22) + '...' : item.name,
        };
        Object.entries(item.prices).forEach(([k, v]) => {
          entries[k] = v;
        });
        return entries;
      });
  }, [data]);

  /* ---------- chart data: radar ---------- */
  const radarData = useMemo(() => {
    const ourAvgPrice =
      data.length > 0
        ? data.reduce((a, b) => a + b.ourPrice, 0) / new Set(data.map((d) => d.sku)).size
        : 0;
    const compAvgPrice =
      data.length > 0
        ? data.reduce((a, b) => a + b.price, 0) / data.length
        : 0;

    const priceCompetition = compAvgPrice > 0 ? Math.min(((compAvgPrice - ourAvgPrice) / compAvgPrice) * 100 + 50, 100) : 50;
    const stockScore = data.length > 0
      ? (data.filter((d) => d.stockStatus === 'in_stock').length / data.length) * 100
      : 50;
    const avgRating = data.length > 0 ? data.reduce((a, b) => a + b.rating, 0) / data.length * 20 : 50;
    const avgReviews = data.length > 0 ? Math.min(data.reduce((a, b) => a + b.reviewCount, 0) / data.length / 20, 100) : 50;
    const marketShare = stats.cheaperCount / (data.length || 1) * 100;

    return [
      { dimension: 'Fiyat Rekabeti', biz: priceCompetition, rakip: 55 },
      { dimension: 'Stok Durumu', biz: stockScore, rakip: 65 },
      { dimension: 'Müşteri Puanı', biz: avgRating, rakip: 70 },
      { dimension: 'Değerlendirme Sayısı', biz: avgReviews, rakip: 60 },
      { dimension: 'Pazar Payı', biz: marketShare, rakip: 50 },
    ];
  }, [data, stats]);

  /* ---------- scatter data ---------- */
  const scatterData = useMemo(() => {
    return data.map((d) => ({
      x: d.price,
      y: d.ourPrice,
      z: d.reviewCount,
      name: d.competitor,
      product: d.productName.length > 15 ? d.productName.slice(0, 15) + '...' : d.productName,
    }));
  }, [data]);

  /* ---------- line chart data: price trend simulation ---------- */
  const lineChartData = useMemo(() => {
    return data.slice(0, 6).map((d) => ({
      name: d.productName.length > 16 ? d.productName.slice(0, 16) + '...' : d.productName,
      'Bizim Fiyat': d.ourPrice,
      'Rakip Fiyat': d.price,
      fark: Math.abs(d.ourPrice - d.price),
    }));
  }, [data]);

  /* ---------- sort handler ---------- */
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



  /* ---------- handlers ---------- */
  const handleAddCompetitor = async () => {
    const newItem: Omit<CompetitorPrice, 'id' | 'lastUpdated'> = {
      productName: form.productName,
      sku: form.sku,
      competitor: form.competitor,
      marketplace: form.marketplace,
      price: parseFloat(form.price) || 0,
      ourPrice: parseFloat(form.ourPrice) || 0,
      stockStatus: form.stockStatus,
      rating: parseFloat(form.rating) || 0,
      reviewCount: parseInt(form.reviewCount) || 0,
    };

    try {
      await fetch('/api/competitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', ...newItem }),
      });
    } catch {
      // fallback: add locally
    }

    const newEntry: CompetitorPrice = {
      ...newItem,
      id: `cp-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    setData((prev) => [...prev, newEntry]);
    setAddDialogOpen(false);
    setForm({
      productName: '',
      sku: '',
      competitor: '',
      marketplace: 'Trendyol',
      price: '',
      ourPrice: '',
      stockStatus: 'in_stock',
      rating: '4.5',
      reviewCount: '',
    });
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await fetch('/api/competitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: selectedItem.id }),
      });
    } catch {
      // fallback: delete locally
    }

    setData((prev) => prev.filter((d) => d.id !== selectedItem.id));
    setDeleteConfirmOpen(false);
    setSelectedItem(null);
  };

  const handleSimulate = async () => {
    if (!selectedItem || !simPrice) return;
    setSimLoading(true);
    setSimResult(null);

    const newPrice = parseFloat(simPrice);
    const diff = newPrice - selectedItem.price;
    const diffPct = ((newPrice - selectedItem.price) / selectedItem.price) * 100;

    try {
      const res = await fetch('/api/competitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate-pricing',
          id: selectedItem.id,
          newPrice,
          currentPrice: selectedItem.ourPrice,
          competitorPrice: selectedItem.price,
        }),
      });

      const result = await res.json();
      if (result && typeof result === 'object') {
        setSimResult({
          newPrice,
          oldPrice: selectedItem.ourPrice,
          newDifference: diff,
          newDifferencePercent: diffPct,
          estimatedSalesImpact: result.estimatedSalesImpact || (diff < 0 ? 'Satışlar %15-25 artabilir' : 'Satışlar %10-20 azalabilir'),
          profitAnalysis: result.profitAnalysis || (diff < 0 ? 'Birim kar düşecek ama hacim artışı ile telafi edebilir' : 'Birim kar artacak ama satış hacmi düşebilir'),
          marketPosition: result.marketPosition || (diff < -500 ? 'En Ucuz konumuna yükselebilir' : 'Mevcut pozisyon korunacak'),
          rankChange: result.rankChange || (diff < 0 ? 1 : -1),
        });
      }
    } catch {
      // fallback: compute locally
      setSimResult({
        newPrice,
        oldPrice: selectedItem.ourPrice,
        newDifference: diff,
        newDifferencePercent: diffPct,
        estimatedSalesImpact: diff < 0 ? 'Satışlar %15-25 artabilir' : 'Satışlar %10-20 azalabilir',
        profitAnalysis: diff < 0 ? 'Birim kar düşecek ama hacim artışı ile telafi edebilir' : 'Birim kar artacak ama satış hacmi düşebilir',
        marketPosition: diff < -500 ? 'En Ucuz konumuna yükselebilir' : 'Mevcut pozisyon korunacak',
        rankChange: diff < 0 ? 1 : -1,
      });
    }

    setSimLoading(false);
  };

  const handleOpenSimulate = (item: CompetitorPrice) => {
    setSelectedItem(item);
    setSimPrice(item.ourPrice.toString());
    setSimResult(null);
    setSimulateDialogOpen(true);
  };

  const handleAnalysis = async (item: CompetitorPrice) => {
    try {
      await fetch('/api/competitor-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analysis', productId: item.id }),
      });
    } catch {
      // analysis call
    }
  };

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-50 p-6 transition-all',
          sidebarOpen ? 'lg:ml-64' : 'ml-16'
        )}
      >
        <Skeleton />
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 p-6 transition-all',
        sidebarOpen ? 'lg:ml-64' : 'ml-16'
      )}
    >
      {/* ============ PAGE HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600" />
            Rakip Fiyat Analizi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pazar yerlerindeki rakip fiyatlarını karşılaştırın ve stratejik fiyatlandırma yapın
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-slate-600"
            onClick={() => {
              setLoading(true);
              fetch('/api/competitor-prices')
                .then((r) => r.json())
                .then((res) => {
                  if (Array.isArray(res) && res.length > 0) setData(res);
                })
                .catch(() => {})
                .finally(() => setLoading(false));
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Yenile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-slate-600"
            onClick={() => {
              const csv = [
                ['Ürün', 'SKU', 'Rakip', 'Pazaryer', 'Rakip Fiyatı', 'Bizim Fiyat', 'Fark (₺)', 'Fark (%)'],
                ...data.map((d) => [
                  d.productName,
                  d.sku,
                  d.competitor,
                  d.marketplace,
                  d.price,
                  d.ourPrice,
                  d.ourPrice - d.price,
                  (((d.ourPrice - d.price) / d.price) * 100).toFixed(1) + '%',
                ]),
              ]
                .map((row) => row.join(','))
                .join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'rakip-fiyatlari.csv';
              a.click();
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            CSV İndir
          </Button>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Rakip Ekle
          </Button>
        </div>
      </div>

      {/* ============ STATS BAR ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Takip Edilen Ürün */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">Takip Edilen Ürün</p>
              <p className="text-2xl font-bold mt-1">{stats.uniqueProducts}</p>
              <p className="text-xs text-emerald-100 mt-1">{data.length} kayıt</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Ortalama Rakip Fiyatı */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">Ort. Rakip Fiyatı</p>
              <p className="text-xl font-bold mt-1">{fmt(stats.avgCompPrice)}</p>
              <p className="text-xs text-emerald-100 mt-1">tüm pazaryerleri</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* En Ucuz Rakip */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">En Ucuz Rakip</p>
              <p className="text-xl font-bold mt-1">
                {stats.cheapest ? fmt(stats.cheapest.price) : '-'}
              </p>
              <p className="text-xs text-emerald-100 mt-1 truncate">
                {stats.cheapest?.competitor || '-'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* En Pahalı Rakip */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">En Pahalı Rakip</p>
              <p className="text-xl font-bold mt-1">
                {stats.expensive ? fmt(stats.expensive.price) : '-'}
              </p>
              <p className="text-xs text-emerald-100 mt-1 truncate">
                {stats.expensive?.competitor || '-'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Fiyat Farkı Ort. */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">Fiyat Farkı Ort.</p>
              <p className="text-xl font-bold mt-1">
                {stats.avgDiff >= 0 ? '+' : ''}
                {fmt(stats.avgDiff)}
              </p>
              <p className="text-xs text-emerald-100 mt-1">
                {stats.avgDiff >= 0 ? 'Biz daha ucuz' : 'Rakip daha ucuz'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Pazar Konumumuz */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">Pazar Konumumuz</p>
              <p className="text-2xl font-bold mt-1">%{stats.marketPosition}</p>
              <p className="text-xs text-emerald-100 mt-1">avantajlı pozisyon</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ============ CHARTS SECTION ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* BarChart: Price Comparison */}
        <Card className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Ürün Bazlı Fiyat Karşılaştırma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    angle={-30}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {Object.keys(
                    barChartData.length > 0 && typeof barChartData[0] === 'object'
                      ? (barChartData[0] as Record<string, unknown>)
                      : {}
                  )
                    .filter((key) => key !== 'name')
                    .map((key, idx) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={
                          key === 'Bizim Fiyat'
                            ? '#10b981'
                            : ['#f59e0b', '#ef4444', '#7c3aed', '#ec4899', '#3b82f6'][
                                idx % 5
                              ]
                        }
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RadarChart: Market Position */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-600" />
              Pazar Konumu Radarı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Biz"
                    dataKey="biz"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Rakip Ort."
                    dataKey="rakip"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value: string) =>
                      value === 'Biz' ? 'Mağazamız' : 'Rakip Ortalaması'
                    }
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ SCATTER + LINE CHARTS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* ScatterChart: Price Distribution */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-600" />
              Fiyat Dağılımı (Rakip vs Biz)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="x"
                    name="Rakip Fiyatı"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    label={{
                      value: 'Rakip Fiyatı',
                      position: 'insideBottom',
                      offset: -5,
                      style: { fontSize: 11, fill: '#94a3b8' },
                    }}
                  />
                  <YAxis
                    dataKey="y"
                    name="Bizim Fiyat"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    label={{
                      value: 'Bizim Fiyat',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
                      style: { fontSize: 11, fill: '#94a3b8' },
                    }}
                  />
                  <ZAxis dataKey="z" range={[40, 200]} name="Değerlendirme" />
                  <Tooltip
                    formatter={(value: number, name: string) => [fmt(value), name === 'x' ? 'Rakip Fiyatı' : 'Bizim Fiyat']}
                    labelFormatter={(_, payload) => {
                      if (payload && payload.length > 0) {
                        const p = payload[0].payload as { product?: string };
                        return p.product || '';
                      }
                      return '';
                    }}
                  />
                  <Scatter data={scatterData} fill="#10b981">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.y < entry.x ? '#10b981' : entry.y < entry.x * 1.05 ? '#f59e0b' : '#ef4444'
                        }
                        fillOpacity={0.7}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* LineChart: Price Difference */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              Fiyat ve Fark Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    angle={-30}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="Bizim Fiyat"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Rakip Fiyat"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ QUICK ACTIONS BAR ============ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Ürün, SKU veya rakip ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterMarketplace} onValueChange={setFilterMarketplace}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <SelectValue placeholder="Pazaryer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Pazaryerleri</SelectItem>
                {MARKETPLACES.map((mp) => (
                  <SelectItem key={mp} value={mp}>
                    {mp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCompetitor} onValueChange={setFilterCompetitor}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <SelectValue placeholder="Rakip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Rakipler</SelectItem>
                {uniqueCompetitors.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(v) => handleSort(v as SortField)}
            >
              <SelectTrigger className="w-[170px] h-9 text-sm">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productName">Ürün Adı</SelectItem>
                <SelectItem value="price">Rakip Fiyatı</SelectItem>
                <SelectItem value="ourPrice">Bizim Fiyat</SelectItem>
                <SelectItem value="difference">Fark (₺)</SelectItem>
                <SelectItem value="differencePercent">Fark (%)</SelectItem>
                <SelectItem value="rating">Puan</SelectItem>
                <SelectItem value="marketplace">Pazaryer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Result count */}
          <div className="text-sm text-slate-500 ml-auto hidden md:block">
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} sonuç
            </Badge>
          </div>
        </div>
      </div>

      {/* ============ PRICE COMPARISON TABLE ============ */}
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              Detaylı Fiyat Karşılaştırma Tablosu
            </span>
            <Badge variant="outline" className="text-xs font-normal text-slate-500">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('productName')}
                  >
                    Ürün <SortIcon field="productName" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('sku')}
                  >
                    SKU <SortIcon field="sku" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Rakip</th>
                  <th
                    className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('marketplace')}
                  >
                    Pazaryer <SortIcon field="marketplace" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('price')}
                  >
                    Rakip Fiyatı <SortIcon field="price" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('ourPrice')}
                  >
                    Bizim Fiyat <SortIcon field="ourPrice" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('difference')}
                  >
                    Fark (₺) <SortIcon field="difference" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('differencePercent')}
                  >
                    Fark (%) <SortIcon field="differencePercent" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Stok</th>
                  <th
                    className="text-center py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('rating')}
                  >
                    Puan <SortIcon field="rating" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      Sonuç bulunamadı
                    </td>
                  </tr>
                )}
                {filteredData.map((item) => {
                  const diff = item.ourPrice - item.price;
                  const diffPct = ((diff / item.price) * 100).toFixed(1);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{item.competitor}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: MARKETPLACE_COLORS[item.marketplace] || '#94a3b8',
                            color: MARKETPLACE_COLORS[item.marketplace] || '#64748b',
                          }}
                        >
                          {item.marketplace}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {fmt(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        {fmt(item.ourPrice)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold',
                            priceDiffBg(diff)
                          )}
                        >
                          {diff >= 0 ? '+' : ''}
                          {fmt(diff)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            priceDiffColor(diff)
                          )}
                        >
                          {diff >= 0 ? '+' : ''}
                          {diffPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={cn('text-xs', STOCK_BADGE[item.stockStatus])}>
                          {STOCK_LABELS[item.stockStatus]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-700">
                            {item.rating} ({item.reviewCount})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-600"
                            title="Fiyat Simülasyonu"
                            onClick={() => handleOpenSimulate(item)}
                          >
                            <Calculator className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                            title="Fiyat Analizi"
                            onClick={() => handleAnalysis(item)}
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                            title="Sil"
                            onClick={() => {
                              setSelectedItem(item);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============ ADD COMPETITOR DIALOG ============ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Yeni Rakip Fiyatı Ekle
            </DialogTitle>
            <DialogDescription>
              Takip etmek istediğiniz rakip fiyat bilgisini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Ürün Adı
                </Label>
                <Input
                  value={form.productName}
                  onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                  placeholder="örn. iPhone 15 Pro"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  SKU
                </Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="örn. APL-IP15-256"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Rakip Mağaza
                </Label>
                <Input
                  value={form.competitor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, competitor: e.target.value }))
                  }
                  placeholder="örn. Teknosa"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Pazaryer
                </Label>
                <Select
                  value={form.marketplace}
                  onValueChange={(v) => setForm((f) => ({ ...f, marketplace: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETPLACES.map((mp) => (
                      <SelectItem key={mp} value={mp}>
                        {mp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Rakip Fiyatı (₺)
                </Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Bizim Fiyat (₺)
                </Label>
                <Input
                  type="number"
                  value={form.ourPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ourPrice: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Stok Durumu
                </Label>
                <Select
                  value={form.stockStatus}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      stockStatus: v as 'in_stock' | 'low_stock' | 'out_of_stock',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">Stokta</SelectItem>
                    <SelectItem value="low_stock">Az Stok</SelectItem>
                    <SelectItem value="out_of_stock">Tükendi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Puan (1-5)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rating: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">
                  Değerlendirme
                </Label>
                <Input
                  type="number"
                  value={form.reviewCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reviewCount: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleAddCompetitor}
              disabled={
                !form.productName.trim() ||
                !form.competitor.trim() ||
                !form.price ||
                !form.ourPrice
              }
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ PRICE SIMULATION DIALOG ============ */}
      <Dialog open={simulateDialogOpen} onOpenChange={setSimulateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Fiyat Simülasyonu
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? `${selectedItem.productName} — ${selectedItem.competitor} (${selectedItem.marketplace})`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Current info */}
            <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Rakip Fiyatı</span>
                <p className="font-semibold text-slate-800">
                  {selectedItem ? fmt(selectedItem.price) : '-'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Mevcut Fiyatımız</span>
                <p className="font-semibold text-emerald-700">
                  {selectedItem ? fmt(selectedItem.ourPrice) : '-'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Mevcut Fark</span>
                <p
                  className={cn(
                    'font-semibold',
                    selectedItem
                      ? priceDiffColor(selectedItem.ourPrice - selectedItem.price)
                      : ''
                  )}
                >
                  {selectedItem
                    ? `${selectedItem.ourPrice - selectedItem.price >= 0 ? '+' : ''}${fmt(
                        selectedItem.ourPrice - selectedItem.price
                      )}`
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Rakip Puanı</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  {selectedItem ? (
                    <>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {selectedItem.rating}
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>

            {/* New price input */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1 block">
                Yeni Fiyat (₺)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={simPrice}
                  onChange={(e) => setSimPrice(e.target.value)}
                  className="text-lg font-semibold pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₺
                </span>
              </div>
            </div>

            {/* Simulate button */}
            <Button
              onClick={handleSimulate}
              disabled={!simPrice || simLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              {simLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Hesaplanıyor...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Simülasyon Çalıştır
                </>
              )}
            </Button>

            {/* Results */}
            {simResult && (
              <div className="space-y-3">
                <div className="border-t border-slate-200 pt-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">
                    Simülasyon Sonuçları
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500">Yeni Fiyat</span>
                      <p className="font-bold text-slate-800 text-lg">
                        {fmt(simResult.newPrice)}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500">Yeni Fark</span>
                      <p
                        className={cn(
                          'font-bold text-lg',
                          priceDiffColor(simResult.newDifference)
                        )}
                      >
                        {simResult.newDifference >= 0 ? '+' : ''}
                        {fmt(simResult.newDifference)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 mt-2">
                    <span className="text-xs text-slate-500">Fark Yüzdesi</span>
                    <p
                      className={cn(
                        'font-bold text-lg',
                        priceDiffColor(simResult.newDifference)
                      )}
                    >
                      {simResult.newDifferencePercent >= 0 ? '+' : ''}
                      {simResult.newDifferencePercent.toFixed(1)}%
                    </p>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2 bg-emerald-50 rounded-lg p-3">
                      <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-700">
                          Pazar Konumu
                        </p>
                        <p className="text-sm text-emerald-600">
                          {simResult.marketPosition}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                      <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700">
                          Tahmini Satış Etkisi
                        </p>
                        <p className="text-sm text-blue-600">
                          {simResult.estimatedSalesImpact}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3">
                      <Percent className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">
                          Kâr Analizi
                        </p>
                        <p className="text-sm text-amber-600">
                          {simResult.profitAnalysis}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSimulateDialogOpen(false)}>
              Kapat
            </Button>
            {simResult && (
              <Button
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                onClick={() => {
                  if (selectedItem) {
                    setData((prev) =>
                      prev.map((d) =>
                        d.id === selectedItem.id
                          ? { ...d, ourPrice: simResult.newPrice }
                          : d
                      )
                    );
                    setSimulateDialogOpen(false);
                    setSimResult(null);
                  }
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Bu Fiyatı Uygula
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRM DIALOG ============ */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Kaydı Sil
            </DialogTitle>
            <DialogDescription>
              Bu rakip fiyat kaydını silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="bg-red-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-800">{selectedItem.productName}</p>
              <p className="text-red-600 mt-1">
                {selectedItem.competitor} — {selectedItem.marketplace} —{' '}
                {fmt(selectedItem.price)}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
