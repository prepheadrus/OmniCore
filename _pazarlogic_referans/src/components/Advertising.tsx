'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  CreditCard,
  Eye,
  MousePointerClick,
  TrendingUp,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Play,
  Pause,
  GripVertical,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  DollarSign,
  Target,
  Tv,
  RotateCcw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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

// ─── TypeScript Types ───────────────────────────────────────────────

interface AdCampaign {
  id: string;
  name: string;
  marketplace: string;
  type: string;
  budget: number;
  dailyBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  productIds: string[];
  targeting: Record<string, unknown>;
  creative: Record<string, unknown>;
}

interface SpendTrendPoint {
  date: string;
  harcama: number;
  gosterim: number;
}

interface PerformanceSlice {
  name: string;
  value: number;
  color: string;
}

interface CampaignFormData {
  name: string;
  marketplace: string;
  type: string;
  budget: string;
  dailyBudget: string;
  startDate: string;
  endDate: string;
  productIds: string;
  targeting: string;
  creative: string;
}

// ─── Constants ──────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Taslak', cls: 'bg-slate-100 text-slate-700 border border-slate-200' },
  active: { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
  paused: { label: 'Duraklatıldı', cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  completed: { label: 'Tamamlandı', cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
};

const TYPE_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  sponsored: {
    label: 'Sponsored',
    cls: 'bg-purple-100 text-purple-800 border border-purple-200',
    icon: <Target className="h-3 w-3" />,
  },
  display: {
    label: 'Display',
    cls: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: <Tv className="h-3 w-3" />,
  },
  video: {
    label: 'Video',
    cls: 'bg-pink-100 text-pink-800 border border-pink-200',
    icon: <Play className="h-3 w-3" />,
  },
  retargeting: {
    label: 'Retargeting',
    cls: 'bg-orange-100 text-orange-800 border border-orange-200',
    icon: <RotateCcw className="h-3 w-3" />,
  },
};

const MARKETPLACE_OPTIONS = [
  'Trendyol',
  'Hepsiburada',
  'n11',
  'Amazon TR',
  'Google Ads',
  'Meta Ads',
  'tümü',
];

const TYPE_OPTIONS = ['sponsored', 'display', 'video', 'retargeting'];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Aktif' },
  { value: 'draft', label: 'Taslak' },
  { value: 'paused', label: 'Duraklatıldı' },
  { value: 'completed', label: 'Tamamlandı' },
];

const MARKETPLACE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'Trendyol', label: 'Trendyol' },
  { value: 'Hepsiburada', label: 'Hepsiburada' },
  { value: 'n11', label: 'n11' },
  { value: 'Google Ads', label: 'Google Ads' },
  { value: 'Meta Ads', label: 'Meta Ads' },
];

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const INITIAL_FORM_STATE: CampaignFormData = {
  name: '',
  marketplace: '',
  type: '',
  budget: '',
  dailyBudget: '',
  startDate: '',
  endDate: '',
  productIds: '[]',
  targeting: '{}',
  creative: '{}',
};

// ─── Demo Data ──────────────────────────────────────────────────────

