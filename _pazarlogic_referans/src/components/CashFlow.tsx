'use client';

import { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  CalendarDays,
  AlertTriangle,
  RefreshCw,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Bell,
  BellRing,
  Shield,
  Settings2,
  Info,
  CircleDollarSign,
  Landmark,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MarketplacePayment {
  marketplace: string;
  color: string;
  icon: string;
  period: string;
  periodLabel: string;
  lastPayment: string;
  expectedAmount: number;
  status: 'paid' | 'expected' | 'overdue';
  daysLeft: number;
}

interface TimelineEntry {
  day: string;
  date: string;
  amount: number;
  status: 'paid' | 'expected' | 'overdue' | 'none';
}

interface HistoricalPayment {
  id: string;
  marketplace: string;
  date: string;
  amount: number;
  period: string;
  status: 'completed' | 'pending' | 'failed';
  orderCount: number;
}

interface MonthlyForecast {
  month: string;
  trendyol: number;
  hepsiburada: number;
  n11: number;
  amazonTr: number;
  total: number;
}

interface CashFlowSettings {
  trendyolPeriod: string;
  hepsiburadaPeriod: string;
  n11Period: string;
  amazonPeriod: string;
  bankAccount: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyOverdue: boolean;
  notifyBefore: boolean;
  notifyDaysBefore: number;
  autoExport: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants & Mock Data                                              */
/* ------------------------------------------------------------------ */

const MARKETPLACES = ['Trendyol', 'Hepsiburada', 'n11', 'Amazon TR'] as const;

const MP_COLORS: Record<string, string> = {
  Trendyol: '#3b82f6',
  Hepsiburada: '#f97316',
  n11: '#8b5cf6',
  'Amazon TR': '#f59e0b',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1000000) return `₺${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₺${(n / 1000).toFixed(0)}K`;
  return `₺${n.toFixed(0)}`;
};

function getWeekDays(): { day: string; date: string; dayOfWeek: string }[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const result: { day: string; date: string; dayOfWeek: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    result.push({
      day: days[i],
      date: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      dayOfWeek: days[i],
    });
  }
  return result;
}

const WEEK_DAYS = getWeekDays();

const PAYMENT_SCHEDULES: MarketplacePayment[] = [
  {
    marketplace: 'Trendyol',
    color: '#3b82f6',
    icon: 'T',
    period: 'haftalık',
    periodLabel: 'Haftalık',
    lastPayment: '2025-01-13',
    expectedAmount: 287450,
    status: 'expected',
    daysLeft: 2,
  },
  {
    marketplace: 'Hepsiburada',
    color: '#f97316',
    icon: 'H',
    period: '15 günlük',
    periodLabel: '15 Günlük',
    lastPayment: '2025-01-10',
    expectedAmount: 194200,
    status: 'expected',
    daysLeft: 5,
  },
  {
    marketplace: 'n11',
    color: '#8b5cf6',
    icon: 'n',
    period: 'aylık',
    periodLabel: 'Aylık',
    lastPayment: '2024-12-28',
    expectedAmount: 156800,
    status: 'overdue',
    daysLeft: -8,
  },
  {
    marketplace: 'Amazon TR',
    color: '#f59e0b',
    icon: 'A',
    period: 'biweekly',
    periodLabel: 'İki Haftalık',
    lastPayment: '2025-01-07',
    expectedAmount: 98350,
    status: 'paid',
    daysLeft: 0,
  },
];

const TIMELINE_DATA: Record<string, TimelineEntry[]> = {
  Trendyol: [
    { day: 'Pzt', date: '13/01', amount: 0, status: 'none' },
    { day: 'Sal', date: '14/01', amount: 287450, status: 'expected' },
    { day: 'Çar', date: '15/01', amount: 0, status: 'none' },
    { day: 'Per', date: '16/01', amount: 0, status: 'none' },
    { day: 'Cum', date: '17/01', amount: 0, status: 'none' },
    { day: 'Cmt', date: '18/01', amount: 0, status: 'none' },
    { day: 'Paz', date: '19/01', amount: 0, status: 'none' },
  ],
  Hepsiburada: [
    { day: 'Pzt', date: '13/01', amount: 0, status: 'none' },
    { day: 'Sal', date: '14/01', amount: 0, status: 'none' },
    { day: 'Çar', date: '15/01', amount: 0, status: 'none' },
    { day: 'Per', date: '16/01', amount: 0, status: 'none' },
    { day: 'Cum', date: '17/01', amount: 0, status: 'none' },
    { day: 'Cmt', date: '18/01', amount: 194200, status: 'expected' },
    { day: 'Paz', date: '19/01', amount: 0, status: 'none' },
  ],
  n11: [
    { day: 'Pzt', date: '13/01', amount: 156800, status: 'overdue' },
    { day: 'Sal', date: '14/01', amount: 0, status: 'none' },
    { day: 'Çar', date: '15/01', amount: 0, status: 'none' },
    { day: 'Per', date: '16/01', amount: 0, status: 'none' },
    { day: 'Cum', date: '17/01', amount: 0, status: 'none' },
    { day: 'Cmt', date: '18/01', amount: 0, status: 'none' },
    { day: 'Paz', date: '19/01', amount: 0, status: 'none' },
  ],
  'Amazon TR': [
    { day: 'Pzt', date: '13/01', amount: 98350, status: 'paid' },
    { day: 'Sal', date: '14/01', amount: 0, status: 'none' },
    { day: 'Çar', date: '15/01', amount: 0, status: 'none' },
    { day: 'Per', date: '16/01', amount: 0, status: 'none' },
    { day: 'Cum', date: '17/01', amount: 0, status: 'none' },
    { day: 'Cmt', date: '18/01', amount: 0, status: 'none' },
    { day: 'Paz', date: '19/01', amount: 0, status: 'none' },
  ],
};

const HISTORICAL_PAYMENTS: HistoricalPayment[] = [
  { id: 'hp1', marketplace: 'Trendyol', date: '2025-01-06', amount: 312800, period: '06-12 Ocak', status: 'completed', orderCount: 847 },
  { id: 'hp2', marketplace: 'Hepsiburada', date: '2025-01-10', amount: 198400, period: '26 Aralık-10 Ocak', status: 'completed', orderCount: 523 },
  { id: 'hp3', marketplace: 'n11', date: '2024-12-28', amount: 162500, period: 'Aralık 2024', status: 'completed', orderCount: 412 },
  { id: 'hp4', marketplace: 'Amazon TR', date: '2025-01-07', amount: 98350, period: '24 Aralık-07 Ocak', status: 'completed', orderCount: 198 },
  { id: 'hp5', marketplace: 'Trendyol', date: '2024-12-30', amount: 295600, period: '29 Ara-05 Ocak', status: 'completed', orderCount: 792 },
  { id: 'hp6', marketplace: 'Hepsiburada', date: '2024-12-26', amount: 187300, period: '11-26 Aralık', status: 'completed', orderCount: 498 },
  { id: 'hp7', marketplace: 'n11', date: '2024-11-29', amount: 148900, period: 'Kasım 2024', status: 'completed', orderCount: 387 },
  { id: 'hp8', marketplace: 'Amazon TR', date: '2024-12-24', amount: 87600, period: '10-24 Aralık', status: 'completed', orderCount: 175 },
  { id: 'hp9', marketplace: 'Trendyol', date: '2024-12-23', amount: 278400, period: '22-29 Aralık', status: 'completed', orderCount: 741 },
  { id: 'hp10', marketplace: 'Hepsiburada', date: '2024-12-11', amount: 201700, period: '26 Kas-11 Aralık', status: 'completed', orderCount: 534 },
  { id: 'hp11', marketplace: 'n11', date: '2024-10-31', amount: 139200, period: 'Ekim 2024', status: 'failed', orderCount: 356 },
  { id: 'hp12', marketplace: 'Trendyol', date: '2024-12-16', amount: 301200, period: '15-22 Aralık', status: 'completed', orderCount: 812 },
];

const MONTHLY_FORECAST: MonthlyForecast[] = [
  { month: 'Oca', trendyol: 1150000, hepsiburada: 784000, n11: 490000, amazonTr: 393000, total: 2817000 },
  { month: 'Şub', trendyol: 1080000, hepsiburada: 720000, n11: 460000, amazonTr: 370000, total: 2630000 },
  { month: 'Mar', trendyol: 1240000, hepsiburada: 810000, n11: 510000, amazonTr: 410000, total: 2970000 },
  { month: 'Nis', trendyol: 1190000, hepsiburada: 790000, n11: 485000, amazonTr: 395000, total: 2860000 },
  { month: 'May', trendyol: 1320000, hepsiburada: 860000, n11: 540000, amazonTr: 430000, total: 3150000 },
  { month: 'Haz', trendyol: 1380000, hepsiburada: 900000, n11: 565000, amazonTr: 450000, total: 3295000 },
];

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  paid: { label: 'Ödendi', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  expected: { label: 'Bekleniyor', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> },
  overdue: { label: 'Gecikmiş', className: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
  completed: { label: 'Tamamlandı', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  pending: { label: 'Beklemede', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> },
  failed: { label: 'Başarısız', className: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="h-3 w-3" /> },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CashFlow() {
  const { sidebarOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [filterMp, setFilterMp] = useState<string>('all');

  // Settings state
  const [settings, setSettings] = useState<CashFlowSettings>({
    trendyolPeriod: 'haftalık',
    hepsiburadaPeriod: '15 günlük',
    n11Period: 'aylık',
    amazonPeriod: 'biweekly',
    bankAccount: 'TR33 0006 1005 1978 6457 8413 26',
    notifyEmail: true,
    notifySms: false,
    notifyOverdue: true,
    notifyBefore: true,
    notifyDaysBefore: 3,
    autoExport: false,
  });

  const filteredSchedules = useMemo(() => {
    if (filterMp === 'all') return PAYMENT_SCHEDULES;
    return PAYMENT_SCHEDULES.filter((s) => s.marketplace === filterMp);
  }, [filterMp]);

  const filteredTimeline = useMemo(() => {
    if (filterMp === 'all') return TIMELINE_DATA;
    const result: typeof TIMELINE_DATA = {};
    if (TIMELINE_DATA[filterMp]) {
      result[filterMp] = TIMELINE_DATA[filterMp];
    }
    return result;
  }, [filterMp]);

  const totalExpected = PAYMENT_SCHEDULES.reduce((acc, s) => acc + s.expectedAmount, 0);
  const thisWeekTotal = PAYMENT_SCHEDULES.filter(
    (s) => s.status === 'expected' && s.daysLeft > 0 && s.daysLeft <= 7
  ).reduce((acc, s) => acc + s.expectedAmount, 0) + PAYMENT_SCHEDULES.filter(s => s.status === 'paid').reduce((acc, s) => acc + s.expectedAmount, 0);
  const thisMonthTotal = totalExpected;
  const overdueTotal = PAYMENT_SCHEDULES.filter((s) => s.status === 'overdue').reduce(
    (acc, s) => acc + s.expectedAmount,
    0
  );

  const maxForecast = Math.max(...MONTHLY_FORECAST.map((m) => m.total));

  const summaryCards = [
    {
      title: 'Toplam Beklenen',
      value: fmt(totalExpected),
      icon: <Wallet className="h-5 w-5 text-white" />,
      bg: 'bg-emerald-600',
      trend: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />,
      sub: '%12 artış',
    },
    {
      title: 'Bu Hafta',
      value: fmt(thisWeekTotal),
      icon: <CalendarDays className="h-5 w-5 text-white" />,
      bg: 'bg-slate-700',
      trend: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />,
      sub: '2 ödeme',
    },
    {
      title: 'Bu Ay',
      value: fmt(thisMonthTotal),
      icon: <CircleDollarSign className="h-5 w-5 text-white" />,
      bg: 'bg-teal-600',
      trend: <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />,
      sub: '%3 düşüş',
    },
    {
      title: 'Geciken Ödeme',
      value: fmt(overdueTotal),
      icon: <AlertTriangle className="h-5 w-5 text-white" />,
      bg: 'bg-red-500',
      trend: overdueTotal > 0 ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> : null,
      sub: overdueTotal > 0 ? 'Acil takip' : 'Gecikme yok',
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleExport = () => {
    const rows = PAYMENT_SCHEDULES.map((s) => [
      s.marketplace,
      s.periodLabel,
      s.lastPayment,
      s.expectedAmount,
      s.status,
      s.daysLeft,
    ]);
    const csv = [
      ['Pazaryeri', 'Ödeme Periyodu', 'Son Ödeme', 'Beklenen Tutar', 'Durum', 'Gün Kaldı'],
      ...rows,
    ]
      .map((r) => r.map((c) => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nakit-akis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const timelineStatusColor: Record<string, string> = {
    paid: 'bg-emerald-500 border-emerald-600 text-white',
    expected: 'bg-amber-400 border-amber-500 text-amber-900',
    overdue: 'bg-red-500 border-red-600 text-white',
    none: 'bg-slate-50 border-slate-100',
  };

  /* ---------- Render ---------- */
  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 p-6 transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'ml-16'
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Nakit Akış Yönetimi</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Pazaryeri ödeme takvimi ve nakit akış tahmini
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-3 py-1">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canlı Takip
          </Badge>
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            <Landmark className="h-3 w-3 mr-1" />
            4 Pazaryeri
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-1', refreshing && 'animate-spin')} />
          Yenile
        </Button>
        <Select value={filterMp} onValueChange={setFilterMp}>
          <SelectTrigger size="sm" className="w-[160px]">
            <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="Trendyol">Trendyol</SelectItem>
            <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
            <SelectItem value="n11">n11</SelectItem>
            <SelectItem value="Amazon TR">Amazon TR</SelectItem>
          </SelectContent>
        </Select>
        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Dışa Aktar
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Excel
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />
          Yazdır
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="schedule">Ödeme Takvimi</TabsTrigger>
          <TabsTrigger value="history">Geçmiş Ödemeler</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1 — Genel Bakış                                         */}
        {/* ============================================================ */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <Card
                key={i}
                className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {card.title}
                    </p>
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110',
                        card.bg
                      )}
                    >
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-900 truncate">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {card.trend}
                    <span className="text-xs text-slate-500">{card.sub}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cash Flow Timeline */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Haftalık Nakit Akış Zaman Çizelgesi
                </CardTitle>
                <Badge variant="outline" className="text-xs text-slate-500">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {WEEK_DAYS[0].date} — {WEEK_DAYS[6].date}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Her pazaryeri için beklenen ödeme tarihleri ve tutarları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-1 mb-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                      Pazaryeri
                    </div>
                    {WEEK_DAYS.map((d) => (
                      <div
                        key={d.day}
                        className="text-center text-xs font-semibold text-slate-500"
                      >
                        {d.day}
                        <div className="text-[10px] text-slate-400 font-normal">{d.date}</div>
                      </div>
                    ))}
                  </div>

                  {/* Marketplace rows */}
                  {Object.entries(filteredTimeline).map(([mp, entries]) => {
                    const schedule = PAYMENT_SCHEDULES.find((s) => s.marketplace === mp);
                    return (
                      <div
                        key={mp}
                        className="grid grid-cols-[140px_repeat(7,1fr)] gap-1 mb-1 group"
                      >
                        {/* Marketplace label */}
                        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-md text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: MP_COLORS[mp] }}
                          >
                            {mp[0]}
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {mp}
                          </span>
                        </div>

                        {/* Day cells */}
                        {entries.map((entry, idx) => {
                          const hasPayment = entry.status !== 'none';
                          return (
                            <div
                              key={idx}
                              className={cn(
                                'flex items-center justify-center rounded-lg p-1.5 min-h-[56px] transition-all duration-200',
                                hasPayment
                                  ? timelineStatusColor[entry.status]
                                  : 'hover:bg-slate-50'
                              )}
                            >
                              {hasPayment ? (
                                <div className="text-center">
                                  <div className="text-[10px] font-semibold leading-tight">
                                    {fmtShort(entry.amount)}
                                  </div>
                                  <div className="text-[9px] opacity-75 mt-0.5">
                                    {entry.status === 'paid'
                                      ? 'Ödendi'
                                      : entry.status === 'expected'
                                        ? 'Bekliyor'
                                        : 'Gecikti'}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-px bg-slate-100" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-slate-500">Ödendi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-amber-400" />
                    <span className="text-xs text-slate-500">Bekleniyor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-red-500" />
                    <span className="text-xs text-slate-500">Gecikmiş</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule Table + Monthly Forecast */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Payment Schedule Table */}
            <Card className="xl:col-span-3 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Ödeme Planı
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Pazaryerlerine göre ödeme periyotları ve beklenen tutarlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">
                          Pazaryeri
                        </th>
                        <th className="text-left py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">
                          Ödeme Periyodu
                        </th>
                        <th className="text-left py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">
                          Son Ödeme
                        </th>
                        <th className="text-right py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">
                          Beklenen Tutar
                        </th>
                        <th className="text-center py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="text-right py-2.5 px-2 font-medium text-slate-500 text-xs uppercase tracking-wider">
                          Gün Kaldı
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map((s) => {
                        const stCfg = STATUS_BADGE[s.status];
                        return (
                          <tr
                            key={s.marketplace}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold shrink-0"
                                  style={{ backgroundColor: s.color }}
                                >
                                  {s.icon}
                                </div>
                                <span className="text-slate-800 font-medium">
                                  {s.marketplace}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-slate-600 hidden md:table-cell">
                              {s.periodLabel}
                            </td>
                            <td className="py-3 px-2 text-slate-500 hidden lg:table-cell">
                              {new Date(s.lastPayment).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="py-3 px-2 text-right font-semibold text-slate-800">
                              {fmt(s.expectedAmount)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] font-semibold px-2 py-0.5 gap-1',
                                  stCfg.className
                                )}
                              >
                                {stCfg.icon}
                                {stCfg.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  s.daysLeft > 0
                                    ? 'text-slate-700'
                                    : s.daysLeft === 0
                                      ? 'text-emerald-600'
                                      : 'text-red-600'
                                )}
                              >
                                {s.daysLeft > 0
                                  ? `${s.daysLeft} gün`
                                  : s.daysLeft === 0
                                    ? 'Bugün'
                                    : `${Math.abs(s.daysLeft)} gün`}
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

            {/* Monthly Forecast Chart */}
            <Card className="xl:col-span-2 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Aylık Nakit Akış Tahmini
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Pazaryerlerine göre 6 aylık gelir tahmini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MONTHLY_FORECAST.map((m) => (
                    <div key={m.month} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 w-8">{m.month}</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {fmt(m.total)}
                        </span>
                      </div>
                      {/* Stacked bar */}
                      <div className="flex h-6 rounded-md overflow-hidden bg-slate-100">
                        {[
                          { amount: m.trendyol, color: MP_COLORS['Trendyol'] },
                          { amount: m.hepsiburada, color: MP_COLORS['Hepsiburada'] },
                          { amount: m.n11, color: MP_COLORS['n11'] },
                          { amount: m.amazonTr, color: MP_COLORS['Amazon TR'] },
                        ].map((seg, idx) => (
                          <div
                            key={idx}
                            className="h-full transition-all duration-500 ease-out"
                            style={{
                              width: `${(seg.amount / m.total) * 100}%`,
                              backgroundColor: seg.color,
                              opacity: 0.85,
                            }}
                            title={`${MARKETPLACES[idx]}: ${fmt(seg.amount)}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    {MARKETPLACES.map((mp) => (
                      <div key={mp} className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: MP_COLORS[mp] }}
                        />
                        <span className="text-[11px] text-slate-500">{mp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2 — Ödeme Takvimi                                       */}
        {/* ============================================================ */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Detailed Timeline */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800">
                    Detaylı Ödeme Takvimi
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    30 günlük ödeme tahmini zaman çizelgesi
                  </CardDescription>
                </div>
                <Select value={filterMp} onValueChange={setFilterMp}>
                  <SelectTrigger size="sm" className="w-[160px]">
                    <SelectValue placeholder="Pazaryeri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="Trendyol">Trendyol</SelectItem>
                    <SelectItem value="Hepsiburada">Hepsiburada</SelectItem>
                    <SelectItem value="n11">n11</SelectItem>
                    <SelectItem value="Amazon TR">Amazon TR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Upcoming payments list */}
              <div className="space-y-3">
                {PAYMENT_SCHEDULES.filter(
                  (s) => filterMp === 'all' || s.marketplace === filterMp
                ).map((schedule) => {
                  const nextPayments = generateNextPayments(schedule);
                  return (
                    <div key={schedule.marketplace} className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold"
                          style={{ backgroundColor: schedule.color }}
                        >
                          {schedule.icon}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {schedule.marketplace}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-slate-500 ml-1"
                        >
                          {schedule.periodLabel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-9">
                        {nextPayments.map((payment, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'rounded-lg border p-3 transition-all duration-200 hover:shadow-sm',
                              payment.status === 'paid'
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : payment.status === 'overdue'
                                  ? 'border-red-200 bg-red-50/50'
                                  : 'border-slate-200 bg-white'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-500">
                                {payment.dateLabel}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[9px] px-1.5 py-0 gap-0.5',
                                  STATUS_BADGE[payment.status].className
                                )}
                              >
                                {STATUS_BADGE[payment.status].label}
                              </Badge>
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                              {fmt(payment.amount)}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ~{payment.estimatedOrders} sipariş
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule Overview Table */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">
                Ödeme Periyotları Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Pazaryeri
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Ödeme Periyodu
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Ortalama Tutar
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Son Ödeme
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Beklenen Tutar
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Gün Kaldı
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((s) => {
                      const stCfg = STATUS_BADGE[s.status];
                      const avgAmount =
                        s.marketplace === 'Trendyol'
                          ? 295650
                          : s.marketplace === 'Hepsiburada'
                            ? 195800
                            : s.marketplace === 'n11'
                              ? 150100
                              : 92975;
                      return (
                        <tr
                          key={s.marketplace}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold shrink-0"
                                style={{ backgroundColor: s.color }}
                              >
                                {s.icon}
                              </div>
                              <span className="font-medium text-slate-800">
                                {s.marketplace}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{s.periodLabel}</td>
                          <td className="py-3 px-3 text-slate-600">{fmt(avgAmount)}</td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(s.lastPayment).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {fmt(s.expectedAmount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 gap-1',
                                stCfg.className
                              )}
                            >
                              {stCfg.icon}
                              {stCfg.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={cn(
                                'text-sm font-semibold',
                                s.daysLeft > 0
                                  ? 'text-slate-700'
                                  : s.daysLeft === 0
                                    ? 'text-emerald-600'
                                    : 'text-red-600'
                              )}
                            >
                              {s.daysLeft > 0
                                ? `${s.daysLeft} gün`
                                : s.daysLeft === 0
                                  ? 'Bugün'
                                  : `${Math.abs(s.daysLeft)} gün gecikti`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-800" colSpan={4}>
                        Toplam Beklenen
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700 text-base">
                        {fmt(totalExpected)}
                      </td>
                      <td className="py-3 px-3" />
                      <td className="py-3 px-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3 — Geçmiş Ödemeler                                     */}
        {/* ============================================================ */}
        <TabsContent value="history" className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Tamamlanan Ödeme</p>
                  <p className="text-lg font-bold text-emerald-800">
                    {HISTORICAL_PAYMENTS.filter((p) => p.status === 'completed').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <CircleDollarSign className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Toplam Gelir</p>
                  <p className="text-lg font-bold text-slate-800">
                    {fmt(
                      HISTORICAL_PAYMENTS.filter((p) => p.status === 'completed').reduce(
                        (acc, p) => acc + p.amount,
                        0
                      )
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-600 font-medium">Başarısız Ödeme</p>
                  <p className="text-lg font-bold text-red-800">
                    {HISTORICAL_PAYMENTS.filter((p) => p.status === 'failed').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Table */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">
                Geçmiş Ödeme Kayıtları
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Son 3 aya ait tüm ödeme hareketleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Pazaryeri
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">
                        Dönem
                      </th>
                      <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="text-right py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                        Sipariş
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORICAL_PAYMENTS.filter(
                      (p) => filterMp === 'all' || p.marketplace === filterMp
                    ).map((p) => {
                      const stCfg = STATUS_BADGE[p.status];
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-6 w-6 items-center justify-center rounded-md text-white text-[10px] font-bold shrink-0"
                                style={{
                                  backgroundColor:
                                    MP_COLORS[p.marketplace] || '#64748b',
                                }}
                              >
                                {p.marketplace[0]}
                              </div>
                              <span className="font-medium text-slate-800">
                                {p.marketplace}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {new Date(p.date).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-3 text-slate-500 hidden md:table-cell">
                            {p.period}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-800">
                            {fmt(p.amount)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500 hidden sm:table-cell">
                            {p.orderCount}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 gap-1',
                                stCfg.className
                              )}
                            >
                              {stCfg.icon}
                              {stCfg.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 4 — Ayarlar                                             */}
        {/* ============================================================ */}
        <TabsContent value="settings" className="space-y-6">
          {/* Payment Periods */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Ödeme Periyotları
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Her pazaryeri için ödeme dönemi yapılandırması
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'trendyolPeriod' as const, label: 'Trendyol', color: MP_COLORS['Trendyol'] },
                { key: 'hepsiburadaPeriod' as const, label: 'Hepsiburada', color: MP_COLORS['Hepsiburada'] },
                { key: 'n11Period' as const, label: 'n11', color: MP_COLORS['n11'] },
                { key: 'amazonPeriod' as const, label: 'Amazon TR', color: MP_COLORS['Amazon TR'] },
              ].map((mp) => (
                <div
                  key={mp.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold"
                      style={{ backgroundColor: mp.color }}
                    >
                      {mp.label[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{mp.label}</span>
                  </div>
                  <Select
                    value={settings[mp.key]}
                    onValueChange={(v) => setSettings((prev) => ({ ...prev, [mp.key]: v }))}
                  >
                    <SelectTrigger size="sm" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haftalık">Haftalık</SelectItem>
                      <SelectItem value="15 günlük">15 Günlük</SelectItem>
                      <SelectItem value="biweekly">İki Haftalık</SelectItem>
                      <SelectItem value="aylık">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bank Accounts */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Banka Hesapları
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Ödemelerin aktarılacağı banka hesapları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Ziraat Bankası</p>
                      <p className="text-xs text-slate-400">TL Hesabı</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                    Varsayılan
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[11px] text-slate-400 uppercase tracking-wider">
                      IBAN
                    </Label>
                    <Input
                      value={settings.bankAccount}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, bankAccount: e.target.value }))
                      }
                      className="mt-1 font-mono text-sm h-9"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-400 uppercase tracking-wider">
                      Hesap Sahibi
                    </Label>
                    <Input
                      defaultValue="PazarLogic E-Ticaret A.Ş."
                      className="mt-1 text-sm h-9"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Yeni hesap eklemek için banka entegrasyonunu kullanın</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Bildirim Tercihleri
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Ödeme bildirimlerinin nasıl ve ne zaman gönderileceğini yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    key: 'notifyEmail' as const,
                    label: 'E-posta Bildirimleri',
                    desc: 'Ödeme bildirimlerini e-posta ile alın',
                    icon: <Bell className="h-4 w-4 text-slate-400" />,
                  },
                  {
                    key: 'notifySms' as const,
                    label: 'SMS Bildirimleri',
                    desc: 'Kritik ödeme bildirimlerini SMS ile alın',
                    icon: <BellRing className="h-4 w-4 text-slate-400" />,
                  },
                  {
                    key: 'notifyOverdue' as const,
                    label: 'Gecikme Uyarıları',
                    desc: 'Geciken ödemeler için acil uyarı gönder',
                    icon: <AlertTriangle className="h-4 w-4 text-slate-400" />,
                  },
                  {
                    key: 'notifyBefore' as const,
                    label: 'Önceden Hatırlatma',
                    desc: 'Ödeme tarihinden önce hatırlatma gönder',
                    icon: <Clock className="h-4 w-4 text-slate-400" />,
                  },
                  {
                    key: 'autoExport' as const,
                    label: 'Otomatik Dışa Aktarım',
                    desc: 'Ödemeler otomatik olarak Excel dosyasına aktarılsın',
                    icon: <FileSpreadsheet className="h-4 w-4 text-slate-400" />,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[item.key]}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Days before notification */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Hatırlatma Zamanı
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(settings.notifyDaysBefore)}
                      onValueChange={(v) =>
                        setSettings((prev) => ({ ...prev, notifyDaysBefore: parseInt(v) }))
                      }
                    >
                      <SelectTrigger size="sm" className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 gün önce</SelectItem>
                        <SelectItem value="2">2 gün önce</SelectItem>
                        <SelectItem value="3">3 gün önce</SelectItem>
                        <SelectItem value="5">5 gün önce</SelectItem>
                        <SelectItem value="7">7 gün önce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setSettings({
                  trendyolPeriod: 'haftalık',
                  hepsiburadaPeriod: '15 günlük',
                  n11Period: 'aylık',
                  amazonPeriod: 'biweekly',
                  bankAccount: 'TR33 0006 1005 1978 6457 8413 26',
                  notifyEmail: true,
                  notifySms: false,
                  notifyOverdue: true,
                  notifyBefore: true,
                  notifyDaysBefore: 3,
                  autoExport: false,
                })
              }
            >
              Varsayılana Sıfırla
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Shield className="h-4 w-4 mr-1" />
              Ayarları Kaydet
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface NextPayment {
  dateLabel: string;
  amount: number;
  status: 'paid' | 'expected' | 'overdue';
  estimatedOrders: number;
}

function generateNextPayments(schedule: MarketplacePayment): NextPayment[] {
  const today = new Date();
  const baseAmount = schedule.expectedAmount;
  const variance = 0.15;

  const payments: NextPayment[] = [];

  // Generate 3 next payments based on period
  if (schedule.marketplace === 'Trendyol') {
    // Weekly
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (i * 7) - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      const amount = Math.round(baseAmount * (1 + (Math.random() * variance * 2 - variance)));
      const status = i === 0 ? schedule.status : 'expected';
      payments.push({
        dateLabel: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount,
        status: status as 'paid' | 'expected' | 'overdue',
        estimatedOrders: Math.round(amount / 340),
      });
    }
  } else if (schedule.marketplace === 'Hepsiburada') {
    // Biweekly (15 days)
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (i * 15) + schedule.daysLeft);
      const amount = Math.round(baseAmount * (1 + (Math.random() * variance * 2 - variance)));
      const status = i === 0 ? schedule.status : 'expected';
      payments.push({
        dateLabel: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount,
        status: status as 'paid' | 'expected' | 'overdue',
        estimatedOrders: Math.round(amount / 380),
      });
    }
  } else if (schedule.marketplace === 'n11') {
    // Monthly
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + 1 + i, 0);
      const amount = Math.round(baseAmount * (1 + (Math.random() * variance * 2 - variance)));
      const status = i === 0 ? schedule.status : 'expected';
      payments.push({
        dateLabel: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount,
        status: status as 'paid' | 'expected' | 'overdue',
        estimatedOrders: Math.round(amount / 385),
      });
    }
  } else {
    // Amazon TR - biweekly
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (i * 14));
      const amount = Math.round(baseAmount * (1 + (Math.random() * variance * 2 - variance)));
      const status = i === 0 ? schedule.status : 'expected';
      payments.push({
        dateLabel: d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount,
        status: status as 'paid' | 'expected' | 'overdue',
        estimatedOrders: Math.round(amount / 495),
      });
    }
  }

  return payments;
}