const DEMO_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'demo-1',
    name: 'Yaz Sezonu Spotlight Kampanyası',
    marketplace: 'Trendyol',
    type: 'sponsored',
    budget: 15000,
    dailyBudget: 500,
    spent: 8750,
    impressions: 342000,
    clicks: 12800,
    ctr: 3.74,
    roas: 4.2,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'active',
    productIds: ['PRD-001', 'PRD-002', 'PRD-005'],
    targeting: { region: 'all', age: '18-55', gender: 'all' },
    creative: { format: 'image', size: '1200x628' },
  },
  {
    id: 'demo-2',
    name: 'Elektronik Fırsatları',
    marketplace: 'Hepsiburada',
    type: 'display',
    budget: 25000,
    dailyBudget: 800,
    spent: 19200,
    impressions: 567000,
    clicks: 18200,
    ctr: 3.21,
    roas: 3.8,
    startDate: '2025-05-15',
    endDate: '2025-07-15',
    status: 'active',
    productIds: ['PRD-010', 'PRD-011'],
    targeting: { region: 'marmara', age: '25-45', gender: 'all' },
    creative: { format: 'banner', size: '728x90' },
  },
  {
    id: 'demo-3',
    name: 'Moda Videoları Kampanyası',
    marketplace: 'Instagram',
    type: 'video',
    budget: 10000,
    dailyBudget: 350,
    spent: 6200,
    impressions: 189000,
    clicks: 5400,
    ctr: 2.86,
    roas: 5.1,
    startDate: '2025-07-01',
    endDate: '2025-09-01',
    status: 'active',
    productIds: ['PRD-020', 'PRD-021', 'PRD-022'],
    targeting: { region: 'all', age: '18-35', gender: 'female' },
    creative: { format: 'video', duration: '15s' },
  },
  {
    id: 'demo-4',
    name: 'Sepet Bırakma Retargeting',
    marketplace: 'Meta Ads',
    type: 'retargeting',
    budget: 8000,
    dailyBudget: 250,
    spent: 5400,
    impressions: 98000,
    clicks: 7800,
    ctr: 7.96,
    roas: 8.3,
    startDate: '2025-06-15',
    endDate: '2025-08-15',
    status: 'active',
    productIds: ['PRD-003', 'PRD-007', 'PRD-009'],
    targeting: { audience: 'cart_abandoners', recency: '30d' },
    creative: { format: 'carousel', size: '1080x1080' },
  },
  {
    id: 'demo-5',
    name: 'Google Alışveriş Kampanyası',
    marketplace: 'Google Ads',
    type: 'sponsored',
    budget: 20000,
    dailyBudget: 700,
    spent: 14500,
    impressions: 423000,
    clicks: 21100,
    ctr: 4.99,
    roas: 3.5,
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    status: 'completed',
    productIds: ['PRD-030', 'PRD-031'],
    targeting: { region: 'all', device: 'all', bid_strategy: 'target_roas' },
    creative: { format: 'shopping_ad' },
  },
  {
    id: 'demo-6',
    name: 'n11 Özel Gün Kampanyası',
    marketplace: 'n11',
    type: 'display',
    budget: 5000,
    dailyBudget: 200,
    spent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    roas: 0,
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    status: 'draft',
    productIds: ['PRD-040'],
    targeting: { region: 'all' },
    creative: { format: 'image', size: '468x60' },
  },
  {
    id: 'demo-7',
    name: 'Amazon TR Launch',
    marketplace: 'Amazon TR',
    type: 'sponsored',
    budget: 12000,
    dailyBudget: 400,
    spent: 3800,
    impressions: 156000,
    clicks: 6200,
    ctr: 3.97,
    roas: 2.9,
    startDate: '2025-07-10',
    endDate: '2025-10-10',
    status: 'paused',
    productIds: ['PRD-050', 'PRD-051', 'PRD-052', 'PRD-053'],
    targeting: { region: 'all', category: 'electronics' },
    creative: { format: 'sponsored_products' },
  },
  {
    id: 'demo-8',
    name: 'Meta Dinamik Retargeting',
    marketplace: 'Meta Ads',
    type: 'retargeting',
    budget: 6000,
    dailyBudget: 200,
    spent: 4100,
    impressions: 72000,
    clicks: 5800,
    ctr: 8.06,
    roas: 7.2,
    startDate: '2025-06-01',
    endDate: '2025-08-01',
    status: 'completed',
    productIds: ['PRD-005', 'PRD-010'],
    targeting: { audience: 'website_visitors', recency: '14d' },
    creative: { format: 'dynamic_product_ad' },
  },
];

const DEMO_SPEND_TREND: SpendTrendPoint[] = [
  { date: '01 Tem', harcama: 1200, gosterim: 45000 },
  { date: '02 Tem', harcama: 1450, gosterim: 52000 },
  { date: '03 Tem', harcama: 980, gosterim: 38000 },
  { date: '04 Tem', harcama: 1680, gosterim: 61000 },
  { date: '05 Tem', harcama: 2100, gosterim: 74000 },
  { date: '06 Tem', harcama: 1850, gosterim: 67000 },
  { date: '07 Tem', harcama: 2350, gosterim: 82000 },
  { date: '08 Tem', harcama: 2700, gosterim: 91000 },
  { date: '09 Tem', harcama: 2400, gosterim: 85000 },
  { date: '10 Tem', harcama: 2950, gosterim: 98000 },
  { date: '11 Tem', harcama: 3100, gosterim: 105000 },
  { date: '12 Tem', harcama: 2850, gosterim: 96000 },
  { date: '13 Tem', harcama: 3200, gosterim: 110000 },
  { date: '14 Tem', harcama: 3500, gosterim: 118000 },
];

// ─── Helpers ────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function formatPercent(value: number): string {
  return `%${value.toFixed(2)}`;
}

// ─── Component ──────────────────────────────────────────────────────

export default function Advertising() {
  const { sidebarOpen } = useAppStore();

  // State
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [spendTrend, setSpendTrend] = useState<SpendTrendPoint[]>(DEMO_SPEND_TREND);

  // ── Data Fetching ─────────────────────────────────────────────────

  const fetchCampaigns = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/advertising?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCampaigns(data);
          return;
        }
      }
    } catch {
      // API unavailable – fall through to demo data
    }
    setCampaigns(DEMO_CAMPAIGNS);
  }, [statusFilter]);

  useEffect(() => {
    fetchCampaigns().finally(() => setLoading(false));
  }, [fetchCampaigns]);

  // ── Computed Values ───────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = campaigns.length;
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const totalRevenue = campaigns.reduce((s, c) => s + c.spent * c.roas, 0);
    const avgRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0;

    return {
      totalBudget,
      totalSpent,
      totalImpressions,
      totalClicks,
      avgCtr,
      avgRoas,
    };
  }, [campaigns]);

  const performanceData: PerformanceSlice[] = useMemo(() => {
    const grouped: Record<string, number> = {};
    campaigns.forEach((c) => {
      const label = TYPE_MAP[c.type]?.label || c.type;
      grouped[label] = (grouped[label] || 0) + c.spent;
    });
    return Object.entries(grouped).map(([name, value], i) => ({
      name,
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (marketplaceFilter !== 'all') {
      result = result.filter((c) => c.marketplace === marketplaceFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.marketplace.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q),
      );
    }

    return result;
  }, [campaigns, statusFilter, marketplaceFilter, searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────

  function openCreateDialog() {
    setEditingCampaign(null);
    setFormData(INITIAL_FORM_STATE);
    setDialogOpen(true);
  }

  function openEditDialog(campaign: AdCampaign) {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      marketplace: campaign.marketplace,
      type: campaign.type,
      budget: String(campaign.budget),
      dailyBudget: String(campaign.dailyBudget),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      productIds: JSON.stringify(campaign.productIds, null, 2),
      targeting: JSON.stringify(campaign.targeting, null, 2),
      creative: JSON.stringify(campaign.creative, null, 2),
    });
    setDialogOpen(true);
  }

  function handleFormFieldChange(field: keyof CampaignFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!formData.name || !formData.marketplace || !formData.type || !formData.budget) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        action: editingCampaign ? 'update' : ('create' as const),
        id: editingCampaign?.id,
        name: formData.name,
        marketplace: formData.marketplace,
        type: formData.type,
        budget: Number(formData.budget),
        dailyBudget: Number(formData.dailyBudget) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        productIds: JSON.parse(formData.productIds || '[]'),
        targeting: JSON.parse(formData.targeting || '{}'),
        creative: JSON.parse(formData.creative || '{}'),
      };

      const res = await fetch('/api/advertising', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchCampaigns();
      } else {
        // Simulate local update for demo
        if (editingCampaign) {
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === editingCampaign.id
                ? { ...c, ...payload, spent: c.spent, impressions: c.impressions, clicks: c.clicks, ctr: c.ctr, roas: c.roas }
                : c,
            ),
          );
        } else {
          const newCampaign: AdCampaign = {
            id: `local-${Date.now()}`,
            name: formData.name,
            marketplace: formData.marketplace,
            type: formData.type,
            budget: Number(formData.budget),
            dailyBudget: Number(formData.dailyBudget) || 0,
            spent: 0,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            roas: 0,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: 'draft',
            productIds: JSON.parse(formData.productIds || '[]'),
            targeting: JSON.parse(formData.targeting || '{}'),
            creative: JSON.parse(formData.creative || '{}'),
          };
          setCampaigns((prev) => [newCampaign, ...prev]);
        }
      }
      setDialogOpen(false);
    } catch {
      // Offline fallback – update locally
      if (editingCampaign) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === editingCampaign.id
              ? { ...c, name: formData.name, marketplace: formData.marketplace, type: formData.type, budget: Number(formData.budget), dailyBudget: Number(formData.dailyBudget) || 0, startDate: formData.startDate, endDate: formData.endDate }
              : c,
          ),
        );
      } else {
        const newCampaign: AdCampaign = {
          id: `local-${Date.now()}`,
          name: formData.name,
          marketplace: formData.marketplace,
          type: formData.type,
          budget: Number(formData.budget),
          dailyBudget: Number(formData.dailyBudget) || 0,
          spent: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          roas: 0,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: 'draft',
          productIds: JSON.parse(formData.productIds || '[]'),
          targeting: JSON.parse(formData.targeting || '{}'),
          creative: JSON.parse(formData.creative || '{}'),
        };
        setCampaigns((prev) => [newCampaign, ...prev]);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch('/api/advertising', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
    } catch {
      // Offline fallback
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    let newStatus: AdCampaign['status'];
    if (currentStatus === 'active') {
      newStatus = 'paused';
    } else if (currentStatus === 'paused' || currentStatus === 'draft') {
      newStatus = 'active';
    } else {
      return;
    }

    try {
      await fetch('/api/advertising', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status', id, status: newStatus }),
      });
    } catch {
      // Offline fallback
    }
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  }

  // ── Loading Skeleton ──────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <div className="mb-6">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
          <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div
      className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
    >
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reklam Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tüm pazaryeri reklam kampanyalarınızı tek panelden yönetin, performansı izleyin
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="mt-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:from-emerald-600 hover:to-emerald-700 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </Button>
      </div>

      {/* ── 1. Stats Bar ──────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Toplam Bütçe */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-2">
            <Wallet className="h-3.5 w-3.5" />
            Toplam Bütçe
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.totalBudget)}</p>
        </div>

        {/* Harcanan */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-2">
            <CreditCard className="h-3.5 w-3.5" />
            Harcanan
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
          {stats.totalBudget > 0 && (
            <div className="mt-1 flex items-center gap-1 text-emerald-200 text-xs">
              <ArrowUpRight className="h-3 w-3" />
              %{((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)} kullanım
            </div>
          )}
        </div>

        {/* Toplam Gösterim */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-2">
            <Eye className="h-3.5 w-3.5" />
            Toplam Gösterim
          </div>
          <p className="text-xl font-bold">{formatNumber(stats.totalImpressions)}</p>
        </div>

        {/* Toplam Tıklama */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-2">
            <MousePointerClick className="h-3.5 w-3.5" />
            Toplam Tıklama
          </div>
          <p className="text-xl font-bold">{formatNumber(stats.totalClicks)}</p>
        </div>

        {/* Ortalama CTR */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Ortalama CTR
          </div>
          <p className="text-xl font-bold">{formatPercent(stats.avgCtr)}</p>
          {stats.avgCtr >= 3 && (
            <div className="mt-1 flex items-center gap-1 text-emerald-200 text-xs">
              <ArrowUpRight className="h-3 w-3" />
              İyi performans
            </div>
          )}
        </div>

        {/* Ortalama ROAS */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Ortalama ROAS
          </div>
          <p className="text-xl font-bold">{stats.avgRoas.toFixed(2)}x</p>
          {stats.avgRoas >= 4 && (
            <div className="mt-1 flex items-center gap-1 text-emerald-200 text-xs">
              <ArrowUpRight className="h-3 w-3" />
              Mükemmel dönüşüm
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Charts Section ─────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Harcama Trendi – AreaChart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Harcama Trendi</h3>
              <p className="text-xs text-slate-500 mt-0.5">Son 14 günlük harcama ve gösterim</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Harcama (₺)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-200" />
                Gösterim
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={spendTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'harcama') return [formatCurrency(value), 'Harcama'];
                  return [formatNumber(value), 'Gösterim'];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="harcama"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#spendGradient)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="gosterim"
                stroke="#6ee7b7"
                strokeWidth={1.5}
                fill="url(#impressionsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performans Dağılımı – PieChart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-800">Performans Dağılımı</h3>
            <p className="text-xs text-slate-500 mt-0.5">Kampanya türüne göre harcama oranı</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Harcama']}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 5. Quick Actions Bar (above table) ────────────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Kampanya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 mr-1">Durum:</span>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1">Pazaryeri:</span>
            {MARKETPLACE_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMarketplaceFilter(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  marketplaceFilter === opt.value
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Campaign Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-800">Kampanyalar</h3>
            <Badge variant="secondary" className="text-xs ml-1">
              {filteredCampaigns.length} kampanya
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-10"></TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kampanya Adı
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Pazaryeri
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tür
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Bütçe
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Harcanan
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Gösterim
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Tıklama
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  CTR
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  ROAS
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Durum
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  İşlemler
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-slate-500 text-sm">
                    Kampanya bulunamadı. Filtrelerinizi değiştirmeyi veya yeni bir kampanya oluşturmayı deneyin.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign, idx) => {
                  const statusInfo = STATUS_MAP[campaign.status] || STATUS_MAP.draft;
                  const typeInfo = TYPE_MAP[campaign.type] || {
                    label: campaign.type,
                    cls: 'bg-slate-100 text-slate-700 border border-slate-200',
                    icon: <Megaphone className="h-3 w-3" />,
                  };
                  const budgetUsage = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0;

                  return (
                    <TableRow
                      key={campaign.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      {/* Drag Handle */}
                      <TableCell className="pl-3">
                        <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                      </TableCell>

                      {/* Kampanya Adı */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{campaign.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {campaign.startDate && campaign.endDate
                              ? `${new Date(campaign.startDate).toLocaleDateString('tr-TR')} - ${new Date(campaign.endDate).toLocaleDateString('tr-TR')}`
                              : 'Tarih belirtilmemiş'}
                          </p>
                        </div>
                      </TableCell>

                      {/* Pazaryeri */}
                      <TableCell>
                        <span className="text-sm text-slate-700">{campaign.marketplace}</span>
                      </TableCell>

                      {/* Tür */}
                      <TableCell>
                        <Badge variant="outline" className={`text-xs gap-1 ${typeInfo.cls}`}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Bütçe */}
                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-slate-800">
                          {formatCurrency(campaign.budget)}
                        </span>
                      </TableCell>

                      {/* Harcanan */}
                      <TableCell className="text-right">
                        <div>
                          <span className="text-sm font-medium text-slate-800">
                            {formatCurrency(campaign.spent)}
                          </span>
                          <div className="mt-1 h-1.5 w-full max-w-[80px] ml-auto rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                budgetUsage > 80
                                  ? 'bg-red-400'
                                  : budgetUsage > 50
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Gösterim */}
                      <TableCell className="text-right">
                        <span className="text-sm text-slate-700">
                          {formatNumber(campaign.impressions)}
                        </span>
                      </TableCell>

                      {/* Tıklama */}
                      <TableCell className="text-right">
                        <span className="text-sm text-slate-700">
                          {formatNumber(campaign.clicks)}
                        </span>
                      </TableCell>

                      {/* CTR */}
                      <TableCell className="text-right">
                        <span
                          className={`text-sm font-medium ${
                            campaign.ctr >= 4
                              ? 'text-emerald-600'
                              : campaign.ctr >= 2
                                ? 'text-amber-600'
                                : 'text-slate-500'
                          }`}
                        >
                          {formatPercent(campaign.ctr)}
                        </span>
                      </TableCell>

                      {/* ROAS */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {campaign.roas >= 4 ? (
                            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                          ) : campaign.roas > 0 && campaign.roas < 2 ? (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                          ) : null}
                          <span
                            className={`text-sm font-medium ${
                              campaign.roas >= 4
                                ? 'text-emerald-600'
                                : campaign.roas >= 2
                                  ? 'text-amber-600'
                                  : campaign.roas > 0
                                    ? 'text-red-500'
                                    : 'text-slate-400'
                            }`}
                          >
                            {campaign.roas > 0 ? `${campaign.roas.toFixed(2)}x` : '-'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Durum */}
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* İşlemler */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEditDialog(campaign)}
                            title="Düzenle"
                            className="text-slate-500 hover:text-emerald-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {(campaign.status === 'active' ||
                            campaign.status === 'paused' ||
                            campaign.status === 'draft') && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                              title={campaign.status === 'active' ? 'Duraklat' : 'Devam Ettir'}
                              className={`${
                                campaign.status === 'active'
                                  ? 'text-amber-500 hover:text-amber-600'
                                  : 'text-emerald-500 hover:text-emerald-600'
                              }`}
                            >
                              {campaign.status === 'active' ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(campaign.id)}
                            title="Sil"
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── 4. Create/Edit Dialog ──────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">
              {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingCampaign
                ? 'Mevcut kampanya bilgilerini güncelleyin.'
                : 'Yeni bir reklam kampanyası oluşturmak için aşağıdaki formu doldurun.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="ad-name" className="text-sm font-medium text-slate-700">
                Kampanya Adı *
              </Label>
              <Input
                id="ad-name"
                placeholder="Örn: Yaz Sezonu Kampanyası"
                value={formData.name}
                onChange={(e) => handleFormFieldChange('name', e.target.value)}
              />
            </div>

            {/* Marketplace & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ad-marketplace" className="text-sm font-medium text-slate-700">
                  Pazaryeri *
                </Label>
                <Select
                  value={formData.marketplace}
                  onValueChange={(val) => handleFormFieldChange('marketplace', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pazaryeri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETPLACE_OPTIONS.map((mp) => (
                      <SelectItem key={mp} value={mp}>
                        {mp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ad-type" className="text-sm font-medium text-slate-700">
                  Kampanya Türü *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => handleFormFieldChange('type', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => {
                      const info = TYPE_MAP[t];
                      return (
                        <SelectItem key={t} value={t}>
                          {info?.label || t}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget & Daily Budget Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ad-budget" className="text-sm font-medium text-slate-700">
                  Toplam Bütçe (₺) *
                </Label>
                <Input
                  id="ad-budget"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => handleFormFieldChange('budget', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ad-daily-budget" className="text-sm font-medium text-slate-700">
                  Günlük Bütçe (₺)
                </Label>
                <Input
                  id="ad-daily-budget"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.dailyBudget}
                  onChange={(e) => handleFormFieldChange('dailyBudget', e.target.value)}
                />
              </div>
            </div>

            {/* Start & End Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ad-start" className="text-sm font-medium text-slate-700">
                  Başlangıç Tarihi
                </Label>
                <Input
                  id="ad-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormFieldChange('startDate', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ad-end" className="text-sm font-medium text-slate-700">
                  Bitiş Tarihi
                </Label>
                <Input
                  id="ad-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormFieldChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Product IDs */}
            <div className="grid gap-2">
              <Label htmlFor="ad-products" className="text-sm font-medium text-slate-700">
                Ürün ID&apos;leri (JSON)
              </Label>
              <textarea
                id="ad-products"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono"
                placeholder='["PRD-001", "PRD-002"]'
                value={formData.productIds}
                onChange={(e) => handleFormFieldChange('productIds', e.target.value)}
              />
            </div>

            {/* Targeting */}
            <div className="grid gap-2">
              <Label htmlFor="ad-targeting" className="text-sm font-medium text-slate-700">
                Hedefleme (JSON)
              </Label>
              <textarea
                id="ad-targeting"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono"
                placeholder='{"region": "all", "age": "18-55"}'
                value={formData.targeting}
                onChange={(e) => handleFormFieldChange('targeting', e.target.value)}
              />
            </div>

            {/* Creative */}
            <div className="grid gap-2">
              <Label htmlFor="ad-creative" className="text-sm font-medium text-slate-700">
                Kreatif (JSON)
              </Label>
              <textarea
                id="ad-creative"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-mono"
                placeholder='{"format": "image", "size": "1200x628"}'
                value={formData.creative}
                onChange={(e) => handleFormFieldChange('creative', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.marketplace || !formData.type || !formData.budget}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : editingCampaign ? (
                'Güncelle'
              ) : (
                'Oluştur'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
